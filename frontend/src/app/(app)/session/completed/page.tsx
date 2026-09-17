"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  CheckCircle2,
  Timer,
  Layers,
  Check,
  ArrowLeft,
  Share2,
} from "lucide-react";
import styled, { keyframes } from "styled-components";

import ShareSheet from "./components/ShareSheet";
import type { ShareCardExercise } from "./components/WorkoutShareCard";

import { useTodaySession } from "@/hooks/useSession";
import { useTrainingSheet } from "@/hooks/useTrainingSheet";

export default function CompletedWorkoutPage() {
  const router = useRouter();
  const session = useTodaySession();
  const sheet = useTrainingSheet();

  const sessionData = session.data;

  const todayDayOfWeek = useMemo(() => {
    const days = [
      "sunday",
      "monday",
      "tuesday",
      "wednesday",
      "thursday",
      "friday",
      "saturday",
    ];
    return days[new Date().getDay()];
  }, []);

  const sheetDay = useMemo(() => {
    return sheet.data?.days.find((d) => d.dayOfWeek === todayDayOfWeek);
  }, [sheet.data, todayDayOfWeek]);

  const DAY_FULL: Record<string, string> = {
    monday: "SEGUNDA-FEIRA",
    tuesday: "TERÇA-FEIRA",
    wednesday: "QUARTA-FEIRA",
    thursday: "QUINTA-FEIRA",
    friday: "SEXTA-FEIRA",
    saturday: "SÁBADO",
    sunday: "DOMINGO",
  };

  const stats = useMemo(() => {
    if (!sessionData?.records)
      return { kg: 0, series: 0, exercises: 0, duration: "—" };
    const kg = sessionData.records.reduce(
      (acc, r) => acc + r.weight * r.repsCompleted,
      0,
    );
    const series = sessionData.records.length;
    const exercises = new Set(sessionData.records.map((r) => r.exerciseName))
      .size;

    let duration = "—";
    if (typeof sessionData.activeSeconds === "number") {
      const diffMins = Math.round(sessionData.activeSeconds / 60);
      if (diffMins < 1) duration = "<1min";
      else if (diffMins < 60) duration = `${diffMins}min`;
      else {
        const h = Math.floor(diffMins / 60);
        const m = diffMins % 60;
        duration = m > 0 ? `${h}h ${m}min` : `${h}h`;
      }
    }

    return { kg: Math.round(kg * 10) / 10, series, exercises, duration };
  }, [sessionData]);

  const groupedExercises = useMemo(() => {
    if (!sessionData?.records) return [];
    const map = new Map<string, typeof sessionData.records>();
    sessionData.records.forEach((r) => {
      if (!map.has(r.exerciseName)) map.set(r.exerciseName, []);
      map.get(r.exerciseName)!.push(r);
    });
    return Array.from(map.entries()).map(([name, records], idx) => {
      const muscle =
        sheetDay?.exercises.find((e) => e.name === name)?.muscleGroup ?? "";
      return { n: idx + 1, name, muscle, records };
    });
  }, [sessionData, sheetDay]);

  const today = new Date().toLocaleDateString("pt-BR", {
    day: "numeric",
    month: "long",
  });

  const [showShare, setShowShare] = useState(false);

  const topExercises = useMemo<ShareCardExercise[]>(() => {
    return groupedExercises
      .map((ex) => {
        const working = ex.records.filter((r) => r.seriesType === "working");
        const pool = working.length > 0 ? working : ex.records;
        const best = pool.reduce(
          (b, r) => (r.weight > b.weight ? r : b),
          pool[0],
        );
        return {
          name: ex.name,
          bestWeight: best.weight,
          bestReps: best.repsCompleted,
        };
      })
      .sort((a, b) => b.bestWeight - a.bestWeight)
      .slice(0, 5);
  }, [groupedExercises]);

  const muscleGroups = useMemo<string[]>(() => {
    const seen = new Set<string>();
    const groups: string[] = [];
    for (const ex of groupedExercises) {
      if (ex.muscle && !seen.has(ex.muscle)) {
        seen.add(ex.muscle);
        groups.push(ex.muscle.toUpperCase());
      }
    }
    return groups;
  }, [groupedExercises]);

  const isLoading = session.isLoading || sheet.isLoading;

  const SERIES_TYPE_LABEL: Record<string, string> = {
    working: "TRABALHO",
    "warm-up": "AQUECIMENTO",
    adjustment: "ADAPTAÇÃO",
  };

  if (isLoading) {
    return (
      <PageWrapper>
        <GreenGlow />
        <TopBar>
          <BackBtn onClick={() => router.push("/")} aria-label="Voltar">
            <ArrowLeft size={24} />
          </BackBtn>
        </TopBar>
        <Content>
          <SkeletonHero />
          <StatsRow>
            {[1, 2, 3].map((i) => (
              <SkeletonCard key={i} />
            ))}
          </StatsRow>
          <SkeletonExercise />
          <SkeletonExercise />
        </Content>
      </PageWrapper>
    );
  }

  return (
    <PageWrapper>
      <GreenGlow />

      <TopBar>
        <BackBtn onClick={() => router.push("/")} aria-label="Voltar">
          <ArrowLeft size={24} />
        </BackBtn>
      </TopBar>

      <Content>
        {/* Hero */}
        <Hero>
          <CheckCircleWrapper>
            <CheckCircle2 size={28} color="#22C55E" strokeWidth={2.5} />
          </CheckCircleWrapper>
          <CompletedLabel>TREINO CONCLUÍDO</CompletedLabel>
          <DayName>{DAY_FULL[todayDayOfWeek] ?? "TREINO"}</DayName>
          <DateText>{today}</DateText>
        </Hero>

        {/* Stats */}
        <StatsRow>
          <StatCard>
            <StyledStatIcon>
              <Timer size={20} strokeWidth={2} />
            </StyledStatIcon>
            <StatValue>{stats.duration}</StatValue>
            <StatLabel>DURAÇÃO</StatLabel>
          </StatCard>
          <StatCard>
            <StyledStatIcon>
              <Layers size={20} strokeWidth={2} />
            </StyledStatIcon>
            <StatValue>{stats.series}</StatValue>
            <StatLabel>SÉRIES</StatLabel>
          </StatCard>
          <StatCard>
            <StyledStatIcon>
              <Check size={20} strokeWidth={2} />
            </StyledStatIcon>
            <StatValue>{stats.exercises}</StatValue>
            <StatLabel>EXERCÍCIOS</StatLabel>
          </StatCard>
        </StatsRow>

        {/* Exercises */}
        <ExercisesSection>
          <SectionLabel>EXERCÍCIOS</SectionLabel>
          <ExerciseList>
            {groupedExercises.map((ex) => (
              <ExerciseCard key={ex.name}>
                <ExerciseHeader>
                  <ExerciseNumBadge>
                    <ExerciseNumText>{ex.n}</ExerciseNumText>
                  </ExerciseNumBadge>
                  <ExerciseName>{ex.name}</ExerciseName>
                  <MuscleLabel>{ex.muscle}</MuscleLabel>
                </ExerciseHeader>

                <SeriesList>
                  {ex.records
                    .sort((a, b) => a.seriesOrder - b.seriesOrder)
                    .map((record, i) => (
                      <SeriesItem key={i}>
                        <SeriesRow>
                          <SeriesNum>Série {record.seriesOrder}</SeriesNum>
                          <TypeBadge>
                            {SERIES_TYPE_LABEL[record.seriesType] ??
                              record.seriesType}
                          </TypeBadge>
                          <SeriesValues>
                            <ValueNum>{record.weight}</ValueNum>
                            <ValueUnit>kg</ValueUnit>
                            <Dot>·</Dot>
                            <ValueNum>{record.repsCompleted}</ValueNum>
                            <ValueUnit> reps</ValueUnit>
                            <Dot>·</Dot>
                            <ValueNum>{record.restTime}</ValueNum>
                            <ValueUnit>s</ValueUnit>
                          </SeriesValues>
                        </SeriesRow>
                        {i < ex.records.length - 1 && <Divider />}
                      </SeriesItem>
                    ))}
                </SeriesList>
              </ExerciseCard>
            ))}
          </ExerciseList>
        </ExercisesSection>
      </Content>

      {/* Bottom */}
      <BottomBar>
        <ShareCardBtn onClick={() => setShowShare(true)}>
          <Share2 size={16} />
          Compartilhar treino
        </ShareCardBtn>
        <PrimaryBtn onClick={() => router.push("/progress")}>
          VER HISTÓRICO COMPLETO
        </PrimaryBtn>
        <SecondaryBtn onClick={() => router.push("/")}>
          Voltar ao início
        </SecondaryBtn>
      </BottomBar>

      {showShare && (
        <ShareSheet
          dayName={DAY_FULL[todayDayOfWeek] ?? "TREINO"}
          date={today}
          stats={stats}
          topExercises={topExercises}
          muscleGroups={muscleGroups}
          onClose={() => setShowShare(false)}
        />
      )}
    </PageWrapper>
  );
}

