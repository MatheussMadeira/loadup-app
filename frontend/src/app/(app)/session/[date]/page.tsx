"use client";

import { useParams, useRouter } from "next/navigation";
import styled, { keyframes } from "styled-components";

import PageTransition from "@/components/PageTransition";
import { strings } from "@/constants/strings";
import { useDayDetails } from "@/hooks/useCalendar";
import { DayOfWeek } from "@/types";

const DAY_FULL_LABELS: Record<string, string> = {
  monday: strings.trainingPlan.monday,
  tuesday: strings.trainingPlan.tuesday,
  wednesday: strings.trainingPlan.wednesday,
  thursday: strings.trainingPlan.thursday,
  friday: strings.trainingPlan.friday,
  saturday: strings.trainingPlan.saturday,
  sunday: strings.trainingPlan.sunday,
};

function formatFullDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString("pt-BR", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

function statusLabel(status: string): string {
  if (status === "completed") return strings.sessionHistory.statusCompleted;
  if (status === "skipped") return strings.sessionHistory.statusSkipped;
  if (status === "partial" || status === "active")
    return strings.sessionHistory.statusPartial;
  return strings.sessionHistory.statusPending;
}

function statusIsGood(status: string): boolean {
  return status === "completed";
}

export default function SessionDetailPage() {
  const router = useRouter();
  const params = useParams();
  const date = typeof params.date === "string" ? params.date : "";

  const dayDetails = useDayDetails(date);

  if (dayDetails.isLoading) {
    return (
      <PageTransition>
        <StyledPage>
          <StyledHeader>
            <StyledBackBtn onClick={() => router.back()} aria-label="Voltar">
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="currentColor"
              >
                <path d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z" />
              </svg>
            </StyledBackBtn>
            <StyledHeaderTitle>
              {strings.sessionHistory.title}
            </StyledHeaderTitle>
          </StyledHeader>
          <StyledBody>
            {Array.from({ length: 4 }).map((_, i) => (
              <StyledSkeletonCard
                key={i}
                style={{ height: i === 0 ? 60 : 80 }}
              />
            ))}
          </StyledBody>
        </StyledPage>
      </PageTransition>
    );
  }

  if (dayDetails.error || !dayDetails.data) {
    return (
      <PageTransition>
        <StyledPage>
          <StyledHeader>
            <StyledBackBtn onClick={() => router.back()} aria-label="Voltar">
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="currentColor"
              >
                <path d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z" />
              </svg>
            </StyledBackBtn>
            <StyledHeaderTitle>
              {strings.sessionHistory.title}
            </StyledHeaderTitle>
          </StyledHeader>
          <StyledBody>
            <StyledErrorText>{strings.common.error}</StyledErrorText>
          </StyledBody>
        </StyledPage>
      </PageTransition>
    );
  }

  const data = dayDetails.data;
  const plannedExercises = data.plannedWorkout?.exercises ?? [];
  const records = data.recordedSession?.records ?? [];
  const sessionSt = data.recordedSession?.status ?? "pending";

  // Agrupa records por exercício
  const recordsByExercise = records.reduce<Record<string, typeof records>>(
    (acc, r) => {
      const key = r.exerciseName;
      acc[key] = acc[key] ? [...acc[key], r] : [r];
      return acc;
    },
    {},
  );

  return (
    <PageTransition>
      <StyledPage>
        {/* ── Header ─────────────────────────────────────────────── */}
        <StyledHeader>
          <StyledBackBtn onClick={() => router.back()} aria-label="Voltar">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
              <path d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z" />
            </svg>
          </StyledBackBtn>
          <StyledHeaderInfo>
            <StyledHeaderSub>
              {DAY_FULL_LABELS[data.dayOfWeek as DayOfWeek]}
            </StyledHeaderSub>
            <StyledHeaderTitle>
              {strings.sessionHistory.title}
            </StyledHeaderTitle>
            <StyledHeaderDate>{formatFullDate(data.date)}</StyledHeaderDate>
          </StyledHeaderInfo>
          <StyledStatusBadge $good={statusIsGood(sessionSt)}>
            {statusLabel(sessionSt)}
          </StyledStatusBadge>
        </StyledHeader>

        <StyledBody>
          {/* ── Treino planejado ───────────────────────────────── */}
          {plannedExercises.length > 0 && (
            <StyledSection>
              <StyledSectionTitle>
                {strings.sessionHistory.plannedWorkout}
              </StyledSectionTitle>
              {plannedExercises.map((ex) => (
                <StyledExCard key={ex._id}>
                  <StyledExHeader>
                    <StyledExName>{ex.name}</StyledExName>
                    <StyledExMuscle>{ex.muscleGroup}</StyledExMuscle>
                  </StyledExHeader>
                  <StyledSeriesRow>
                    {ex.series.map((s, i) => (
                      <StyledSeriesChip key={i}>
                        {strings.exercises.seriesType[s.type]} ·{" "}
                        {s.repsMin === s.repsMax
                          ? `${s.repsMin} rep`
                          : `${s.repsMin}–${s.repsMax} reps`}
                      </StyledSeriesChip>
                    ))}
                  </StyledSeriesRow>
                </StyledExCard>
              ))}
            </StyledSection>
          )}

          {/* ── Séries registradas ────────────────────────────── */}
          <StyledSection>
            <StyledSectionTitle>
              {strings.sessionHistory.recordedSets}
            </StyledSectionTitle>
            {records.length === 0 ? (
              <StyledEmptyText>
                {strings.sessionHistory.noRecords}
              </StyledEmptyText>
            ) : (
              Object.entries(recordsByExercise).map(([exName, sets]) => (
                <StyledExCard key={exName}>
                  <StyledExName>{exName}</StyledExName>
                  <StyledSetList>
                    {sets.map((s, i) => (
                      <StyledSetRow key={i}>
                        <StyledSetIndex>{i + 1}</StyledSetIndex>
                        <StyledSetType>
                          {strings.exercises.seriesType[
                            s.seriesType as keyof typeof strings.exercises.seriesType
                          ] ?? s.seriesType}
                        </StyledSetType>
                        <StyledSetValue>
                          {strings.sessionHistory.weightReps(
                            s.weight,
                            s.repsCompleted,
                          )}
                        </StyledSetValue>
                      </StyledSetRow>
                    ))}
                  </StyledSetList>
                </StyledExCard>
              ))
            )}
          </StyledSection>
        </StyledBody>
      </StyledPage>
    </PageTransition>
  );
}

/* ─── Animations ──────────────────────────────────────────────────────── */
const shimmer = keyframes`
  0% { background-position: -400px 0; }
  100% { background-position: 400px 0; }
`;

const StyledPage = styled.div`
  display: flex;
  flex-direction: column;
  min-height: 100%;
  background-color: ${({ theme }) => theme.colors.background};
  padding: 24px 0 32px;
`;

const StyledHeader = styled.header`
  background: ${({ theme }) => theme.colors.background};
  padding: 20px 16px 12px;
  display: flex;
  align-items: flex-start;
  gap: ${({ theme }) => theme.spacing.md};
`;

const StyledBackBtn = styled.button`
  background: ${({ theme }) => theme.colors.surface};
  border: 1px solid ${({ theme }) => theme.colors.outlineVariant};
  border-radius: 50%;
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: ${({ theme }) => theme.colors.onSurface};
  cursor: pointer;
  font-family: inherit;
  flex-shrink: 0;
  transition:
    background 180ms ease,
    transform 180ms ease;
  &:active {
    background: ${({ theme }) => theme.colors.surfaceElevated};
    transform: scale(0.98);
  }
`;

const StyledHeaderInfo = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 6px;
`;

const StyledHeaderSub = styled.span`
  font-size: 12px;
  color: ${({ theme }) => theme.colors.onSurfaceMuted};
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
`;

const StyledHeaderTitle = styled.h1`
  font-size: ${({ theme }) => theme.typography.displayLarge.fontSize};
  font-weight: ${({ theme }) => theme.typography.displayLarge.fontWeight};
  color: ${({ theme }) => theme.colors.onSurface};
  line-height: 1.15;
`;

const StyledHeaderDate = styled.span`
  font-size: 13px;
  color: ${({ theme }) => theme.colors.onSurfaceMuted};
  text-transform: capitalize;
`;

const StyledStatusBadge = styled.span<{ $good: boolean }>`
  flex-shrink: 0;
  padding: 7px 14px;
  border-radius: ${({ theme }) => theme.borderRadius.pill};
  font-size: 12px;
  font-weight: 700;
  background: ${({ theme, $good }) =>
    $good ? theme.colors.successContainer : theme.colors.surface};
  color: ${({ theme, $good }) =>
    $good ? theme.colors.success : theme.colors.onSurfaceMuted};
  border: 1px solid ${({ theme }) => theme.colors.outlineVariant};
  margin-top: 4px;
`;

const StyledBody = styled.main`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.md};
  padding: 0 16px 96px;
  margin-top: ${({ theme }) => theme.spacing.md};
