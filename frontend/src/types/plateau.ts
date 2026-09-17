/**
 * Plateau Alerts Type Definitions
 * Describes the structure of plateau alerts from the backend.
 */

/**
 * PlateauAlert - Response from GET /plateau/alerts
 * Represents a single plateau detection for an exercise.
 */
export interface PlateauAlert {
  /** Unique MongoDB ObjectId */
  _id: string;
  /** Exercise name (matched against training sheet) */
  exerciseName: string;
  /** Day of week when alert was detected */
  dayOfWeek: string;
  /** Type of alert: exercise stagnation, day-based, or rep-range-max */
  alertType: "exercise" | "day" | "rep-range-max";
  /** Number of sessions without progression */
  sessionCount: number;
  /** Recommendation text for the user */
  suggestion: string;
  /** ISO date string when alert was detected */
  detectedAt: string;
  /** Whether alert is still active */
  active: boolean;
}

/**
 * PlateauAlertsResponse - Response wrapper from backend
 * Wraps the alerts array with metadata.
 */
export interface PlateauAlertsResponse {
  /** Array of plateau alerts */
  data: PlateauAlert[];
  /** ISO timestamp of response */
  timestamp: string;
}
