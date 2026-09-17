import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { PlateauAlert, PlateauAlertDocument } from './schemas/plateau-alert.schema';
import {
  TrainingSession,
  TrainingSessionDocument,
} from '../training-session/schemas/training-session.schema';
import { PlateauAnalyzer, PlateauAnalysisResult, SessionSnapshot } from './plateau.analyzer';
import { PlateauAlertItemDto, ExercisePlateauStatusDto } from './dto/plateau-alert.dto';
import { toObjectId } from '../common/utils/object-id.util';

// Sugestões padrão para quando não houver sugestão gerada
const DEFAULT_SUGGESTIONS = [
  'Tente aumentar 2.5kg no próximo treino',
  'Tente fazer mais 1 repetição na próxima sessão',
  'Considere reduzir o tempo de descanso entre séries',
  'Tente variar o exercício por 1 semana',
] as const;

@Injectable()
export class PlateauService {
  private readonly logger = new Logger(PlateauService.name);

  constructor(
    @InjectModel(PlateauAlert.name)
    private readonly alertModel: Model<PlateauAlertDocument>,
    @InjectModel(TrainingSession.name)
    private readonly sessionModel: Model<TrainingSessionDocument>,
    private readonly analyzer: PlateauAnalyzer,
  ) {}

  /**
   * Pick a random default suggestion when none is provided
   */
  private getDefaultSuggestion(): string {
    const randomIndex = Math.floor(Math.random() * DEFAULT_SUGGESTIONS.length);
    return DEFAULT_SUGGESTIONS[randomIndex];
  }

  private async upsertExerciseAlert(
    userId: string,
    result: PlateauAnalysisResult,
  ): Promise<PlateauAlertDocument> {
    return this.alertModel
      .findOneAndUpdate(
        { userId: toObjectId(userId), exerciseName: result.exerciseName, alertType: 'exercise' },
        {
          $set: {
            dayOfWeek: result.dayOfWeek,
            suggestion: result.suggestion,
            sessionCount: result.consecutiveCount,
            active: result.isInPlateau,
            resolvedAt: result.isInPlateau ? null : new Date(),
          },
          $setOnInsert: { detectedAt: new Date() },
        },
        { upsert: true, new: true },
      )
      .exec();
  }

  /**
   * Roda a mesma análise de platô, mas restrita a um único exercício, logo
   * apos uma série de trabalho ser registrada — em vez de esperar a sessão
   * inteira terminar (`runDetectionForUser`, abaixo). É o que permite o
   * modal de platô aparecer durante o treino, na hora certa.
   */
  async checkExerciseOnRecord(
    userId: string,
    exerciseName: string,
  ): Promise<PlateauAlertItemDto | null> {
    const sessions = await this.sessionModel
      .find({
        userId: toObjectId(userId),
        'records.exerciseName': exerciseName,
        'records.seriesType': 'working',
      })
      .sort({ date: -1 })
      .limit(30)
      .lean()
      .exec();

    const snapshots: SessionSnapshot[] = [];
    for (const session of sessions) {
      for (const record of session.records ?? []) {
        if (record.seriesType !== 'working' || record.exerciseName !== exerciseName) continue;
        snapshots.push({
          exerciseName: record.exerciseName,
          dayOfWeek: session.dayOfWeek,
          date: session.date,
          weight: record.weight,
          reps: record.repsCompleted,
        });
      }
    }

    const [result] = this.analyzer.analyze(snapshots);
    if (!result) return null;

    const doc = await this.upsertExerciseAlert(userId, result);
    if (!doc.active) return null;

    return {
      _id: doc._id.toString(),
      exerciseName: doc.exerciseName,
      dayOfWeek: doc.dayOfWeek,
      alertType: doc.alertType,
      suggestion: doc.suggestion || this.getDefaultSuggestion(),
      sessionCount: doc.sessionCount,
      detectedAt: doc.detectedAt,
      active: doc.active,
    };
  }

  /** Marca que o modal foi de fato mostrado ao usuário (idempotente). */
  async markPresented(userId: string, alertId: string): Promise<void> {
    await this.alertModel
      .updateOne(
        { _id: toObjectId(alertId), userId: toObjectId(userId), presentedAt: null },
        { $set: { presentedAt: new Date() } },
      )
      .exec();
  }

