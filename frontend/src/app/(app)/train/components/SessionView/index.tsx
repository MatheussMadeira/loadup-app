"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import { CheckCircle2, MinusCircle, Pause } from "lucide-react";

import { toast } from "sonner";

import { strings } from "@/constants/strings";
import {
  useCompleteSession,
  useCreateSession,
  usePauseSession,
  useStartSession,
  useTodaySession,
} from "@/hooks/useSession";
import MuscleChip from "@/components/MuscleChip";
import { DayOfWeek, RepRangeAlert, Series, SeriesType, TrainingDay } from "@/types";
import { trainingSheetService } from "@/services/trainingSheetService";
import { progressionService } from "@/services/progressionService";
import { NextExercisePreview, useRestTimer } from "@/context/RestTimerContext";
import { useDelayedFlag } from "@/hooks/useDelayedFlag";
import { resolveDisplayValue } from "@/lib/resolveDisplayValue";
import RepRangeAlertSheet from "../RepRangeAlertSheet";

import { DAY_FULL, findLastSameTypeRecord, todayIso } from "../../utils";
import RestTimerOverlay from "../RestTimerButton";
import SeriesInputRow, { SeriesInputRowHandle } from "../SeriesInputRow";
import SessionEditDrawer from "../SessionEditDrawer";

import {
  StyledActiveSessionLayout,
  StyledBackBtn,
  StyledBtnSpinner,
  StyledConcludeBtn,
  StyledDoneBanner,
  StyledDoneBannerIcon,
  StyledDoneBannerSub,
  StyledDoneBannerText,
  StyledEmptyText,
  StyledExerciseFocus,
  StyledExerciseHeader,
  StyledExerciseInfo,
  StyledExerciseMuscleFocus,
  StyledExerciseName,
  StyledExerciseNameFocus,
  StyledExerciseNum,
  StyledExerciseSection,
  StyledExerciseSkeleton,
  StyledMenuBtn,
  StyledProgressBadge,
  StyledSeriesList,
  StyledSeriesProgressDot,
  StyledSeriesProgressDots,
  StyledSeriesTypeBadgeFocus,
  StyledSessionBody,
  StyledSessionBottomBar,
  StyledSessionHeader,
  StyledSessionPage,
  StyledSessionTopRow,
  StyledSkipBtn,
} from "./styles";

interface SessionViewProps {
  dayOfWeek: DayOfWeek;
  sheetDay: TrainingDay | undefined;
  onBack: () => void;
}

const SERIES_TYPE_LABEL: Record<SeriesType, string> = {
  working: "TRABALHO",
  "warm-up": "AQUECIMENTO",
  adjustment: "ADAPTAÇÃO",
};

