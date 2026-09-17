"use client";

import { useMemo, useState } from "react";
import { MoonStar } from "lucide-react";
import { useRouter } from "next/navigation";

import EmptyState from "@/components/EmptyState";
import PageTransition from "@/components/PageTransition";
import { NotificationsModal } from "@/components/NotificationsModal";
import { strings } from "@/constants/strings";
import { useLogout } from "@/hooks/useAuth";
import {
  useMonthlyCalendar,
  useTodayCalendar,
  useWeeklyCalendar,
} from "@/hooks/useCalendar";
import { useProgressionSummary } from "@/hooks/useProgression";
import { useTrainingSheet } from "@/hooks/useTrainingSheet";
import { authService } from "@/services/authService";
import { DayOfWeek, Exercise } from "@/types";
import WrongDayModal from "../training-plan/[dayOfWeek]/components/WrongDayModal";

import HomeHeader from "./components/HomeHeader";
import SessionHistory from "./components/SessionHistory";
import TodayPreview from "./components/TodayPreview";
import WeekStrip from "./components/WeekStrip";
import {
  StyledBadge,
  StyledBody,
  StyledCard,
  StyledCardHeader,
  StyledCardTitle,
  StyledCalendarHeader,
  StyledHeaderSkeleton,
  StyledMonthLabel,
  StyledPage,
  StyledPlanLink,
  StyledRestIndicator,
  StyledRestText,
  StyledSkeletonCard,
} from "./styles";
import { DAY_FULL_LABELS, isToday, RecentSession } from "./utils";

