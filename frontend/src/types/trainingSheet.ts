export type DayOfWeek =
  | "monday"
  | "tuesday"
  | "wednesday"
  | "thursday"
  | "friday"
  | "saturday"
  | "sunday";

export type DayType = "training" | "rest";

export type SeriesType = "warm-up" | "adjustment" | "working";

export type MuscleGroup =
  | "Peito"
  | "Tríceps"
  | "Costas"
  | "Bíceps"
  | "Ombros"
  | "Abdômen"
  | "Perna"
  | "Glúteo"
  | "Trapézio"
  | "Antebraço"
  | "Panturrilha";

export interface Series {
  type: SeriesType;
  repsMin: number;
  repsMax: number;
  restTime?: number;
  suggestedWeight?: number | null;
  suggestedReps?: number | null;
  suggestedRestTime?: number | null;
  suggestedWeightIsNew?: boolean;
}

export interface Exercise {
  _id: string;
  name: string;
  muscleGroup: MuscleGroup;
  series: Series[];
  videoUrl?: string;
  tip?: string;
}

export interface TrainingDay {
  dayOfWeek: DayOfWeek;
  status: DayType;
  exercises: Exercise[];
}

export interface TrainingSheet {
  _id: string;
  userId: string;
  days: TrainingDay[];
  createdAt: string;
  updatedAt: string;
}

export interface SeriesPayload {
  type: SeriesType;
  repsMin: number;
  repsMax: number;
  restTime?: number;
}

export interface CreateExercisePayload {
  name: string;
  muscleGroup: MuscleGroup;
  series: SeriesPayload[];
  videoUrl?: string;
  tip?: string;
}

export interface UpdateExercisePayload {
  name?: string;
  muscleGroup?: MuscleGroup;
  series?: SeriesPayload[];
  videoUrl?: string;
  tip?: string;
}