`;

const StyledSkeletonCard = styled.div`
  height: 88px;
  border-radius: ${({ theme }) => theme.borderRadius.card};
  background: linear-gradient(
    90deg,
    ${({ theme }) => theme.colors.surfaceElevated} 25%,
    ${({ theme }) => theme.colors.outlineVariant} 50%,
    ${({ theme }) => theme.colors.surfaceElevated} 75%
  );
  background-size: 800px 100%;
  animation: ${shimmer} 1.4s infinite;
  @media (prefers-reduced-motion: reduce) {
    animation: none;
    background: ${({ theme }) => theme.colors.surfaceElevated};
  }
`;

const StyledErrorText = styled.p`
  font-size: 14px;
  color: ${({ theme }) => theme.colors.error};
  text-align: center;
  padding: ${({ theme }) => theme.spacing.lg};
`;

const StyledSection = styled.section`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.sm};
`;

const StyledSectionTitle = styled.h2`
  font-size: 12px;
  font-weight: 700;
  color: ${({ theme }) => theme.colors.onSurfaceMuted};
  text-transform: uppercase;
  letter-spacing: 0.12em;
`;

const StyledExCard = styled.div`
  background: ${({ theme }) => theme.colors.surface};
  border-radius: ${({ theme }) => theme.borderRadius.inner};
  padding: ${({ theme }) => theme.spacing.md};
  box-shadow: ${({ theme }) => theme.shadows.card};
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.sm};
`;

const StyledExHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: ${({ theme }) => theme.spacing.sm};
`;

