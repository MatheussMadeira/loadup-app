# API Contract: Calendar Module

**Module**: `calendar`  
**Responsibility**: Display today's workout and calendar view of training schedule

---

## Endpoint: GET /calendar/today

Get today's workout summary (convenience endpoint).

**Response (200 OK)**:

```typescript
{
  date: string;           // Today's date in ISO 8601 (America/Sao_Paulo)
  dayOfWeek: string;      // e.g., 'monday'
  plannedWorkout: {
    status: 'training' | 'rest';
    exercises: [
      {
        name: string;
        muscleGroup: string;
        series: [
          {
            type: 'warm-up' | 'adjustment' | 'working';
            reps: number;
            order: number;
          }
        ];
      }
    ];
  } | null;               // null if rest day
  recordedSession: {
    _id: string;
    status: 'partial' | 'completed' | 'skipped' | null;
    recordCount: number;
  } | null;               // null if no session recorded yet
}
```

**Errors**:

- `404 Not Found`: Training sheet not created yet

---

## Endpoint: GET /calendar

Get full monthly calendar view (or specified month).

**Query Parameters**:

- `year` (number): e.g., 2026
- `month` (number): 1-12, e.g., 5 for May

**Response (200 OK)**:

```typescript
{
  year: number;
  month: number;
  monthName: string;       // "May"
  days: [
    {
      date: string;        // ISO 8601 (America/Sao_Paulo)
      dayOfWeek: string;
      plannedStatus: 'training' | 'rest';
      sessionStatus: 'recorded' | 'skipped' | 'pending' | null;
      hasWorkout: boolean;
      exerciseCount: number;  // 0 if rest day
    }
    // ... all days of month
  ];
}
```

**Errors**:

- `400 Bad Request`: Invalid year/month
- `404 Not Found`: Training sheet not found

---

## Endpoint: GET /calendar/:dateString

Get specific day's details (yyyy-MM-dd format).

**Response (200 OK)**:

```typescript
{
  date: string;
  dayOfWeek: string;
  plannedWorkout: {
    status: 'training' | 'rest';
    exercises: [
      {
        _id: string;
        name: string;
        muscleGroup: string;
        series: [
          { type, reps, order }
        ];
      }
    ];
  } | null;
  recordedSession: {
    _id: string;
    status: 'partial' | 'completed' | 'skipped';
    records: [
      {
        exerciseName: string;
        seriesType: string;
        seriesOrder: number;
        weight: number;
        repsCompleted: number;
        restTime: number;      // seconds
      }
    ];               // sorted by seriesOrder
  } | null;
}
```

**Errors**:

- `400 Bad Request`: Invalid date format
- `404 Not Found`: Training sheet not found

---

## Endpoint: GET /calendar/week

Get weekly view (current week or specified).

**Query Parameters**:

- `date` (string, optional): ISO 8601 date within desired week, defaults to today

**Response (200 OK)**:

```typescript
{
  weekStart: string;       // Monday of week (ISO 8601, America/Sao_Paulo)
  weekEnd: string;         // Sunday of week
  days: [
    {
      date: string;
      dayOfWeek: string;
      plannedStatus: 'training' | 'rest';
      sessionStatus: 'recorded' | 'skipped' | 'pending' | null;
      exerciseCount: number;
    }
    // ... 7 days
  ];
}
```

---

## Endpoint: PATCH /calendar/:dateString/mark

Mark a specific day's workout as completed, skipped, or reset.

**Request**:

```typescript
{
  action: "completed" | "skipped" | "reset";
}
```

**Response (200 OK)**:

```typescript
{
  date: string;
  dayOfWeek: string;
  sessionStatus: "completed" | "skipped" | "pending";
  updatedAt: string;
}
```

**Errors**:

- `400 Bad Request`: Invalid action
- `404 Not Found`: Day or session not found

---

## Calendar Status Rules

- **Pending**: Workout scheduled but not yet recorded (training day with no session)
- **Recorded**: Workout recorded (training session created with status 'completed')
- **Skipped**: Marked as skipped (training session with status 'skipped')
- **Rest**: Rest day (planned status 'rest', no session expected)

---

## Date/Timezone Handling

- All dates displayed in America/Sao_Paulo timezone
- Query parameters accept ISO 8601 dates (system auto-converts to UTC for queries)
- Responses return ISO 8601 dates (already converted to São Paulo timezone in response interceptor)
- Calendar calculations based on day-of-week from training sheet

---

## Notes

- `/calendar/today` is a convenience shortcut; returns only today's information
- `/calendar` displays full month; useful for overview and progression visualization
- `/calendar/:dateString` provides detailed day view including recorded metrics
- `/calendar/week` provides week-at-a-glance view
- Marking a day as 'completed' or 'skipped' affects calendar display and progression calculations
