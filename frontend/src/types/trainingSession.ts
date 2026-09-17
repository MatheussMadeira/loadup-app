import { SeriesType } from "./trainingSheet";
import { PlateauAlert } from "./plateau";

export type SessionStatus = "partial" | "active" | "completed" | "skipped";

export type RepRangeAlertType = "exceeded" | "below_min";

export interface RepRangeAlert {
  alertType: RepRangeAlertType;
  exerciseName: string;
  repsMin: number;
  repsMax: number;
}

export interface LoggedSet {
  _id: string;
  exerciseName: string;
  seriesType: SeriesType;
  seriesOrder: number;
  weight: number;
  repsCompleted: number;
  restTime: number;
}

export interface TrainingSession {
  _id: string;
  userId: string;
  date: string;
  dayOfWeek: string;
  status: SessionStatus;
  records: LoggedSet[];
  createdAt: string;
  updatedAt: string;
  completedAt?: string;
  startedAt?: string;
  activeSeconds: number;
  lastResumedAt?: string | null;
}

export interface AddRecordPayload {
  exerciseName: string;
  seriesType: SeriesType;
  seriesOrder: number;
  weight: number;
  repsCompleted: number;
  restTime: number;
}

export interface AddRecordResponse {
  session: TrainingSession;
  repRangeAlert: RepRangeAlert | null;
  plateauAlert: PlateauAlert | null;
}

export interface CompleteSessionResponse {
  session: TrainingSession;
  repRangeAlerts: RepRangeAlert[];
}

export interface UpdateRecordPayload {
  exerciseName?: string;
  seriesType?: SeriesType;
  seriesOrder?: number;
  weight?: number;
  repsCompleted?: number;
  restTime?: number;
}

export interface CompleteSessionPayload {
  status: "completed" | "skipped";
}
