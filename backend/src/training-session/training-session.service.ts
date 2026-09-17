import {
  ConflictException,
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { TrainingSession, TrainingSessionDocument } from './schemas/training-session.schema';
import { SessionRecord } from './schemas/session-record.schema';
import {
  TrainingSheet,
  TrainingSheetDocument,
} from '../training-sheet/schemas/training-sheet.schema';
import { PlateauAlert, PlateauAlertDocument } from '../plateau/schemas/plateau-alert.schema';
import { PlateauService } from '../plateau/plateau.service';
import { PlateauAlertItemDto } from '../plateau/dto/plateau-alert.dto';
import { getDayOfWeek, getSaoPauloStartOfDayUtc } from '../common/utils/timezone.util';
import { toObjectId } from '../common/utils/object-id.util';
import { EventEmitter2 } from '@nestjs/event-emitter';

export type RepRangeAlertType = 'exceeded' | 'below_min';

export interface RepRangeAlert {
  alertType: RepRangeAlertType;
  exerciseName: string;
  repsMin: number;
  repsMax: number;
}

export interface SessionCompletedEvent {
  userId: string;
  sessionId: string;
  dayOfWeek: string;
  records: SessionRecord[];
}

@Injectable()
export class TrainingSessionService {
  constructor(
    @InjectModel(TrainingSession.name)
    private readonly trainingSessionModel: Model<TrainingSessionDocument>,
    @InjectModel(TrainingSheet.name)
    private readonly trainingSheetModel: Model<TrainingSheetDocument>,
    @InjectModel(PlateauAlert.name)
    private readonly plateauAlertModel: Model<PlateauAlertDocument>,
    private readonly plateauService: PlateauService,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  async createTrainingSession(userId: string, dateString?: string) {
    const sheet = await this.trainingSheetModel.findOne({ userId: toObjectId(userId) }).exec();
    if (!sheet) {
      throw new NotFoundException('Training sheet not found');
    }
    const date = getSaoPauloStartOfDayUtc(dateString ? new Date(dateString) : new Date());
    if (date > new Date()) {
      throw new BadRequestException('Future dates are not allowed');
    }
    const existing = await this.trainingSessionModel
      .findOne({ userId: toObjectId(userId), date })
      .exec();
    if (existing) {
      throw new ConflictException('Session already exists for this date');
    }
    const session = new this.trainingSessionModel({
      userId: toObjectId(userId),
      date,
      dayOfWeek: getDayOfWeek(date),
      status: 'partial',
      records: [],
    });
    return session.save();
  }

  async getTrainingSession(userId: string, sessionId: string) {
    const session = await this.trainingSessionModel
      .findOne({ _id: toObjectId(sessionId), userId: toObjectId(userId) })
      .exec();
    if (!session) {
      throw new NotFoundException('Session not found');
    }
    return session;
  }

  private normalizeSeries(s: any): { repsMin: number; repsMax: number } {
    const min = s.repsMin ?? s.reps ?? 1;
    const max = s.repsMax ?? s.reps ?? 1;
    return { repsMin: min, repsMax: max };
  }

  private async checkRepRangeAlert(
    userId: string,
    session: TrainingSessionDocument,
    exerciseName: string,
  ): Promise<RepRangeAlert | null> {
    if (!session.dayOfWeek) return null;

    const sheet = await this.trainingSheetModel
      .findOne({ userId: toObjectId(userId) })
      .lean()
      .exec();
    if (!sheet) return null;

    const day = sheet.days.find((d: any) => d.dayOfWeek === session.dayOfWeek);
    if (!day) return null;

    const exercise = day.exercises.find((ex: any) => ex.name === exerciseName);
    if (!exercise) return null;

    const workingSeries: Array<{ order: number; repsMin: number; repsMax: number }> = exercise.series
      .filter((s: any) => s.type === 'working')
      .map((s: any) => ({ order: s.order, ...this.normalizeSeries(s) }));

    if (workingSeries.length === 0) return null;

    const sessionWorkingRecords = (session.records as any[]).filter(
      (r: any) => r.exerciseName === exerciseName && r.seriesType === 'working',
    );

    // Fire as soon as a consistent signal shows up in 2 working series (or in
    // the only one, for single-series exercises) instead of waiting for every
    // working series of the exercise to be logged — otherwise the alert only
    // surfaces once the exercise (often the last one) is fully done, racing
    // with the end-of-workout completion flow.
    const alertThreshold = Math.min(2, workingSeries.length);

    const exceededCount = workingSeries.filter((ws) => {
      const record = sessionWorkingRecords.find((r: any) => r.seriesOrder === ws.order);
      return record && record.repsCompleted > ws.repsMax;
    }).length;

    if (exceededCount === alertThreshold) {
      const first = workingSeries[0];
      return { alertType: 'exceeded', exerciseName, repsMin: first.repsMin, repsMax: first.repsMax };
    }

    const belowCount = workingSeries.filter((ws) => {
      const record = sessionWorkingRecords.find((r: any) => r.seriesOrder === ws.order);
      return record && record.repsCompleted < ws.repsMin;
    }).length;

    if (belowCount === alertThreshold) {
      const first = workingSeries[0];
      return { alertType: 'below_min', exerciseName, repsMin: first.repsMin, repsMax: first.repsMax };
    }

    return null;
  }

  async addRecordToSession(
    userId: string,
    sessionId: string,
    payload: {
      exerciseName: string;
      seriesType: 'warm-up' | 'adjustment' | 'working';
      seriesOrder: number;
      weight: number;
      repsCompleted: number;
      restTime: number;
    },
  ): Promise<{
    session: TrainingSessionDocument;
    repRangeAlert: RepRangeAlert | null;
    plateauAlert: PlateauAlertItemDto | null;
  }> {
    const session = await this.getTrainingSession(userId, sessionId);
    if (session.status === 'skipped') {
      throw new ConflictException('Cannot record sets for a skipped session');
    }
    session.records.push({
      exerciseName: payload.exerciseName,
      seriesType: payload.seriesType,
      seriesOrder: payload.seriesOrder,
      weight: payload.weight,
      repsCompleted: payload.repsCompleted,
      restTime: payload.restTime,
    });
    const saved = await session.save();

    const repRangeAlert = payload.seriesType === 'working'
      ? await this.checkRepRangeAlert(userId, saved, payload.exerciseName)
      : null;

    const plateauAlert = payload.seriesType === 'working'
      ? await this.plateauService.checkExerciseOnRecord(userId, payload.exerciseName)
      : null;

    return { session: saved, repRangeAlert, plateauAlert };
  }

  async updateSessionRecord(
    userId: string,
    sessionId: string,
    recordId: string,
    payload: { weight?: number; repsCompleted?: number; restTime?: number },
  ) {
    const session = await this.getTrainingSession(userId, sessionId);
    const record = (session.records as any[]).find((r: any) => r._id?.toString() === recordId);
    if (!record) {
      throw new NotFoundException('Record not found');
    }
    if (payload.weight !== undefined) {
      record.weight = payload.weight;
    }
    if (payload.repsCompleted !== undefined) {
      record.repsCompleted = payload.repsCompleted;
    }
    if (payload.restTime !== undefined) {
      record.restTime = payload.restTime;
    }
    return session.save();
  }

  async deleteSessionRecord(userId: string, sessionId: string, recordId: string) {
    const session = await this.getTrainingSession(userId, sessionId);
    const index = (session.records as any[]).findIndex((r: any) => r._id?.toString() === recordId);
    if (index === -1) {
      throw new NotFoundException('Record not found');
    }
    session.records.splice(index, 1);
    return session.save();
  }

  private async runRepRangeMaxDetection(
    userId: string,
    session: TrainingSessionDocument,
  ): Promise<RepRangeAlert[]> {
    const sheet = await this.trainingSheetModel
      .findOne({ userId: toObjectId(userId) })
      .lean()
      .exec();
    if (!sheet) return [];

    const day = sheet.days.find((d: any) => d.dayOfWeek === session.dayOfWeek);
    if (!day) return [];

    const pastSessions = await this.trainingSessionModel
      .find({
        userId: toObjectId(userId),
        dayOfWeek: session.dayOfWeek,
        status: 'completed',
        _id: { $ne: session._id },
      })
      .sort({ date: -1 })
      .limit(1)
      .lean()
      .exec();

    if (pastSessions.length === 0) return [];
    const prevSession = pastSessions[0];

    const alerts: RepRangeAlert[] = [];

    for (const exercise of day.exercises) {
      const workingSeries: Array<{ order: number; repsMin: number; repsMax: number }> = exercise.series
        .filter((s: any) => s.type === 'working')
        .map((s: any) => ({ order: s.order, ...this.normalizeSeries(s) }));

      if (workingSeries.length === 0) continue;

      const currentRecords = (session.records as any[]).filter(
        (r: any) => r.exerciseName === exercise.name && r.seriesType === 'working',
      );
      const prevRecords = ((prevSession.records as any[]) ?? []).filter(
        (r: any) => r.exerciseName === exercise.name && r.seriesType === 'working',
      );

      if (currentRecords.length < workingSeries.length || prevRecords.length < workingSeries.length) {
        continue;
      }

      const allAtMaxCurrent = workingSeries.every((ws) => {
        const r = currentRecords.find((rec: any) => rec.seriesOrder === ws.order);
        return r && r.repsCompleted >= ws.repsMax;
      });

      const allAtMaxPrev = workingSeries.every((ws) => {
        const r = prevRecords.find((rec: any) => rec.seriesOrder === ws.order);
        return r && r.repsCompleted >= ws.repsMax;
      });

      if (allAtMaxCurrent && allAtMaxPrev) {
        const first = workingSeries[0];
        alerts.push({
          alertType: 'exceeded',
          exerciseName: exercise.name,
          repsMin: first.repsMin,
          repsMax: first.repsMax,
        });

        await this.plateauAlertModel
          .findOneAndUpdate(
            { userId: toObjectId(userId), exerciseName: exercise.name, alertType: 'rep-range-max' },
            {
              $set: {
                dayOfWeek: session.dayOfWeek,
                suggestion: `Você atingiu o máximo de ${first.repsMax} reps em todas as séries por 2 treinos consecutivos. Considere aumentar o peso.`,
                sessionCount: 2,
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

    return alerts;
  }

  private accumulateActiveTime(session: TrainingSessionDocument) {
    if (session.status === 'active' && session.lastResumedAt) {
      const elapsedSeconds = Math.floor(
        (Date.now() - session.lastResumedAt.getTime()) / 1000,
      );
      session.activeSeconds = (session.activeSeconds ?? 0) + Math.max(0, elapsedSeconds);
      session.lastResumedAt = undefined;
    }
  }

  async startSession(userId: string, sessionId: string) {
    const session = await this.getTrainingSession(userId, sessionId);
    if (session.status === 'completed' || session.status === 'skipped') {
      throw new ConflictException('Cannot start a finished session');
    }
    if (session.status !== 'active') {
      session.status = 'active';
      session.lastResumedAt = new Date();
      if (!session.startedAt) {
        session.startedAt = new Date();
      }
      await session.save();
    }
    return session;
  }

  async pauseSession(userId: string, sessionId: string) {
    const session = await this.getTrainingSession(userId, sessionId);
    if (session.status === 'active') {
      this.accumulateActiveTime(session);
      session.status = 'partial';
      await session.save();
    }
    return session;
  }

  async completeSession(
    userId: string,
    sessionId: string,
    status: 'completed' | 'skipped',
  ): Promise<{ session: TrainingSessionDocument; repRangeAlerts: RepRangeAlert[] }> {
    const session = await this.getTrainingSession(userId, sessionId);

    this.accumulateActiveTime(session);

    session.status = status;

    if (status === 'completed') {
      session.completedAt = new Date();
    }
    const saved = await session.save();

    let repRangeAlerts: RepRangeAlert[] = [];
    if (status === 'completed') {
      repRangeAlerts = await this.runRepRangeMaxDetection(userId, saved);
      this.eventEmitter.emit('session.completed', {
        userId,
        sessionId,
        dayOfWeek: session.dayOfWeek,
        records: saved.records,
      } satisfies SessionCompletedEvent);
    }

    return { session: saved, repRangeAlerts };
  }

  async getTodaySession(userId: string) {
    const date = getSaoPauloStartOfDayUtc(new Date());
    let session = await this.trainingSessionModel
      .findOne({ userId: toObjectId(userId), date })
      .exec();
    if (!session) {
      session = await this.createTrainingSession(userId, new Date().toISOString());
    }
    return session;
  }
}