/* ─── Styled Components ─────────────────────────────── */

const PageWrapper = styled.div`
  position: relative;
  min-height: 100%;
  background: ${({ theme }) => theme.colors.background};
  color: ${({ theme }) => theme.colors.onSurface};
  margin: 0 auto;
  overflow-x: hidden;
  /* Altura da BottomBar fixa desta tela (compartilhar + CTA + voltar). */
  padding-bottom: 190px;
`;

const GreenGlow = styled.div`
  pointer-events: none;
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 320px;
  background: radial-gradient(
    ellipse at 50% 0%,
    rgba(34, 197, 94, 0.14) 0%,
    rgba(34, 197, 94, 0.05) 35%,
    transparent 70%
  );
`;

const TopBar = styled.div`
  position: relative;
  padding: 48px 24px 0;
`;
const StyledStatIcon = styled.div`
  color: ${({ theme }) => theme.colors.primary};
  display: flex;
  align-items: center;
  justify-content: center;
`;
const BackBtn = styled.button`
  background: none;
  border: none;
  color: ${({ theme }) => theme.colors.onSurface};
  cursor: pointer;
  display: inline-flex;
  padding: 0;
`;

const Content = styled.div`
  position: relative;
  padding: 0 24px;
`;

const Hero = styled.div`
  padding-top: 24px;
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
`;

