import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import {
  TrainingSheet,
  TrainingSheetDocument,
} from '../training-sheet/schemas/training-sheet.schema';
import { toObjectId } from '../common/utils/object-id.util';

@Injectable()
export class ExercisesService {
  constructor(
    @InjectModel(TrainingSheet.name)
    private readonly trainingSheetModel: Model<TrainingSheetDocument>,
  ) {}

  private getDay(sheet: TrainingSheetDocument, dayOfWeek: string) {
    const day = sheet.days.find((d) => d.dayOfWeek === dayOfWeek);
    if (!day) {
      throw new NotFoundException('Day not found');
    }
    return day;
  }

  async addExerciseToDay(
    userId: string,
    dayOfWeek: string,
    payload: {
      name: string;
      muscleGroup: string;
      series: { type: 'warm-up' | 'adjustment' | 'working'; repsMin: number; repsMax: number; restTime?: number }[];
      videoUrl?: string;
      tip?: string;
    },
  ) {
    const sheet = await this.trainingSheetModel.findOne({ userId: toObjectId(userId) }).exec();
    if (!sheet) {
      throw new NotFoundException('Training sheet not found');
    }
    const day = this.getDay(sheet, dayOfWeek);
    if (day.status === 'rest') {
      throw new ConflictException('Cannot add exercises to a rest day');
    }
    const exercise = {
      _id: new Types.ObjectId().toHexString(),
      name: payload.name,
      muscleGroup: payload.muscleGroup,
      order: day.exercises.length + 1,
      series: payload.series.map((entry, index) => ({ ...entry, order: index + 1 })),
      database: false,
      ...(payload.videoUrl && { videoUrl: payload.videoUrl }),
      ...(payload.tip && { tip: payload.tip }),
    };
    day.exercises.push(exercise);
    sheet.markModified('days');
    await sheet.save();
    return exercise;
  }

  async getExercisesForDay(userId: string, dayOfWeek: string) {
    const sheet = await this.trainingSheetModel.findOne({ userId: toObjectId(userId) }).exec();
    if (!sheet) {
      throw new NotFoundException('Training sheet not found');
    }
    const day = this.getDay(sheet, dayOfWeek);
    return day.exercises;
  }

  async getExerciseById(userId: string, dayOfWeek: string, exerciseId: string) {
    const sheet = await this.trainingSheetModel.findOne({ userId: toObjectId(userId) }).exec();
    if (!sheet) {
      throw new NotFoundException('Training sheet not found');
    }
    const day = this.getDay(sheet, dayOfWeek);
    const exercise = day.exercises.find((ex) => ex._id === exerciseId);
    if (!exercise) {
      throw new NotFoundException('Exercise not found');
    }
    return exercise;
  }

  async updateExerciseInDay(
    userId: string,
    dayOfWeek: string,
    exerciseId: string,
    payload: {
      name?: string;
      muscleGroup?: string;
      series?: { type: 'warm-up' | 'adjustment' | 'working'; repsMin: number; repsMax: number; restTime?: number }[];
      videoUrl?: string;
      tip?: string;
    },
  ) {
    const sheet = await this.trainingSheetModel.findOne({ userId: toObjectId(userId) }).exec();
    if (!sheet) {
      throw new NotFoundException('Training sheet not found');
    }
    const day = this.getDay(sheet, dayOfWeek);
    const exercise = day.exercises.find((ex) => ex._id === exerciseId);
    if (!exercise) {
      throw new NotFoundException('Exercise not found');
    }
    if (payload.name) {
      exercise.name = payload.name;
    }
    if (payload.muscleGroup) {
      exercise.muscleGroup = payload.muscleGroup;
    }
    if (payload.series) {
      exercise.series = payload.series.map((entry, index) => ({ ...entry, order: index + 1 }));
    }
    if (payload.videoUrl !== undefined) {
      exercise.videoUrl = payload.videoUrl;
    }
    if (payload.tip !== undefined) {
      exercise.tip = payload.tip;
    }
    sheet.markModified('days');
    await sheet.save();
    return exercise;
  }

  async updateSuggestedWeight(
    userId: string,
    dayOfWeek: string,
    exerciseId: string,
    seriesOrder: number,
    suggestedWeight: number | null,
  ) {
    const sheet = await this.trainingSheetModel.findOne({ userId: toObjectId(userId) }).exec();
    if (!sheet) {
      throw new NotFoundException('Training sheet not found');
    }
    const day = this.getDay(sheet, dayOfWeek);
    const exercise = day.exercises.find((ex) => ex._id === exerciseId);
    if (!exercise) {
      throw new NotFoundException('Exercise not found');
    }
    const series = exercise.series.find((s: any) => s.order === seriesOrder);
    if (!series) {
      throw new NotFoundException('Series not found');
    }
    (series as any).suggestedWeight = suggestedWeight ?? undefined;
    sheet.markModified('days');
    await sheet.save();
    return exercise;
  }

  async bulkUpdateSuggestedWeight(
    userId: string,
    dayOfWeek: string,
    exerciseId: string,
    updates: Array<{ seriesOrder: number; suggestedWeight: number | null }>,
    markAsNew = false,
  ) {
    const sheet = await this.trainingSheetModel.findOne({ userId: toObjectId(userId) }).exec();
    if (!sheet) {
      throw new NotFoundException('Training sheet not found');
    }
    const day = this.getDay(sheet, dayOfWeek);
    const exercise = day.exercises.find((ex) => ex._id === exerciseId);
    if (!exercise) {
      throw new NotFoundException('Exercise not found');
    }
    for (const update of updates) {
      const series = exercise.series.find((s: any) => s.order === update.seriesOrder);
      if (series) {
        (series as any).suggestedWeight = update.suggestedWeight ?? undefined;
        (series as any).suggestedWeightIsNew = markAsNew;
      }
    }
    sheet.markModified('days');
    await sheet.save();
    return exercise;
  }

