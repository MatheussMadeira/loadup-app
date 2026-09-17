import { DayOfWeek, DayType, Exercise } from "./trainingSheet";

/** Status retornado pelo backend para a sessão do dia */
export type CalendarSessionStatus = "recorded" | "skipped" | "pending" | null;

/** Mantida para compatibilidade com componentes legados */
export type CalendarDayStatus = "completed" | "skipped" | "pending" | "rest";

/** Formato real retornado pelo backend em /calendar/week e /calendar?year=&month= */
export interface CalendarDay {
  date: string;
  dayOfWeek: DayOfWeek;
  /** Planejamento do dia no training sheet: "training" | "rest" */
  plannedStatus: DayType;
  /** Status da sessão registrada: "recorded" | "skipped" | "pending" | null */
  sessionStatus: CalendarSessionStatus;
  exerciseCount?: number;
}

/** Formato real retornado pelo backend em /calendar/today */
export interface TodayCalendar {
  date: string;
  dayOfWeek: DayOfWeek;
  plannedWorkout: {
    status: DayType;
    exercises: Exercise[];
  } | null;
  recordedSession: {
    _id: string;
    status: string;
    recordCount: number;
  } | null;
}

/** Registro individual retornado pelo GET /calendar/:date */
export interface DayRecord {
  exerciseName: string;
  seriesType: string;
  seriesOrder: number;
  weight: number;
  repsCompleted: number;
  restTime: number;
}

/** Detalhes completos de um dia: GET /calendar/:dateString */
export interface DayDetails {
  date: string;
  dayOfWeek: DayOfWeek;
  plannedWorkout: {
    status: DayType;
    exercises: Exercise[];
  } | null;
  recordedSession: {
    _id: string;
    status: string;
    activeSeconds: number;
    records: DayRecord[];
  } | null;
}

export interface MonthlyCalendar {
  year: number;
  month: number;
  monthName?: string;
  days: CalendarDay[];
}

export interface WeeklyCalendar {
  weekStart: string;
  weekEnd: string;
  days: CalendarDay[];
}