  /** Usuário confirmou um novo peso a partir do alerta — resolve o platô. */
  async actionAlert(userId: string, alertId: string, weight: number): Promise<void> {
    await this.alertModel
      .updateOne(
        { _id: toObjectId(alertId), userId: toObjectId(userId) },
        {
          $set: {
            active: false,
            resolvedAt: new Date(),
            actionedAt: new Date(),
            actionedWeight: weight,
          },
        },
      )
      .exec();
  }

  async runDetectionForUser(userId: string): Promise<void> {
    const sessions = await this.sessionModel
      .find({ userId: toObjectId(userId) })
      .sort({ date: -1 })
      .lean()
      .exec();

    const snapshots: SessionSnapshot[] = [];
    for (const session of sessions) {
      for (const record of session.records ?? []) {
        if (record.seriesType !== 'working') continue;
        snapshots.push({
          exerciseName: record.exerciseName,
          dayOfWeek: session.dayOfWeek,
          date: session.date,
          weight: record.weight,
          reps: record.repsCompleted,
        });
      }
    }

    const results = this.analyzer.analyze(snapshots);

    for (const result of results) {
      await this.upsertExerciseAlert(userId, result);
    }

    // Day-level aggregation
    const activeExerciseAlerts = await this.alertModel
      .find({ userId: toObjectId(userId), alertType: 'exercise', active: true })
      .lean()
      .exec();

    const dayGroups = new Map<string, number>();
    for (const alert of activeExerciseAlerts) {
      dayGroups.set(alert.dayOfWeek, (dayGroups.get(alert.dayOfWeek) ?? 0) + 1);
    }

    // Upsert day alerts for qualifying days (count >= 2)
    for (const [day, count] of dayGroups) {
      if (count >= 2) {
        await this.alertModel
          .findOneAndUpdate(
            { userId: toObjectId(userId), exerciseName: day, alertType: 'day' },
            {
              $set: {
                dayOfWeek: day,
                suggestion: `Seu treino de ${day} está estagnado — ${count} exercícios sem evolução`,
                sessionCount: 0,
                active: true,
                resolvedAt: null,
              },
              $setOnInsert: { detectedAt: new Date() },
            },
            { upsert: true, new: true },
          )
          .exec();
      }
    }

    // Deactivate day alerts for days that no longer qualify
    await this.alertModel
      .updateMany(
        {
          userId: toObjectId(userId),
          alertType: 'day',
          active: true,
          dayOfWeek: { $nin: [...dayGroups.entries()].filter(([, c]) => c >= 2).map(([d]) => d) },
        },
        { $set: { active: false, resolvedAt: new Date() } },
      )
      .exec();

    this.logger.log(`Plateau detection completed for user ${userId}`);
  }

  async getActiveAlerts(userId: string): Promise<PlateauAlertItemDto[]> {
    const docs = await this.alertModel
      .find({ userId: toObjectId(userId), active: true })
      .lean()
      .exec();

    return docs.map((doc) => ({
      _id: doc._id.toString(),
      exerciseName: doc.exerciseName,
      dayOfWeek: doc.dayOfWeek,
      alertType: doc.alertType,
      suggestion: doc.suggestion || this.getDefaultSuggestion(),
      sessionCount: doc.sessionCount,
      detectedAt: doc.detectedAt,
      active: doc.active,
    }));
  }

  async getAlertByExercise(
    userId: string,
    exerciseName: string,
  ): Promise<ExercisePlateauStatusDto> {
    const doc = await this.alertModel
      .findOne({ userId: toObjectId(userId), exerciseName, alertType: 'exercise', active: true })
      .lean()
      .exec();

    if (!doc) {
      return { exerciseName, plateau: false, suggestion: null };
    }

    return {
      exerciseName: doc.exerciseName,
      plateau: true,
      suggestion: doc.suggestion,
      dayOfWeek: doc.dayOfWeek,
      alertType: 'exercise',
      sessionCount: doc.sessionCount,
      detectedAt: doc.detectedAt,
    };
  }
}