const CheckCircleWrapper = styled.div`
  width: 56px;
  height: 56px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(34, 197, 94, 0.15);
  border: 1px solid rgba(34, 197, 94, 0.35);
`;

const CompletedLabel = styled.span`
  font-family: "Barlow Condensed", sans-serif;
  font-weight: 600;
  font-size: 12px;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  color: ${({ theme }) => theme.colors.success};
  margin-top: 20px;
`;

const DayName = styled.h1`
  font-family: "Barlow Condensed", sans-serif;
  font-weight: 900;
  font-size: 52px;
  text-transform: uppercase;
  line-height: 0.9;
  letter-spacing: -0.02em;
  color: ${({ theme }) => theme.colors.onSurface};
  margin-top: 8px;
`;

const DateText = styled.span`
  font-family: "Inter", sans-serif;
  font-size: 14px;
  color: ${({ theme }) => theme.colors.onSurfaceMuted};
  margin-top: 12px;
`;

const StatsRow = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 12px;
  margin-top: 32px;
`;

const StatCard = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 16px 12px;
  border-radius: ${({ theme }) => theme.borderRadius.inner};
  background: ${({ theme }) => theme.colors.surfaceElevated};
  border: 1px solid ${({ theme }) => theme.colors.outlineVariant};
  gap: 4px;
`;

const StatValue = styled.span`
  font-family: "Bebas Neue", sans-serif;
  font-size: 28px;
  color: ${({ theme }) => theme.colors.onSurface};
  line-height: 1;
  margin-top: 8px;
`;

const StatLabel = styled.span`
  font-family: "Barlow Condensed", sans-serif;
  font-weight: 600;
  font-size: 10px;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: ${({ theme }) => theme.colors.onSurfaceMuted};
`;

const ExercisesSection = styled.div`
  margin-top: 40px;
`;

const SectionLabel = styled.span`
  font-family: "Barlow Condensed", sans-serif;
  font-weight: 600;
  font-size: 11px;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  color: ${({ theme }) => theme.colors.onSurfaceMuted};
`;

const ExerciseList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-top: 16px;
`;

const ExerciseCard = styled.div`
  border-radius: ${({ theme }) => theme.borderRadius.inner};
  padding: 16px;
  background: ${({ theme }) => theme.colors.surface};
  border: 1px solid ${({ theme }) => theme.colors.outlineVariant};
`;

const ExerciseHeader = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
`;

const ExerciseNumBadge = styled.div`
  width: 28px;
  height: 28px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: ${({ theme }) => theme.colors.primaryContainer};
  flex-shrink: 0;
`;

const ExerciseNumText = styled.span`
  font-family: "Bebas Neue", sans-serif;
  font-size: 14px;
  color: ${({ theme }) => theme.colors.primary};
  line-height: 1;
`;

const ExerciseName = styled.span`
  font-family: "Inter", sans-serif;
  font-weight: 600;
  font-size: 15px;
  color: ${({ theme }) => theme.colors.onSurface};
  flex: 1;
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

const MuscleLabel = styled.span`
  font-family: "Barlow Condensed", sans-serif;
  font-weight: 600;
  font-size: 11px;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: ${({ theme }) => theme.colors.primary};
  flex-shrink: 0;
