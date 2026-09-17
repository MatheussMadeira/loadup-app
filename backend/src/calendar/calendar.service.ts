import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { addDays, formatISO, eachDayOfInterval, endOfMonth, startOfMonth } from 'date-fns';
import {
  TrainingSheet,
  TrainingSheetDocument,
} from '../training-sheet/schemas/training-sheet.schema';
import {
  TrainingSession,
  TrainingSessionDocument,
} from '../training-session/schemas/training-session.schema';
import { getDayOfWeek, getSaoPauloStartOfDayUtc } from '../common/utils/timezone.util';
import { toObjectId } from '../common/utils/object-id.util';

@Injectable()
export class CalendarService {
  constructor(
    @InjectModel(TrainingSheet.name)
    private readonly trainingSheetModel: Model<TrainingSheetDocument>,
    @InjectModel(TrainingSession.name)
    private readonly trainingSessionModel: Model<TrainingSessionDocument>,
  ) {}

  private getDay(sheet: TrainingSheetDocument, dayOfWeek: string) {
    const day = sheet.days.find((d) => d.dayOfWeek === dayOfWeek);
    if (!day) {
      throw new NotFoundException('Day not found');
    }
    return day;
  }

  private getSessionStatus(session: TrainingSessionDocument | undefined) {
    if (!session) {
      return null;
    }
    if (session.status === 'completed') {
      return 'recorded';
    }
    if (session.status === 'skipped') {
      return 'skipped';
    }
    return 'pending';
  }

  async getTodayView(userId: string) {
    const sheet = await this.trainingSheetModel.findOne({ userId: toObjectId(userId) }).exec();
    if (!sheet) {
      throw new NotFoundException('Training sheet not found');
    }
    const date = getSaoPauloStartOfDayUtc(new Date());
    const dayOfWeek = getDayOfWeek(date);
    const dayData = this.getDay(sheet, dayOfWeek);
    const session = await this.trainingSessionModel
      .findOne({ userId: toObjectId(userId), date })
      .exec();
    return {
      date: formatISO(date),
      dayOfWeek,
      plannedWorkout:
        dayData.status === 'training'
          ? {
              status: dayData.status,
              exercises: dayData.exercises.map((ex) => ({
                name: ex.name,
                muscleGroup: ex.muscleGroup,
                series: ex.series.map((series) => ({
                  type: series.type,
                  repsMin: series.repsMin,
                  repsMax: series.repsMax,
                  order: series.order,
                })),
              })),
            }
          : null,
      recordedSession: session
        ? {
            _id: session._id.toString(),
            status: session.status,
            recordCount: session.records.length,
          }
        : null,
    };
  }

  async getMonthlyView(userId: string, year: number, month: number) {
    const sheet = await this.trainingSheetModel.findOne({ userId: toObjectId(userId) }).exec();
    if (!sheet) {
      throw new NotFoundException('Training sheet not found');
    }
    if (month < 1 || month > 12) {
      throw new BadRequestException('Invalid month');
    }
    const first = startOfMonth(new Date(year, month - 1, 1));
    const last = endOfMonth(first);
    const days = eachDayOfInterval({ start: first, end: last });
    const sessions = await this.trainingSessionModel
      .find({
        userId: toObjectId(userId),
        date: { $gte: getSaoPauloStartOfDayUtc(first), $lte: getSaoPauloStartOfDayUtc(last) },
      })
      .exec();
    const sessionByDate = new Map<string, TrainingSessionDocument>();
    sessions.forEach((session) => {
      sessionByDate.set(formatISO(session.date), session);
    });
    return {
      year,
      month,
      monthName: first.toLocaleString('en-US', { month: 'long' }),
      days: days.map((date) => {
        const dayOfWeek = getDayOfWeek(date);
        const dayData = this.getDay(sheet, dayOfWeek);
        const session = sessionByDate.get(formatISO(getSaoPauloStartOfDayUtc(date)));
        return {
          date: formatISO(getSaoPauloStartOfDayUtc(date)),
          dayOfWeek,
          plannedStatus: dayData.status,
          sessionStatus: this.getSessionStatus(session),
          hasWorkout: dayData.status === 'training',
          exerciseCount: dayData.exercises.length,
        };
      }),
    };
  }