const StyledExName = styled.span`
  font-size: 15px;
  font-weight: 700;
  color: ${({ theme }) => theme.colors.onSurface};
`;

const StyledExMuscle = styled.span`
  font-size: 12px;
  color: ${({ theme }) => theme.colors.onSurfaceMuted};
`;

const StyledSeriesRow = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: ${({ theme }) => theme.spacing.xs};
`;

const StyledSeriesChip = styled.span`
  font-size: 12px;
  padding: 4px 12px;
  border-radius: ${({ theme }) => theme.borderRadius.chip};
  background: ${({ theme }) => theme.colors.primaryContainer};
  color: ${({ theme }) => theme.colors.primary};
  font-weight: 600;
`;

const StyledEmptyText = styled.p`
  font-size: 14px;
  color: ${({ theme }) => theme.colors.onSurfaceMuted};
  padding: ${({ theme }) => theme.spacing.md} 0;
  text-align: center;
`;

const StyledSetList = styled.ul`
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: 10px;
`;

const StyledSetRow = styled.li`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.sm};
  padding: 14px 0;
  border-bottom: 1px solid ${({ theme }) => theme.colors.outlineVariant};
  &:last-child {
    border-bottom: none;
  }
`;

const StyledSetIndex = styled.span`
  width: 24px;
  height: 24px;
  border-radius: 50%;
  background: ${({ theme }) => theme.colors.primaryContainer};
  color: ${({ theme }) => theme.colors.primary};
  font-size: 12px;
  font-weight: 700;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
`;

const StyledSetType = styled.span`
  font-size: 13px;
  color: ${({ theme }) => theme.colors.onSurfaceMuted};
  min-width: 90px;
`;

const StyledSetValue = styled.span`
  font-size: 13px;
  font-weight: 600;
  color: ${({ theme }) => theme.colors.onSurface};
`;
