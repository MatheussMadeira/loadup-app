"use client";

import {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import { usePushNotifications } from "@/hooks/usePushNotifications";
import { pushNotificationService } from "@/services/pushNotificationService";

export interface NextExercisePreview {
  name: string;
  muscleGroup: string;
  isNewExercise: boolean;
  seriesTypeLabel: string;
  lastWeight: number | null;
  repsMin: number | null;
  repsMax: number | null;
}

interface RestTimerContextValue {
  isActive: boolean;
  timeLeft: number;
  restDuration: number;
  nextExercise: NextExercisePreview | null;
  startRestTimer: (duration: number, next: NextExercisePreview | null) => void;
  /**
   * Preenche o card de "proxima serie" depois que o descanso ja comecou.
   * O cronometro tem que largar no instante em que a serie termina, mas o
   * peso sugerido pode depender de uma chamada de rede — entao o timer
   * comeca sem preview e o preview chega aqui quando resolve.
   */
  setNextExercise: (next: NextExercisePreview | null) => void;
  stopRestTimer: () => void;
}

const RestTimerContext = createContext<RestTimerContextValue | null>(null);

export function RestTimerProvider({ children }: { children: ReactNode }) {
  const [isActive, setIsActive] = useState(false);
  const [targetTime, setTargetTime] = useState<number | null>(null);
  const [restDuration, setRestDuration] = useState(0);
  const [timeLeft, setTimeLeft] = useState(0);
  const [nextExercise, setNextExercise] = useState<NextExercisePreview | null>(null);
  const subscription = usePushNotifications();
  const pushScheduledForRef = useRef<number | null>(null);

  // Agenda o push assim que houver um ciclo ativo E a subscription estiver
  // disponível — o que pode acontecer bem depois do startRestTimer, já que o
  // registro do service worker/subscribe é assíncrono e pode ficar suspenso
  // enquanto o app está em background. O delay é sempre recalculado a partir
  // de targetTime (não da duração original), então funciona corretamente não
  // importa quando a subscription resolver. pushScheduledForRef é chaveado
  // pelo targetTime do ciclo atual, então sobrevive a remounts do overlay
  // (RestTimerProvider vive no layout, acima de toda a navegação) sem
  // agendar o mesmo push duas vezes.
  useEffect(() => {
    if (!isActive || !targetTime || !subscription) return;
    if (pushScheduledForRef.current === targetTime) return;

    const json = subscription.toJSON();
    if (!json.endpoint || !json.keys?.p256dh || !json.keys?.auth) return;

    const delaySeconds = Math.round((targetTime - Date.now()) / 1000);
    if (delaySeconds <= 0) return;

    pushScheduledForRef.current = targetTime;
    void pushNotificationService.schedulePush(
      {
        endpoint: json.endpoint,
        keys: { p256dh: json.keys.p256dh, auth: json.keys.auth },
      },
      delaySeconds,
    );
  }, [isActive, targetTime, subscription]);

  useEffect(() => {
    if (!isActive || !targetTime) return;

    const interval = setInterval(() => {
      const remaining = Math.round((targetTime - Date.now()) / 1000);
      const clamped = Math.max(0, remaining);
      setTimeLeft(clamped);

      if (remaining <= 0) {
        clearInterval(interval);
        setIsActive(false);
        setTargetTime(null);
        // Notifica todos os listeners (overlay ou widget) que o timer acabou
        window.dispatchEvent(new CustomEvent("rest-timer-end"));
      }
    }, 500);

    return () => clearInterval(interval);
  }, [isActive, targetTime]);

  const startRestTimer = useCallback(
    (duration: number, next: NextExercisePreview | null) => {
      setRestDuration(duration);
      setTimeLeft(duration);
      setTargetTime(Date.now() + duration * 1000);
      setNextExercise(next);
      setIsActive(true);
    },
    [],
  );

  const stopRestTimer = useCallback(() => {
    // Se o descanso ainda estava rodando (isActive), quem chamou foi um
    // dismiss manual (ex.: "Começar agora"/"Pular descanso") antes do fim
    // natural — cancela o push já agendado pra não sobrar notificação
    // "atrasada" pra um descanso que o usuário já encerrou por conta própria.
    // Quando o fim é natural, o interval acima já zera isActive antes de
    // chamar stopRestTimer, então esse cancelamento não roda à toa.
    if (isActive && targetTime && subscription && pushScheduledForRef.current === targetTime) {
      const json = subscription.toJSON();
      if (json.endpoint) {
        void pushNotificationService.cancelPush(json.endpoint);
      }
      pushScheduledForRef.current = null;
    }
    setIsActive(false);
    setTargetTime(null);
    setTimeLeft(0);
    setNextExercise(null);
  }, [isActive, targetTime, subscription]);

  const value = useMemo(
    () => ({
      isActive,
      timeLeft,
      restDuration,
      nextExercise,
      startRestTimer,
      setNextExercise,
      stopRestTimer,
    }),
    [
      isActive,
      timeLeft,
      restDuration,
      nextExercise,
      startRestTimer,
      stopRestTimer,
    ],
  );

  return (
    <RestTimerContext.Provider value={value}>
      {children}
    </RestTimerContext.Provider>
  );
}

export function useRestTimer() {
  const ctx = useContext(RestTimerContext);
  if (!ctx) throw new Error("useRestTimer must be used within a RestTimerProvider");
  return ctx;
}
