import { strings } from "@/constants/strings";
import { DayOfWeek, LoggedSet, SeriesType } from "@/types";

export type AppView = "tabs" | "intro" | "session";
export type ActiveTab = "iniciar" | "historico";

export const DAY_FULL: Record<DayOfWeek, string> = {
  monday: strings.trainingPlan.monday,
  tuesday: strings.trainingPlan.tuesday,
  wednesday: strings.trainingPlan.wednesday,
  thursday: strings.trainingPlan.thursday,
  friday: strings.trainingPlan.friday,
  saturday: strings.trainingPlan.saturday,
  sunday: strings.trainingPlan.sunday,
};

export const DAY_SHORT: Record<DayOfWeek, string> = {
  monday: "SEG",
  tuesday: "TER",
  wednesday: "QUA",
  thursday: "QUI",
  friday: "SEX",
  saturday: "SÁB",
  sunday: "DOM",
};

export const SERIES_ABBR: Record<SeriesType, string> = {
  "warm-up": "Aquec.",
  adjustment: "Adapt.",
  working: "Trab.",
};

export const SERIES_COLOR: Record<SeriesType, { bg: string; text: string }> = {
  "warm-up": { bg: "#E3F2FD", text: "#1565C0" },
  adjustment: { bg: "#FFF3E0", text: "#E65100" },
  working: { bg: "#EDE7F6", text: "#4A148C" },
};

export function todayIso(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

// Fallback de "última série no treino de hoje" para pré-preencher peso/reps/descanso
// quando não há sugestão nem histórico de progressão. Precisa casar o seriesType —
// sem isso o peso de uma série de aquecimento pode vazar para uma série de trabalho.
export function findLastSameTypeRecord(
  records: LoggedSet[] | undefined,
  exerciseName: string,
  seriesType: SeriesType,
  beforeSeriesOrder: number,
): LoggedSet | null {
  if (!records) return null;
  return (
    records
      .filter(
        (r) =>
          r.exerciseName === exerciseName &&
          r.seriesType === seriesType &&
          r.seriesOrder < beforeSeriesOrder,
      )
      .sort((a, b) => b.seriesOrder - a.seriesOrder)[0] ?? null
  );
}

export function todayDayOfWeek(): DayOfWeek {
  const map: DayOfWeek[] = [
    "sunday",
    "monday",
    "tuesday",
    "wednesday",
    "thursday",
    "friday",
    "saturday",
  ];
  return map[new Date().getDay()];
}

export function formatHistoryDate(dateStr: string): string {
  const [y, m, d] = dateStr.substring(0, 10).split("-").map(Number);
  const date = new Date(y, m - 1, d);
  const weekDays = ["dom.", "seg.", "ter.", "qua.", "qui.", "sex.", "sáb."];
  const months = [
    "jan.",
    "fev.",
    "mar.",
    "abr.",
    "mai.",
    "jun.",
    "jul.",
    "ago.",
    "set.",
    "out.",
    "nov.",
    "dez.",
  ];
  return `${weekDays[date.getDay()]}, ${String(d).padStart(2, "0")} de ${months[m - 1]}`;
}