export default function HomePage() {
  const router = useRouter();
  const logout = useLogout();
  const userName = authService.getName() || strings.common.defaultUserName;
  const now = new Date();

  const [modalOpen, setModalOpen] = useState(false);

  const today = useTodayCalendar();
  const weekly = useWeeklyCalendar();
  const monthly = useMonthlyCalendar(now.getFullYear(), now.getMonth() + 1);
  const progression = useProgressionSummary();
  const sheet = useTrainingSheet();
  const [selectedDow, setSelectedDow] = useState<DayOfWeek | null>(null);
  const [showWrongDayModal, setShowWrongDayModal] = useState(false);

  const handleStart = () => {
    if (!isViewingToday) {
      setShowWrongDayModal(true);
    } else {
      router.push("/train");
    }
  };
  const todayData = today.data;
  const weeklyData = weekly.data;
  const todayDow =
    (weeklyData?.days.find((d) => isToday(d.date))
      ?.dayOfWeek as DayOfWeek | null) ?? null;
  const selectedDayData = useMemo(() => {
    const dow = selectedDow ?? todayDow;
    if (!dow || !sheet.data) return null;
    return sheet.data.days.find((d) => d.dayOfWeek === dow) ?? null;
  }, [selectedDow, todayDow, sheet.data]);

  const isViewingToday = selectedDow === null || selectedDow === todayDow;
  const viewDow: DayOfWeek | null = selectedDow ?? todayData?.dayOfWeek ?? null;
  const cardExercises: Exercise[] = isViewingToday
    ? (todayData?.plannedWorkout?.exercises ?? [])
    : (selectedDayData?.exercises ?? []);
  const cardIsRest = isViewingToday
    ? todayData?.plannedWorkout === null
    : selectedDayData?.status === "rest";
  const sessionStatus = todayData?.recordedSession?.status;
  const isDone =
    isViewingToday &&
    (sessionStatus === "completed" || sessionStatus === "skipped");
  const hasNoSheet = !sheet.isLoading && (sheet.error || !sheet.data);
  const weeklyCompleted =
    weeklyData?.days.filter((d) => d.sessionStatus === "recorded").length ?? 0;
  const monthLabel = now.toLocaleDateString("pt-BR", {
    month: "long",
    year: "numeric",
  });
  const monthLabelCapitalized =
    monthLabel.charAt(0).toUpperCase() + monthLabel.slice(1);

  const recentSessions = useMemo<RecentSession[]>(() => {
    if (!monthly.data || !sheet.data) return [];
    return monthly.data.days
      .filter(
        (day) =>
          new Date(day.date) < now &&
          day.sessionStatus !== null &&
          day.plannedStatus === "training",
      )
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .slice(0, 3)
      .map((day) => {
        const sd = sheet.data!.days.find((s) => s.dayOfWeek === day.dayOfWeek);
        return {
          date: day.date,
          dayOfWeek: day.dayOfWeek as DayOfWeek,
          sessionStatus: day.sessionStatus,
          muscles: Array.from(
            new Set(sd?.exercises.map((e) => e.muscleGroup) ?? []),
          ),
          totalSeries:
            sd?.exercises.reduce((acc, ex) => acc + ex.series.length, 0) ?? 0,
        };
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [monthly.data, sheet.data]);

  if (today.isLoading && sheet.isLoading) {
    return (
      <PageTransition>
        <StyledPage>
          <StyledHeaderSkeleton />
          <StyledBody>
            <StyledSkeletonCard />
            <StyledSkeletonCard style={{ height: 80 }} />
            <StyledSkeletonCard style={{ height: 200 }} />
          </StyledBody>
        </StyledPage>
      </PageTransition>
    );
  }

  return (
    <>
      <PageTransition>
        <StyledPage>
          <HomeHeader
            userName={userName}
            summary={progression.data}
            weeklyCompleted={weeklyCompleted}
            onBellClick={() => setModalOpen(true)}
            onLogout={logout}
          />
          <StyledBody>
            <StyledCard>
              <StyledCalendarHeader>
                <StyledMonthLabel>{monthLabelCapitalized}</StyledMonthLabel>
                <StyledPlanLink onClick={() => router.push("/training-plan")}>
                  Ver plano
                </StyledPlanLink>
              </StyledCalendarHeader>
              <WeekStrip
                weekly={weeklyData}
                isLoading={weekly.isLoading}
                selectedDow={selectedDow ?? todayDow}
                todayDow={todayDow}
                emptyMessage={strings.home.calendarNoSheet}
                onDayClick={(dow) =>
                  setSelectedDow((prev) =>
                    prev === dow || (prev === null && dow === todayDow)
                      ? null
                      : dow,
                  )
                }
              />
            </StyledCard>

            <StyledCard>
              {hasNoSheet ? (
                <EmptyState
                  title={strings.home.noSheetSubtitle}
                  ctaLabel={strings.home.noSheetCta}
                  onCta={() => router.push("/training-plan")}
                />
              ) : today.error ? (
                <EmptyState
                  title={strings.home.errorTitle}
                  ctaLabel={strings.home.errorRetry}
                  onCta={() => today.refetch()}
                />
              ) : (
                <>
                  <StyledCardHeader>
                    <StyledCardTitle>
                      {cardIsRest
                        ? strings.home.restDayBigTitle
                        : isViewingToday
                          ? strings.home.todayWorkoutTitle
                          : strings.home.dayWorkoutTitle(
                              DAY_FULL_LABELS[viewDow!],
                            )}
                    </StyledCardTitle>
                    {isDone && (
                      <StyledBadge $status={sessionStatus ?? ""}>
                        {sessionStatus === "completed"
                          ? strings.home.completedBadge
                          : strings.home.skippedBadge}
                      </StyledBadge>
                    )}
                  </StyledCardHeader>
                  {cardIsRest ? (
                    <StyledRestIndicator>
                      <MoonStar size={36} strokeWidth={1.5} />
                      <StyledRestText>
                        {strings.home.restDayRecovery}
                      </StyledRestText>
                    </StyledRestIndicator>
                  ) : cardExercises.length === 0 ? (
                    <StyledRestIndicator>
                      <StyledRestText>
                        {strings.home.noExercises}
                      </StyledRestText>
                    </StyledRestIndicator>
                  ) : (
                    <TodayPreview
                      dayOfWeek={viewDow!}
                      exercises={cardExercises}
                      isDone={isDone}
                      onStart={handleStart}
                    />
                  )}
                </>
              )}
            </StyledCard>

            {recentSessions.length > 0 && (
              <StyledCard>
                <SessionHistory
                  sessions={recentSessions}
                  onViewAll={() => router.push("/training-plan")}
                  onSessionClick={(date) =>
                    router.push(`/session/${date.split("T")[0]}`)
                  }
                />
              </StyledCard>
            )}
          </StyledBody>
        </StyledPage>
        <WrongDayModal
          isOpen={showWrongDayModal}
          onClose={() => setShowWrongDayModal(false)}
          todayLabel={todayDow ? DAY_FULL_LABELS[todayDow] : "hoje"}
        />
      </PageTransition>
      <NotificationsModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
      />
    </>
  );
}