  async getDayDetails(userId: string, dateString: string) {
    const sheet = await this.trainingSheetModel.findOne({ userId: toObjectId(userId) }).exec();
    if (!sheet) {
      throw new NotFoundException('Training sheet not found');
    }
    // Append noon time to avoid UTC midnight shifting the date one day back
    const safeDate = /^\d{4}-\d{2}-\d{2}$/.test(dateString)
      ? new Date(`${dateString}T12:00:00`)
      : new Date(dateString);
    const date = getSaoPauloStartOfDayUtc(safeDate);
    const dayOfWeek = getDayOfWeek(date);
    const dayData = this.getDay(sheet, dayOfWeek);
    const session = await this.trainingSessionModel
      .findOne({ userId: toObjectId(userId), date })
      .exec();
    return {
      date: formatISO(date),
      dayOfWeek,
      plannedWorkout:
        dayData.status === 'training'
          ? {
              status: dayData.status,
              exercises: dayData.exercises.map((ex) => ({
                _id: ex._id,
                name: ex.name,
                muscleGroup: ex.muscleGroup,
                series: ex.series.map((series) => ({
                  type: series.type,
                  repsMin: series.repsMin,
                  repsMax: series.repsMax,
                  order: series.order,
                })),
              })),
            }
          : null,
      recordedSession: session
        ? {
            _id: session._id.toString(),
            status: session.status,
            activeSeconds: session.activeSeconds,
            records: [...session.records]
              .sort((a, b) => a.seriesOrder - b.seriesOrder)
              .map((record) => ({
                exerciseName: record.exerciseName,
                seriesType: record.seriesType,
                seriesOrder: record.seriesOrder,
                weight: record.weight,
                repsCompleted: record.repsCompleted,
                restTime: record.restTime,
              })),
          }
        : null,
    };
  }

  async getWeeklyView(userId: string, dateString?: string) {
    const sheet = await this.trainingSheetModel.findOne({ userId: toObjectId(userId) }).exec();
    if (!sheet) {
      throw new NotFoundException('Training sheet not found');
    }
    const date = dateString
      ? getSaoPauloStartOfDayUtc(
          /^\d{4}-\d{2}-\d{2}$/.test(dateString)
            ? new Date(`${dateString}T12:00:00`)
            : new Date(dateString),
        )
      : getSaoPauloStartOfDayUtc(new Date());
    const dayOfWeek = [
      'sunday',
      'monday',
      'tuesday',
      'wednesday',
      'thursday',
      'friday',
      'saturday',
    ].indexOf(getDayOfWeek(date));
    const monday = addDays(date, dayOfWeek === 0 ? -6 : 1 - dayOfWeek);
    const weekDays = Array.from({ length: 7 }).map((_, index) => addDays(monday, index));
    const sessions = await this.trainingSessionModel
      .find({
        userId: toObjectId(userId),
        date: {
          $gte: getSaoPauloStartOfDayUtc(weekDays[0]),
          $lte: getSaoPauloStartOfDayUtc(weekDays[6]),
        },
      })
      .exec();
    const sessionByDate = new Map<string, TrainingSessionDocument>();
    sessions.forEach((session) => {
      sessionByDate.set(formatISO(session.date), session);
    });
    return {
      weekStart: formatISO(getSaoPauloStartOfDayUtc(weekDays[0])),
      weekEnd: formatISO(getSaoPauloStartOfDayUtc(weekDays[6])),
      days: weekDays.map((dateItem) => {
        const dayOfWeekName = getDayOfWeek(dateItem);
        const dayData = this.getDay(sheet, dayOfWeekName);
        const session = sessionByDate.get(formatISO(getSaoPauloStartOfDayUtc(dateItem)));
        return {
          date: formatISO(getSaoPauloStartOfDayUtc(dateItem)),
          dayOfWeek: dayOfWeekName,
          plannedStatus: dayData.status,
          sessionStatus: this.getSessionStatus(session),
          exerciseCount: dayData.exercises.length,
        };
      }),
    };
  }

  async markDayStatus(
    userId: string,
    dateString: string,
    action: 'completed' | 'skipped' | 'reset',
  ) {
    const sheet = await this.trainingSheetModel.findOne({ userId: toObjectId(userId) }).exec();
    if (!sheet) {
      throw new NotFoundException('Training sheet not found');
    }
    const date = getSaoPauloStartOfDayUtc(
      /^\d{4}-\d{2}-\d{2}$/.test(dateString)
        ? new Date(`${dateString}T12:00:00`)
        : new Date(dateString),
    );
    const dayOfWeek = getDayOfWeek(date);
    this.getDay(sheet, dayOfWeek);
    let session = await this.trainingSessionModel
      .findOne({ userId: toObjectId(userId), date })
      .exec();
    if (!session) {
      session = new this.trainingSessionModel({
        userId: toObjectId(userId),
        date,
        dayOfWeek,
        status: 'partial',
        records: [],
      });
    }
    if (action === 'completed' || action === 'skipped') {
      session.status = action;
    } else if (action === 'reset') {
      session.status = 'partial';
    } else {
      throw new BadRequestException('Invalid action');
    }
    const savedSession = await session.save();
    const sessionStatus =
      savedSession.status === 'completed'
        ? 'completed'
        : savedSession.status === 'skipped'
          ? 'skipped'
          : 'pending';
    return {
      date: formatISO(date),
      dayOfWeek,
      sessionStatus,
      updatedAt: formatISO((savedSession as any).updatedAt ?? new Date()),
    };
  }
}
