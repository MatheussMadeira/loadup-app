import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/lib/apiClient";
import { PlateauAlert, PlateauAlertsResponse } from "@/types";

/**
 * Fetches plateau alerts from the backend API.
 *
 * @returns Promise resolving to an array of PlateauAlert objects
 * @throws Error if the API request fails
 */
export async function getAlertsFromAPI(): Promise<PlateauAlert[]> {
  const response =
    await apiClient.get<PlateauAlertsResponse>("/plateau/alerts");
  return response.data;
}

/**
 * React Query hook for fetching and caching plateau alerts.
 *
 * Features:
 * - Caches data for 5 minutes (staleTime: 300000ms)
 * - Retries failed requests 3 times
 * - Automatic authorization handling via apiClient
 *
 * @returns Query result object with alerts data, loading state, and error
 */
export function usePlateauAlertsQuery() {
  return useQuery<PlateauAlert[], Error>({
    queryKey: ["plateauAlerts"],
    queryFn: getAlertsFromAPI,
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 3,
  });
}

/** Marca que o modal de platô foi de fato mostrado ao usuário. */
export function markPresented(alertId: string): Promise<unknown> {
  return apiClient.patch(`/plateau/alerts/${alertId}/presented`, {});
}

/** Usuário confirmou um novo peso a partir do alerta de platô. */
export function actionAlert(alertId: string, weight: number): Promise<unknown> {
  return apiClient.patch(`/plateau/alerts/${alertId}/action`, { weight });
}
