"use client";

import { useEffect, useRef, useState } from "react";

import { formatMMSS } from "@/lib/formatMMSS";
import { useAppTheme } from "@/styles/ThemeProvider";
import { NextExercisePreview, useRestTimer } from "@/context/RestTimerContext";

import { useRestAlerts } from "../../context/RestAlertsContext";
import { useScrollLock } from "@/hooks/useScrollLock";
import {
  StyledClockSvg,
  StyledClockWrapper,
  StyledDigitalTime,
  StyledHandleBar,
  StyledHandleButton,
  StyledNextCard,
  StyledNextCardAccentBar,
  StyledNextCardChips,
  StyledNextCardContent,
  StyledNextCardCta,
  StyledNextCardHeader,
  StyledNextCardLabel,
  StyledNextCardMuscleChip,
  StyledNextCardName,
  StyledNextCardStat,
  StyledNextCardStatLabel,
  StyledNextCardStats,
  StyledNextCardStatUnit,
  StyledNextCardStatValue,
  StyledNextCardSkeletonLine,
  StyledNextCardSkeletonStack,
  StyledNextCardTypeChip,
  StyledOverlayBody,
  StyledRestLabel,
  StyledRestOverlay,
  StyledSkipRestBtn,
} from "./styles";

const DRAG_DISMISS_THRESHOLD = 120;

interface RestTimerOverlayProps {
  visible: boolean;
  restDuration: number;
  onDismiss: () => void;
  onMinimize?: () => void;
  nextExercise?: NextExercisePreview | null;
  /** Preview da proxima serie ainda sendo resolvido (peso vem da rede). */
  isNextLoading?: boolean;
}