export default function SessionView({
  dayOfWeek,
  sheetDay,
  onBack,
}: SessionViewProps) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const session = useTodaySession();
  const createSession = useCreateSession();
  const [createAttempted, setCreateAttempted] = useState(false);
  const {
    isActive: contextIsActive,
    nextExercise: contextNextExercise,
    startRestTimer,
    setNextExercise: setContextNextExercise,
    stopRestTimer,
  } = useRestTimer();

  const [currentExerciseIndex, setCurrentExerciseIndex] = useState(0);
  const [currentSeriesIndex, setCurrentSeriesIndex] = useState(0);
  const [showEditDrawer, setShowEditDrawer] = useState(false);
  const [showRestTimer, setShowRestTimer] = useState(false);
  const [restDuration, setRestDuration] = useState(0);
  // Cobre a janela entre "concluir serie" e a tela de descanso ficar pronta:
  // gravar o registro e resolver o peso sugerido sao duas idas a rede.
  const [isAdvancing, setIsAdvancing] = useState(false);
  const [isNextPreviewLoading, setIsNextPreviewLoading] = useState(false);
  const [nextExercisePreview, setNextExercisePreview] =
    useState<NextExercisePreview | null>(null);
  // Peso já resolvido (mesma lógica do card de próximo exercício) para a
  // série que vai ficar ativa a seguir — evita que o input recalcule do zero
  // e possivelmente divirja do que o card acabou de mostrar durante o descanso.
  const [resolvedNextWeight, setResolvedNextWeight] = useState<number | null>(null);
  const [repRangeAlert, setRepRangeAlert] = useState<RepRangeAlert | null>(null);
  const [endOfSessionAlerts, setEndOfSessionAlerts] = useState<RepRangeAlert[]>([]);
  const [suggestedWeightAlert, setSuggestedWeightAlert] = useState<{
    exerciseId: string;
    seriesOrder: number;
    suggestedWeight: number;
  } | null>(null);

  // `isAdvancing` trava o botao imediatamente (guarda contra toque duplo);
  // o feedback visual so aparece se a espera passar de 150ms, senao o registro
  // otimistico resolve tao rapido que o spinner viraria um piscado.
  const showAdvancingFeedback = useDelayedFlag(isAdvancing);

  const seriesInputRef = useRef<SeriesInputRowHandle>(null);
  const hasInitialized = useRef(false);

  useEffect(() => {
    if (session.isError && !createAttempted) {
      setCreateAttempted(true);
      createSession.mutate(todayIso());
    }
  }, [session.isError, createAttempted, createSession]);

  const sessionData = session.data;
  const exercises = useMemo(
    () => sheetDay?.exercises ?? [],
    [sheetDay?.exercises],
  );
  const totalSeries = exercises.reduce((acc, ex) => acc + ex.series.length, 0);

  const loggedCount = useMemo(() => {
    if (!sessionData) return 0;
    return exercises.reduce(
      (acc, ex) =>
        acc +
        ex.series.filter((_, i) =>
          sessionData.records?.some(
            (s) => s.exerciseName === ex.name && s.seriesOrder === i + 1,
          ),
        ).length,
      0,
    );
  }, [sessionData, exercises]);

  const isReadOnly =
    sessionData?.status === "completed" || sessionData?.status === "skipped";
  useEffect(() => {
    if (
      !sessionData ||
      !exercises.length ||
      isReadOnly ||
      hasInitialized.current
    )
      return;

    hasInitialized.current = true;

    for (let exIdx = 0; exIdx < exercises.length; exIdx++) {
      const exercise = exercises[exIdx];
      for (let sIdx = 0; sIdx < exercise.series.length; sIdx++) {
        const isLogged = sessionData.records?.some(
          (r) => r.exerciseName === exercise.name && r.seriesOrder === sIdx + 1,
        );
        if (!isLogged) {
          setCurrentExerciseIndex(exIdx);
          setCurrentSeriesIndex(sIdx);
          return;
        }
      }
    }
  }, [sessionData, exercises, isReadOnly]);
  const completeSession = useCompleteSession(sessionData?._id ?? "");
  const startSession = useStartSession(sessionData?._id ?? "");
  const pauseSession = usePauseSession(sessionData?._id ?? "");
  const startSessionRef = useRef(startSession.mutate);
  startSessionRef.current = startSession.mutate;
  const wakeLockRef = useRef<WakeLockSentinel | null>(null);

  const acquireWakeLock = useCallback(async () => {
    if (!("wakeLock" in navigator)) return;
    try {
      wakeLockRef.current = await navigator.wakeLock.request("screen");
    } catch {}
  }, []);

  // A duração do treino conta do início até a conclusão (ou pausa manual via
  // botão) — não depende mais de aba/tela visível. Aqui só marcamos o início
  // (uma vez) e cuidamos do wake lock, que o SO libera sozinho em background
  // e precisa ser readquirido ao voltar.
  useEffect(() => {
    const sessionId = sessionData?._id;
    if (!sessionId || isReadOnly) return;

    startSessionRef.current();
    void acquireWakeLock();

    const handleVisibility = () => {
      if (!document.hidden) {
        void acquireWakeLock();
      }
    };

    document.addEventListener("visibilitychange", handleVisibility);

    return () => {
      document.removeEventListener("visibilitychange", handleVisibility);
      wakeLockRef.current?.release().then(() => {
        wakeLockRef.current = null;
      });
    };
  }, [sessionData?._id, isReadOnly, acquireWakeLock]);

  // Restaura o overlay de descanso se o contexto já tinha um timer ativo
  // (usuário voltou de outra tela, ex.: minimizou e navegou de volta).
  useEffect(() => {
    if (contextIsActive && contextNextExercise) {
      setNextExercisePreview(contextNextExercise);
      setShowRestTimer(true);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // somente no mount

  const isLoading =
    session.isLoading ||
    (session.isError && !createAttempted) ||
    createSession.isPending;

  const currentExercise = exercises[currentExerciseIndex];
  const currentSeries = currentExercise?.series[currentSeriesIndex];
  const totalSeriesInExercise = currentExercise?.series.length ?? 0;

  const completedSeriesInExercise = useMemo(() => {
    if (!sessionData || !currentExercise) return 0;
    return currentExercise.series.filter((_, i) =>
      sessionData.records?.some(
        (r) =>
          r.exerciseName === currentExercise.name && r.seriesOrder === i + 1,
      ),
    ).length;
  }, [sessionData, currentExercise]);

  const isSeriesLogged = useMemo(() => {
    if (!sessionData || !currentExercise) return false;
    return sessionData.records?.some(
      (r) =>
        r.exerciseName === currentExercise.name &&
        r.seriesOrder === currentSeriesIndex + 1,
    );
  }, [sessionData, currentExercise, currentSeriesIndex]);

  // Só serve de fallback se for da MESMA série (type) — senão o peso/reps de
  // um aquecimento vaza pra prévia de uma série de trabalho, por exemplo.
  const previousSeriesRecord = useMemo(() => {
    if (!sessionData || !currentExercise || !currentSeries || currentSeriesIndex === 0) {
      return null;
    }
    return findLastSameTypeRecord(
      sessionData.records,
      currentExercise.name,
      currentSeries.type,
      currentSeriesIndex + 1,
    );
  }, [sessionData, currentExercise, currentSeries, currentSeriesIndex]);

  const previousSeriesWeight = previousSeriesRecord?.weight ?? null;
  const previousSeriesReps = previousSeriesRecord?.repsCompleted ?? null;
  const previousSeriesRestTime = previousSeriesRecord?.restTime ?? null;

  const handleConclude = useCallback(() => {
    completeSession.mutate(
      { status: "completed" },
      {
        onSuccess: (data) => {
          if (data.repRangeAlerts?.length) {
            setEndOfSessionAlerts(data.repRangeAlerts);
          } else {
            toast.success("Treino concluído!");
          }
        },
        onError: () => toast.error("Erro ao concluir treino. Tente novamente."),
      },
    );
  }, [completeSession]);

  const handleDismissRest = useCallback(() => {
    setShowRestTimer(false);
    setNextExercisePreview(null);
    stopRestTimer();
  }, [stopRestTimer]);

  const handleRepRangeAlert = useCallback(
    (alert: RepRangeAlert, weight: number) => {
      setRepRangeAlert(alert);
    },
    [],
  );

  const handleAlertConfirm = useCallback(
    async (newWeight: number) => {
      const alert = repRangeAlert ?? endOfSessionAlerts[0];
      if (!alert) return;

      const exercise = exercises.find((ex) => ex.name === alert.exerciseName);
      if (exercise) {
        const workingSeriesOrders = exercise.series
          .map((s, idx) => ({ type: s.type, seriesOrder: idx + 1 }))
          .filter((s) => s.type === "working");
        await trainingSheetService.bulkUpdateSuggestedWeight(
          dayOfWeek,
          exercise._id,
          workingSeriesOrders.map(({ seriesOrder }) => ({
            seriesOrder,
            suggestedWeight: newWeight,
          })),
        );
      }

      if (repRangeAlert) {
        setRepRangeAlert(null);
      } else {
        setEndOfSessionAlerts((prev) => prev.slice(1));
      }
    },
    [repRangeAlert, endOfSessionAlerts, exercises, dayOfWeek],
  );

  const handleAlertDismiss = useCallback(() => {
    if (repRangeAlert) {
      setRepRangeAlert(null);
    } else {
      setEndOfSessionAlerts((prev) => prev.slice(1));
    }
  }, [repRangeAlert]);

  const resolveLastWeight = useCallback(
    async (
      exerciseName: string,
      series: Series | undefined,
      loggedWeight?: number,
      previousWeight?: number | null,
    ) => {
      const earlyResolved = resolveDisplayValue({
        logged: loggedWeight,
        suggested: series?.suggestedWeight,
      });
      if (earlyResolved != null || !series) return earlyResolved;

      let chartLastWeight: number | null = null;
      try {
        const chart = await queryClient.fetchQuery({
          queryKey: ["progression", "chart", exerciseName, series.type],
          queryFn: () => progressionService.getChart(exerciseName, series.type),
        });
        chartLastWeight = chart.chartData[chart.chartData.length - 1]?.weight ?? null;
      } catch {
        chartLastWeight = null;
      }

      return resolveDisplayValue({ chartLast: chartLastWeight, previousInSession: previousWeight });
    },
    [queryClient],
  );

  // A ordem aqui importa. Antes o indice da serie avancava primeiro e so
  // depois (apos resolver o peso na rede) o overlay de descanso aparecia —
  // por isso dava pra ver a proxima serie por um instante antes do
  // cronometro, e em rede lenta dava pra tocar em "concluir" de novo e pular
  // uma etapa do treino. Agora o descanso abre primeiro (o cronometro tem que
  // largar no momento exato em que a serie acabou), a troca de serie acontece
  // atras do overlay, e o card da proxima serie mostra um esqueleto enquanto
  // o peso nao resolve.
  const advanceAfterSeries = useCallback(
    async (restTime: number) => {
      const exercise = exercises[currentExerciseIndex];
      if (!exercise) return;

      setResolvedNextWeight(null);

      const hasMoreSeries = currentSeriesIndex < exercise.series.length - 1;
      const hasMoreExercises = currentExerciseIndex < exercises.length - 1;

      if (!hasMoreSeries && !hasMoreExercises) {
        handleConclude();
        return;
      }

      const withRest = restTime > 0;

      if (withRest) {
        setNextExercisePreview(null);
        setIsNextPreviewLoading(true);
        setRestDuration(restTime);
        setShowRestTimer(true);
        startRestTimer(restTime, null);
      }

      const nextTarget = hasMoreSeries
        ? {
            exerciseName: exercise.name,
            muscleGroup: exercise.muscleGroup,
            isNewExercise: false,
            series: exercise.series[currentSeriesIndex + 1],
            seriesOrder: currentSeriesIndex + 2,
          }
        : {
            exerciseName: exercises[currentExerciseIndex + 1].name,
            muscleGroup: exercises[currentExerciseIndex + 1].muscleGroup,
            isNewExercise: true,
            series: exercises[currentExerciseIndex + 1].series[0],
            seriesOrder: 1,
          };

      try {
        let lastWeight: number | null = null;

        if (withRest) {
          const logged = sessionData?.records?.find(
            (r) =>
              r.exerciseName === nextTarget.exerciseName &&
              r.seriesOrder === nextTarget.seriesOrder,
          );
          // Só serve de fallback se for da MESMA série (type) — senão o peso
          // de um aquecimento vaza pra prévia de uma série de trabalho.
          const previousRecord = hasMoreSeries
            ? findLastSameTypeRecord(
                sessionData?.records,
                exercise.name,
                nextTarget.series.type,
                nextTarget.seriesOrder,
              )
            : null;

          lastWeight = await resolveLastWeight(
            nextTarget.exerciseName,
            nextTarget.series,
            logged?.weight,
            previousRecord?.weight ?? null,
          );

          const preview: NextExercisePreview = {
            name: nextTarget.exerciseName,
            muscleGroup: nextTarget.muscleGroup,
            isNewExercise: nextTarget.isNewExercise,
            seriesTypeLabel: SERIES_TYPE_LABEL[nextTarget.series.type],
            lastWeight,
            repsMin: nextTarget.series?.repsMin ?? null,
            repsMax: nextTarget.series?.repsMax ?? null,
          };

          setNextExercisePreview(preview);
          setContextNextExercise(preview);
          setResolvedNextWeight(lastWeight);
        }
      } finally {
        setIsNextPreviewLoading(false);

        // Avanca so no fim: com descanso, isso acontece escondido atras do
        // overlay; sem descanso, e a transicao direta pra proxima serie.
        if (hasMoreSeries) {
          setCurrentSeriesIndex((prev) => prev + 1);
        } else {
          setCurrentExerciseIndex((prev) => prev + 1);
          setCurrentSeriesIndex(0);
        }
      }
    },
    [
      currentExerciseIndex,
      currentSeriesIndex,
      exercises,
      sessionData,
      handleConclude,
      startRestTimer,
      setContextNextExercise,
      resolveLastWeight,
    ],
  );

  const handleSeriesConclude = async () => {
    if (isAdvancing || !seriesInputRef.current) return;
    setIsAdvancing(true);
    try {
      const ok = await seriesInputRef.current.check();
      if (!ok) return;
      const restTime = seriesInputRef.current.getRestTime();
      await advanceAfterSeries(restTime);
    } finally {
      setIsAdvancing(false);
    }
  };

  const handleSeriesSkip = async () => {
    if (isAdvancing) return;
    setIsAdvancing(true);
    try {
      const restTime =
        seriesInputRef.current?.getRestTime() ?? currentSeries?.restTime ?? 0;
      await advanceAfterSeries(restTime);
    } finally {
      setIsAdvancing(false);
    }
  };

  const renderReadOnlyBody = () => (
    <StyledSessionBody>
      {exercises.map((exercise, exIndex) => (
        <StyledExerciseSection key={exercise._id}>
          <StyledExerciseHeader>
            <StyledExerciseNum>{exIndex + 1}</StyledExerciseNum>
            <StyledExerciseInfo>
              <StyledExerciseName>{exercise.name}</StyledExerciseName>
              <MuscleChip muscleGroup={exercise.muscleGroup} />
            </StyledExerciseInfo>
          </StyledExerciseHeader>
          <StyledSeriesList>
            {exercise.series.map((s, sIndex) => {
              const loggedSet = sessionData!.records?.find(
                (ls) =>
                  ls.exerciseName === exercise.name &&
                  ls.seriesOrder === sIndex + 1,
              );
              return (
                <SeriesInputRow
                  key={sIndex}
                  exercise={exercise}
                  series={s}
                  seriesIndex={sIndex}
                  sessionId={sessionData!._id}
                  loggedSet={loggedSet}
                  isReadOnly={isReadOnly}
                />
              );
            })}
          </StyledSeriesList>
        </StyledExerciseSection>
      ))}
    </StyledSessionBody>
  );

  const renderActiveBody = () => {
    if (!currentExercise || !currentSeries) {
      return (
        <StyledSessionBody>
          <StyledEmptyText>{strings.common.error}</StyledEmptyText>
        </StyledSessionBody>
      );
    }

    const loggedSet = sessionData!.records?.find(
      (ls) =>
        ls.exerciseName === currentExercise.name &&
        ls.seriesOrder === currentSeriesIndex + 1,
    );

    return (
      <StyledActiveSessionLayout>
        <StyledExerciseFocus>
          <StyledSeriesTypeBadgeFocus>
            {SERIES_TYPE_LABEL[currentSeries.type]}
          </StyledSeriesTypeBadgeFocus>
          <StyledExerciseNameFocus>
            {currentExercise.name}
          </StyledExerciseNameFocus>
          <StyledExerciseMuscleFocus>
            {currentExercise.muscleGroup}
          </StyledExerciseMuscleFocus>

          <SeriesInputRow
            ref={seriesInputRef}
            key={`${currentExercise._id}-${currentSeriesIndex}`}
            exercise={currentExercise}
            series={currentSeries}
            seriesIndex={currentSeriesIndex}
            sessionId={sessionData!._id}
            loggedSet={loggedSet}
            isReadOnly={false}
            inputsOnly
            onRepRangeAlert={handleRepRangeAlert}
            resolvedWeight={resolvedNextWeight}
            previousWeight={previousSeriesWeight}
            previousReps={previousSeriesReps}
            previousRestTime={previousSeriesRestTime}
            dayOfWeek={dayOfWeek}
          />
        </StyledExerciseFocus>

        <StyledSeriesProgressDots>
          {currentExercise.series.map((_, index) => (
            <StyledSeriesProgressDot
              key={index}
              $completed={
                index < currentSeriesIndex ||
                (index === currentSeriesIndex && isSeriesLogged)
              }
              $current={index === currentSeriesIndex && !isSeriesLogged}
            />
          ))}
        </StyledSeriesProgressDots>
      </StyledActiveSessionLayout>
    );
  };

  return (
    <StyledSessionPage>
      <StyledSessionHeader>
        <StyledSessionTopRow>
          <StyledBackBtn onClick={onBack} aria-label="Voltar">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
              <path d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z" />
            </svg>
          </StyledBackBtn>
          {!isReadOnly && exercises.length > 0 ? (
            <StyledProgressBadge>
              {currentExerciseIndex + 1}/{exercises.length}
            </StyledProgressBadge>
          ) : (
            <StyledProgressBadge>
              {strings.workout.progressCounter(loggedCount, totalSeries)}
            </StyledProgressBadge>
          )}
          {!isReadOnly && (
            <StyledMenuBtn
              onClick={() => pauseSession.mutate()}
              disabled={pauseSession.isPending}
              aria-label="Pausar treino"
            >
              <Pause size={20} />
            </StyledMenuBtn>
          )}
          {!isReadOnly && (
            <StyledMenuBtn
              onClick={() => setShowEditDrawer(true)}
              aria-label={strings.common.ariaEditRecords}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                <path d="M3 18h18v-2H3v2zm0-5h18v-2H3v2zm0-7v2h18V6H3z" />
              </svg>
            </StyledMenuBtn>
          )}
        </StyledSessionTopRow>
        {isReadOnly && (
          <>
            <StyledExerciseNameFocus as="h1">
              {DAY_FULL[dayOfWeek]}
            </StyledExerciseNameFocus>
          </>
        )}
      </StyledSessionHeader>

      {isLoading ? (
        <StyledSessionBody>
          {Array.from({ length: 2 }).map((_, i) => (
            <StyledExerciseSkeleton key={i} />
          ))}
        </StyledSessionBody>
      ) : !sessionData ? (
        <StyledSessionBody>
          <StyledEmptyText>{strings.common.error}</StyledEmptyText>
        </StyledSessionBody>
      ) : (
        <>
          {isReadOnly && (
            <StyledDoneBanner $skipped={sessionData?.status === "skipped"}>
              <StyledDoneBannerIcon
                $skipped={sessionData?.status === "skipped"}
              >
                {sessionData?.status === "completed" ? (
                  <CheckCircle2 size={24} strokeWidth={2} />
                ) : (
                  <MinusCircle size={24} strokeWidth={2} />
                )}
              </StyledDoneBannerIcon>
              <StyledDoneBannerText>
                {sessionData?.status === "completed"
                  ? strings.workout.completedTitle
                  : strings.workout.skippedTitle}
              </StyledDoneBannerText>
              <StyledDoneBannerSub>
                {strings.workout.readOnlyNotice}
              </StyledDoneBannerSub>
            </StyledDoneBanner>
          )}

          {isReadOnly ? renderReadOnlyBody() : renderActiveBody()}

          {!isReadOnly && currentExercise && (
            <StyledSessionBottomBar>
              <StyledSkipBtn
                onClick={() => {
                  void handleSeriesSkip();
                }}
                disabled={
                  completeSession.isPending || showRestTimer || isAdvancing
                }
              >
                {strings.workout.skipBtn}
              </StyledSkipBtn>
              <StyledConcludeBtn
                onClick={() => {
                  void handleSeriesConclude();
                }}
                disabled={
                  completeSession.isPending || showRestTimer || isAdvancing
                }
                aria-busy={isAdvancing}
              >
                {showAdvancingFeedback ? (
                  <StyledBtnSpinner aria-hidden="true" />
                ) : (
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                  >
                    <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z" />
                  </svg>
                )}
                {showAdvancingFeedback
                  ? "SALVANDO..."
                  : strings.workout.concludeBtn(
                      currentSeriesIndex + 1,
                      totalSeriesInExercise,
                    )}
              </StyledConcludeBtn>
            </StyledSessionBottomBar>
          )}

          {showRestTimer && (
            <RestTimerOverlay
              visible={showRestTimer}
              restDuration={restDuration}
              onDismiss={handleDismissRest}
              onMinimize={() => router.push("/home")}
              nextExercise={nextExercisePreview}
              isNextLoading={isNextPreviewLoading}
            />
          )}

          {(repRangeAlert ?? endOfSessionAlerts[0]) && (
            <RepRangeAlertSheet
              alert={(repRangeAlert ?? endOfSessionAlerts[0])!}
              currentWeight={seriesInputRef.current?.getWeight() ?? 0}
              onConfirm={(w) => { void handleAlertConfirm(w); }}
              onDismiss={handleAlertDismiss}
            />
          )}

          {showEditDrawer && sessionData && (
            <SessionEditDrawer
              open={showEditDrawer}
              onClose={() => setShowEditDrawer(false)}
              session={sessionData}
              exercises={exercises}
            />
          )}
        </>
      )}
    </StyledSessionPage>
  );
}
