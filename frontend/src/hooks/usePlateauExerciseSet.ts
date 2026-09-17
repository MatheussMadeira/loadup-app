"use client";

import { useMemo } from "react";

import { usePlateauAlertsQuery } from "@/services/plateauService";

/**
 * Nomes de exercício com um platô ativo (`alertType: "exercise"`) — usado
 * pros badges de "ainda estagnado" nas telas de treino. Reaproveita a mesma
 * query que antes só alimentava o sino da Home.
 */
export function usePlateauExerciseSet(): Set<string> {
  const { data: alerts = [] } = usePlateauAlertsQuery();

  return useMemo(() => {
    const names = alerts
      .filter((alert) => alert.alertType === "exercise" && alert.active)
      .map((alert) => alert.exerciseName);
    return new Set(names);
  }, [alerts]);
}