export default function RestTimerOverlay({
  visible,
  restDuration,
  onDismiss,
  onMinimize,
  nextExercise,
  isNextLoading = false,
}: RestTimerOverlayProps) {
  const { theme } = useAppTheme();
  const { playRestEndAlert } = useRestAlerts();
  const {
    isActive,
    timeLeft,
    restDuration: ctxDuration,
    startRestTimer,
  } = useRestTimer();
  const wakeLockRef = useRef<WakeLockSentinel | null>(null);
  const dragStartYRef = useRef<number | null>(null);
  const [dragY, setDragY] = useState(0);
  const [isDragging, setIsDragging] = useState(false);

  const handleDragStart = (e: React.PointerEvent<HTMLButtonElement>) => {
    if (!onMinimize) return;
    e.currentTarget.setPointerCapture(e.pointerId);
    dragStartYRef.current = e.clientY;
    setIsDragging(true);
  };

  const handleDragMove = (e: React.PointerEvent<HTMLButtonElement>) => {
    if (dragStartYRef.current === null) return;
    setDragY(Math.max(0, e.clientY - dragStartYRef.current));
  };

  const handleDragEnd = () => {
    if (dragStartYRef.current === null) return;
    dragStartYRef.current = null;
    setIsDragging(false);
    if (dragY > DRAG_DISMISS_THRESHOLD) {
      onMinimize?.();
    }
    setDragY(0);
  };

  useScrollLock(visible);

  useEffect(() => {
    if (!visible) return;

    const acquireWakeLock = async () => {
      if ("wakeLock" in navigator) {
        try {
          wakeLockRef.current = await navigator.wakeLock.request("screen");
        } catch {}
      }
    };
    acquireWakeLock();

    return () => {
      wakeLockRef.current?.release().then(() => {
        wakeLockRef.current = null;
      });
    };
  }, [visible]);

  // Effect 1: inicia o timer no contexto — apenas se ainda não estiver ativo
  // (caso de restauração: usuário voltou à rota /train com timer em andamento)
  useEffect(() => {
    if (!visible || restDuration <= 0) return;
    if (isActive) return; // contexto já tem o timer rodando, não reiniciar
    startRestTimer(restDuration, nextExercise ?? null);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [visible, restDuration]); // deps intencionalmente limitadas

  // Effect 2: escuta o evento global e dispensa o overlay
  useEffect(() => {
    const handleEnd = () => {
      if (!visible) return; // widget cuida se overlay não está visível
      playRestEndAlert();
      onDismiss();
    };
    window.addEventListener("rest-timer-end", handleEnd);
    return () => window.removeEventListener("rest-timer-end", handleEnd);
  }, [visible, playRestEndAlert, onDismiss]);

  if (!visible) return null;

  const radius = 110;
  const circumference = 2 * Math.PI * radius;
  const progress = ctxDuration > 0 ? Math.max(0, timeLeft / ctxDuration) : 0;
  const dashOffset = circumference * (1 - progress);
  const handAngle = 360 * progress;

  return (
    <StyledRestOverlay
      role="dialog"
      aria-label="Tempo de descanso"
      style={{
        transform: dragY ? `translateY(${dragY}px)` : undefined,
        transition: isDragging
          ? "none"
          : "transform 250ms cubic-bezier(0.16, 1, 0.3, 1)",
      }}
    >
      {onMinimize && (
        <StyledHandleButton
          type="button"
          onPointerDown={handleDragStart}
          onPointerMove={handleDragMove}
          onPointerUp={handleDragEnd}
          onPointerCancel={handleDragEnd}
          aria-label="Arraste para minimizar"
        >
          <StyledHandleBar />
        </StyledHandleButton>
      )}

      <StyledOverlayBody>
        <StyledClockWrapper>
          <StyledClockSvg viewBox="0 0 240 240" aria-hidden="true">
            <circle
              cx="120"
              cy="120"
              r={radius}
              fill="none"
              stroke={theme.colors.surface}
              strokeWidth="3"
            />
            <circle
              cx="120"
              cy="120"
              r={radius}
              fill="none"
              stroke={theme.colors.primary}
              strokeWidth="3"
              strokeLinecap="round"
              strokeDasharray={circumference}
              strokeDashoffset={dashOffset}
              transform="rotate(-90 120 120)"
              style={{
                transition: "stroke-dashoffset 1s linear",
              }}
            />
            <line
              x1="120"
              y1="120"
              x2="120"
              y2="18"
              stroke={theme.colors.primary}
              strokeWidth="2"
              strokeLinecap="round"
              transform={`rotate(${handAngle} 120 120)`}
              style={{
                transition: "transform 1s linear",
              }}
            />
            <circle cx="120" cy="120" r="4" fill={theme.colors.primary} />
          </StyledClockSvg>
        </StyledClockWrapper>

        <StyledDigitalTime aria-live="polite">
          {formatMMSS(Math.max(0, timeLeft))}
        </StyledDigitalTime>

        {!nextExercise && isNextLoading && (
          <StyledNextCard aria-busy="true" aria-label="Carregando proxima serie">
            <StyledNextCardAccentBar />
            <StyledNextCardContent>
              <StyledNextCardSkeletonStack>
                <StyledNextCardSkeletonLine $w="45%" $h="10px" />
                <StyledNextCardSkeletonLine $w="85%" $h="20px" />
                <StyledNextCardSkeletonLine $w="60%" $h="14px" />
                <StyledNextCardSkeletonLine $w="70%" $h="28px" />
              </StyledNextCardSkeletonStack>
            </StyledNextCardContent>
          </StyledNextCard>
        )}

        {/* Continua disponivel enquanto o preview carrega: se a rede travar,
            o usuario nao pode ficar preso no esqueleto sem saida. */}
        {!nextExercise && (
          <StyledSkipRestBtn type="button" onClick={onDismiss}>
            Pular descanso
          </StyledSkipRestBtn>
        )}

        {nextExercise && (
          <StyledNextCard>
            <StyledNextCardAccentBar />
            <StyledNextCardContent>
              <StyledNextCardHeader>
                <StyledNextCardLabel>
                  {nextExercise.isNewExercise
                    ? "Próximo exercício"
                    : "Próxima série"}
                </StyledNextCardLabel>
              </StyledNextCardHeader>

              <StyledNextCardName>{nextExercise.name}</StyledNextCardName>

              <StyledNextCardChips>
                <StyledNextCardMuscleChip>
                  {nextExercise.muscleGroup}
                </StyledNextCardMuscleChip>
                <StyledNextCardTypeChip>
                  {nextExercise.seriesTypeLabel}
                </StyledNextCardTypeChip>
              </StyledNextCardChips>

              <StyledNextCardStats>
                {nextExercise.lastWeight != null && (
                  <StyledNextCardStat>
                    <StyledNextCardStatLabel>Peso</StyledNextCardStatLabel>
                    <StyledNextCardStatValue>
                      {nextExercise.lastWeight}
                      <StyledNextCardStatUnit>KG</StyledNextCardStatUnit>
                    </StyledNextCardStatValue>
                  </StyledNextCardStat>
                )}
                {nextExercise.repsMin != null && (
                  <StyledNextCardStat>
                    <StyledNextCardStatLabel>Reps</StyledNextCardStatLabel>
                    <StyledNextCardStatValue>
                      {nextExercise.repsMin === nextExercise.repsMax
                        ? nextExercise.repsMin
                        : `${nextExercise.repsMin} - ${nextExercise.repsMax}`}
                      <StyledNextCardStatUnit></StyledNextCardStatUnit>
                    </StyledNextCardStatValue>
                  </StyledNextCardStat>
                )}
              </StyledNextCardStats>

              <StyledNextCardCta type="button" onClick={onDismiss}>
                Começar agora
              </StyledNextCardCta>
            </StyledNextCardContent>
          </StyledNextCard>
        )}
      </StyledOverlayBody>
    </StyledRestOverlay>
  );
}
