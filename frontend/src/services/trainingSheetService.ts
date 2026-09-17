import { apiClient } from "@/lib/apiClient";
import { DayOfWeek, DayType, TrainingSheet } from "@/types";
export interface SnapshotSummary {
  _id: string;
  label: string;
  type: "manual" | "auto";
  createdAt: string;
  muscleGroups: string[];
  totalExercises: number;
}
export const trainingSheetService = {
  getTrainingSheet(): Promise<TrainingSheet> {
    return apiClient.get<TrainingSheet>("/training-sheet");
  },

  createTrainingSheet(): Promise<TrainingSheet> {
    const defaultDays: Record<string, { status: "training" | "rest" }> = {
      monday: { status: "training" },
      tuesday: { status: "training" },
      wednesday: { status: "training" },
      thursday: { status: "training" },
      friday: { status: "training" },
      saturday: { status: "rest" },
      sunday: { status: "rest" },
    };
    return apiClient.post<TrainingSheet>("/training-sheet", {
      days: defaultDays,
    });
  },
  swapDays(dayA: DayOfWeek, dayB: DayOfWeek): Promise<TrainingSheet> {
    return apiClient.patch<TrainingSheet>("/training-sheet/days/swap", {
      dayA,
      dayB,
    });
  },
  updateDay(day: DayOfWeek, status: DayType): Promise<TrainingSheet> {
    return apiClient.patch<TrainingSheet>(`/training-sheet/days/${day}`, {
      status,
    });
  },
  copyDay(data: {
    sourceUserId: string;
    sourceDayOfWeek: string;
    targetDayOfWeek: string;
  }): Promise<TrainingSheet> {
    return apiClient.post<TrainingSheet>("/training-sheet/copy-day", data);
  },

  getFriendSheet(userId: string): Promise<TrainingSheet> {
    return apiClient.get<TrainingSheet>(`/training-sheet/user/${userId}`);
  },

  saveSnapshot(label?: string): Promise<TrainingSheet> {
    return apiClient.post<TrainingSheet>("/training-sheet/snapshots", {
      label,
    });
  },

  getSnapshots(muscleGroup?: string): Promise<SnapshotSummary[]> {
    const q = muscleGroup
      ? `?muscleGroup=${encodeURIComponent(muscleGroup)}`
      : "";
    return apiClient.get<SnapshotSummary[]>(`/training-sheet/snapshots${q}`);
  },

  restoreSnapshot(snapshotId: string): Promise<TrainingSheet> {
    return apiClient.post<TrainingSheet>(
      `/training-sheet/snapshots/${snapshotId}/restore`,
      {},
    );
  },

  updateSuggestedWeight(
    dayOfWeek: string,
    exerciseId: string,
    seriesOrder: number,
    suggestedWeight: number | null,
  ): Promise<unknown> {
    return apiClient.patch(
      `/training-sheet/days/${dayOfWeek}/exercises/${exerciseId}/series/${seriesOrder}/suggested-weight`,
      { suggestedWeight },
    );
  },

  bulkUpdateSuggestedWeight(
    dayOfWeek: string,
    exerciseId: string,
    updates: Array<{ seriesOrder: number; suggestedWeight: number | null }>,
    markAsNew = false,
  ): Promise<unknown> {
    return apiClient.patch(
      `/training-sheet/days/${dayOfWeek}/exercises/${exerciseId}/series/bulk-suggested-weight`,
      { updates, markAsNew },
    );
  },

  updateSeriesSuggestions(
    dayOfWeek: string,
    exerciseId: string,
    seriesOrder: number,
    suggestions: {
      suggestedWeight?: number | null;
      suggestedReps?: number | null;
      suggestedRestTime?: number | null;
    },
  ): Promise<unknown> {
    return apiClient.patch(
      `/training-sheet/days/${dayOfWeek}/exercises/${exerciseId}/series/${seriesOrder}/suggestions`,
      suggestions,
    );
  },
};