`;

const SeriesList = styled.div`
  display: flex;
  flex-direction: column;
  margin-top: 12px;
`;

const SeriesItem = styled.div``;

const SeriesRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 10px 0;
`;

const SeriesNum = styled.span`
  font-family: "Inter", sans-serif;
  font-size: 12px;
  color: ${({ theme }) => theme.colors.onSurfaceMuted};
  min-width: 48px;
`;

const TypeBadge = styled.span`
  font-family: "Barlow Condensed", sans-serif;
  font-weight: 600;
  font-size: 10px;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  padding: 2px 8px;
  border-radius: 999px;
  background: ${({ theme }) => theme.colors.primaryContainer};
  color: ${({ theme }) => theme.colors.primary};
`;

const SeriesValues = styled.div`
  display: flex;
  align-items: baseline;
  gap: 2px;
  min-width: 110px;
  justify-content: flex-end;
`;

const ValueNum = styled.span`
  font-family: "Bebas Neue", sans-serif;
  font-size: 14px;
  color: ${({ theme }) => theme.colors.onSurface};
`;

const ValueUnit = styled.span`
  font-family: "Inter", sans-serif;
  font-size: 11px;
  color: ${({ theme }) => theme.colors.onSurfaceMuted};
`;

const Dot = styled.span`
  font-size: 11px;
  color: ${({ theme }) => theme.colors.onSurfaceMuted};
  margin: 0 2px;
`;

const Divider = styled.div`
  height: 1px;
  background: ${({ theme }) => theme.colors.outlineVariant};
`;

const BottomBar = styled.div`
  position: fixed;
  /* Encosta no topo do bottom nav em vez de tentar acertar o offset no
     olho: antes o "Ver historico completo" ficava por baixo da nav. */
  bottom: var(--bottom-nav-height);
  left: 50%;
  transform: translateX(-50%);
  width: 100%;
  padding: 16px 24px 20px;
  z-index: 90;
  background: linear-gradient(
    to bottom,
    transparent 0%,
    ${({ theme }) => theme.colors.background} 40%
  );
  display: flex;
  flex-direction: column;
  gap: 4px;
`;

const ShareCardBtn = styled.button`
  width: 100%;
  height: 52px;
  border-radius: ${({ theme }) => theme.borderRadius.pill};
  border: 1.5px solid ${({ theme }) => theme.colors.outlineVariant};
  background: transparent;
  color: ${({ theme }) => theme.colors.onSurface};
  font-family: "Barlow Condensed", sans-serif;
  font-weight: 700;
  backdrop-filter: blur(4px);
  font-size: 15px;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  transition:
    border-color 150ms ease,
    color 150ms ease;

  &:hover {
    border-color: ${({ theme }) => theme.colors.primary};
    color: ${({ theme }) => theme.colors.primary};
  }
`;

const PrimaryBtn = styled.button`
  width: 100%;
  height: 56px;
  border-radius: ${({ theme }) => theme.borderRadius.pill};
  border: none;
  background: ${({ theme }) => theme.colors.primary};
  color: ${({ theme }) => theme.colors.onPrimary};
  font-family: "Barlow Condensed", sans-serif;
  font-weight: 900;
  font-size: 17px;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  cursor: pointer;
  box-shadow: ${({ theme }) => theme.shadows.primary};
`;

const SecondaryBtn = styled.button`
  width: 100%;
  background: none;
  border: none;
  font-family: "Inter", sans-serif;
  font-size: 14px;
  color: ${({ theme }) => theme.colors.onSurfaceMuted};
  cursor: pointer;
  padding: 12px 0;
  text-align: center;
`;

const shimmer = keyframes`
  0% { background-position: -400px 0; }
  100% { background-position: 400px 0; }
`;

const Skeleton = styled.div`
  background: linear-gradient(
    90deg,
    ${({ theme }) => theme.colors.surface} 25%,
    ${({ theme }) => theme.colors.surfaceElevated} 50%,
    ${({ theme }) => theme.colors.surface} 75%
  );
  background-size: 800px 100%;
  animation: ${shimmer} 1.5s infinite linear;
  border-radius: ${({ theme }) => theme.borderRadius.inner};
`;

const SkeletonHero = styled(Skeleton)`
  height: 180px;
  margin-top: 24px;
`;

const SkeletonCard = styled(Skeleton)`
  height: 90px;
`;

const SkeletonExercise = styled(Skeleton)`
  height: 120px;
  margin-top: 12px;
`;