  async updateSeriesSuggestions(
    userId: string,
    dayOfWeek: string,
    exerciseId: string,
    seriesOrder: number,
    suggestions: {
      suggestedWeight?: number | null;
      suggestedReps?: number | null;
      suggestedRestTime?: number | null;
    },
  ) {
    const sheet = await this.trainingSheetModel.findOne({ userId: toObjectId(userId) }).exec();
    if (!sheet) {
      throw new NotFoundException('Training sheet not found');
    }
    const day = this.getDay(sheet, dayOfWeek);
    const exercise = day.exercises.find((ex) => ex._id === exerciseId);
    if (!exercise) {
      throw new NotFoundException('Exercise not found');
    }
    const series = exercise.series.find((s: any) => s.order === seriesOrder);
    if (!series) {
      throw new NotFoundException('Series not found');
    }
    if (suggestions.suggestedWeight !== undefined) {
      (series as any).suggestedWeight = suggestions.suggestedWeight ?? undefined;
      // Peso de verdade registrado nessa série: o badge de "peso novo" (se
      // havia um, de um ajuste de platô) já cumpriu seu papel.
      (series as any).suggestedWeightIsNew = false;
    }
    if (suggestions.suggestedReps !== undefined) {
      (series as any).suggestedReps = suggestions.suggestedReps ?? undefined;
    }
    if (suggestions.suggestedRestTime !== undefined) {
      (series as any).suggestedRestTime = suggestions.suggestedRestTime ?? undefined;
    }
    sheet.markModified('days');
    await sheet.save();
    return exercise;
  }

  /**
   * Sincroniza suggestedWeight/suggestedReps/suggestedRestTime de cada série
   * com o que foi de fato registrado na sessão mais recente concluída,
   * casando por exerciseName + seriesOrder. É a fonte de verdade final —
   * roda depois de terminar o treino, então sobrescreve qualquer sugestão
   * intermediária (ex.: ajuste de RepRangeAlert em séries ainda não feitas).
   */
  async syncSuggestionsFromSession(
    userId: string,
    dayOfWeek: string,
    records: Array<{
      exerciseName: string;
      seriesOrder: number;
      weight: number;
      repsCompleted: number;
      restTime: number;
    }>,
  ) {
    if (!records.length) return;
    const sheet = await this.trainingSheetModel.findOne({ userId: toObjectId(userId) }).exec();
    if (!sheet) return;
    const day = sheet.days.find((d) => d.dayOfWeek === dayOfWeek);
    if (!day) return;

    const normalize = (label: string) => label.trim().toLowerCase();

    for (const record of records) {
      const exercise = day.exercises.find(
        (ex) => normalize(ex.name) === normalize(record.exerciseName),
      );
      if (!exercise) continue;
      const series = exercise.series.find((s: any) => s.order === record.seriesOrder);
      if (!series) continue;

      // Uma série que acabou de disparar um alerta de platô já tem um
      // registro nesta mesma sessão (a detecção só roda depois de salvar o
      // registro) — sem essa checagem, o sync abaixo sobrescreveria o peso
      // recém-confirmado no modal de volta pro peso que já tinha sido feito,
      // no mesmo instante em que a sessão termina.
      if ((series as any).suggestedWeightIsNew) continue;

      (series as any).suggestedWeight = record.weight;
      (series as any).suggestedReps = record.repsCompleted;
      (series as any).suggestedRestTime = record.restTime;
    }
    sheet.markModified('days');
    await sheet.save();
  }

  async reorderExercisesInDay(userId: string, dayOfWeek: string, orderedIds: string[]) {
    const sheet = await this.trainingSheetModel.findOne({ userId: toObjectId(userId) }).exec();
    if (!sheet) {
      throw new NotFoundException('Training sheet not found');
    }
    const day = this.getDay(sheet, dayOfWeek);
    const exerciseMap = new Map(day.exercises.map((ex) => [ex._id, ex]));
    if (orderedIds.length !== day.exercises.length || orderedIds.some((id) => !exerciseMap.has(id))) {
      throw new NotFoundException('Invalid exercise IDs');
    }
    day.exercises = orderedIds.map((id, idx) => ({ ...exerciseMap.get(id)!, order: idx + 1 }));
    sheet.markModified('days');
    await sheet.save();
    return day.exercises;
  }

  async deleteExerciseFromDay(userId: string, dayOfWeek: string, exerciseId: string) {
    const sheet = await this.trainingSheetModel.findOne({ userId: toObjectId(userId) }).exec();
    if (!sheet) {
      throw new NotFoundException('Training sheet not found');
    }
    const day = this.getDay(sheet, dayOfWeek);
    const index = day.exercises.findIndex((ex) => ex._id === exerciseId);
    if (index === -1) {
      throw new NotFoundException('Exercise not found');
    }
    day.exercises.splice(index, 1);
    day.exercises = day.exercises.map((exercise, idx) => ({ ...exercise, order: idx + 1 }));
    sheet.markModified('days');
    await sheet.save();
  }
}
