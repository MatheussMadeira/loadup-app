"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, AlertTriangle, X } from "lucide-react";
import styled from "styled-components";

import { toast } from "sonner";

import { useFriendSheet } from "@/hooks/useTrainingSheet";
import { useCopyDay } from "@/hooks/useTrainingSheet";
import { userService } from "@/services/userService";
import { DayOfWeek } from "@/types";
import { useQuery } from "@tanstack/react-query";
import { useEffect, useRef } from "react";
import { useScrollLock } from "@/hooks/useScrollLock";
const DAY_FULL: Record<string, string> = {
  monday: "Segunda-feira",
  tuesday: "Terça-feira",
  wednesday: "Quarta-feira",
  thursday: "Quinta-feira",
  friday: "Sexta-feira",
  saturday: "Sábado",
  sunday: "Domingo",
};

const DAY_SHORT: Record<string, string> = {
  monday: "SEG",
  tuesday: "TER",
  wednesday: "QUA",
  thursday: "QUI",
  friday: "SEX",
  saturday: "SÁB",
  sunday: "DOM",
};

const ALL_DAYS = [
  "monday",
  "tuesday",
  "wednesday",
  "thursday",
  "friday",
  "saturday",
  "sunday",
];

function getInitials(name: string) {
  return name
    .split(" ")
    .map((s) => s[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

function formatMemberSince(dateStr: string) {
  return new Date(dateStr).toLocaleDateString("pt-BR", {
    month: "long",
    year: "numeric",
  });
}

export default function FriendProfilePage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [copyDay, setCopyDay] = useState<string | null>(null);

  const profile = useQuery({
    queryKey: ["user-profile", id],
    queryFn: () => userService.getProfile(id),
    enabled: !!id,
  });

  const sheet = useFriendSheet(id);

  const name = profile.data?.name ?? "Carregando...";
  const initials = name !== "Carregando..." ? getInitials(name) : "...";

  const selectedDay = sheet.data?.days.find((d) => d.dayOfWeek === copyDay);

  return (
    <PageWrapper>
      <GlowBg />

      <TopBar>
        <BackBtn onClick={() => router.back()}>
          <ArrowLeft size={18} />
        </BackBtn>
      </TopBar>

      <Hero>
        <AvatarLarge>{initials}</AvatarLarge>
        <HeroName>{name.toUpperCase()}</HeroName>
        {profile.data?.createdAt && (
          <HeroSub>
            Membro desde {formatMemberSince(profile.data.createdAt)}
          </HeroSub>
        )}
        <BadgeRow>
          {profile.data?.isPublic && (
            <Badge $color="success">Perfil público</Badge>
          )}
          <Badge $color="primary">Amigo</Badge>
        </BadgeRow>
      </Hero>

      <PlanSection>
        <SectionLabel>Plano de Treino</SectionLabel>

        {sheet.isLoading ? (
          <>
            <SkeletonCard />
            <SkeletonCard />
            <SkeletonCard />
          </>
        ) : (
          ALL_DAYS.map((dow) => {
            const day = sheet.data?.days.find((d) => d.dayOfWeek === dow);
            const isRest = !day || day.status === "rest";
            const muscles = Array.from(
              new Set(day?.exercises.map((ex) => ex.muscleGroup) ?? []),
            );
            const exerciseCount = day?.exercises.length ?? 0;
            const seriesCount =
              day?.exercises.reduce((acc, ex) => acc + ex.series.length, 0) ??
              0;

            return (
              <DayCard key={dow} $isRest={isRest}>
                <DayCircle $isRest={isRest}>{DAY_SHORT[dow]}</DayCircle>
                <DayContent>
                  <DayName>{DAY_FULL[dow]}</DayName>
                  {isRest ? (
                    <DayMeta>Descanso</DayMeta>
                  ) : (
                    <>
                      <ChipsRow>
                        {muscles.map((m) => (
                          <MuscleChip key={m}>{m}</MuscleChip>
                        ))}
                      </ChipsRow>
                      <DayMeta>
                        {exerciseCount} exercícios · {seriesCount} séries
                      </DayMeta>
                    </>
                  )}
                </DayContent>
                {isRest ? (
                  <RestLabel>Descanso</RestLabel>
                ) : (
                  <CopyBtn onClick={() => setCopyDay(dow)}>Copiar</CopyBtn>
                )}
              </DayCard>
            );
          })
        )}
      </PlanSection>

      {copyDay && selectedDay && (
        <CopySheet
          sourceUserId={id}
          sourceDayOfWeek={copyDay}
          sourceDay={selectedDay}
          myDays={sheet.data?.days ?? []}
          onClose={() => setCopyDay(null)}
        />
      )}
    </PageWrapper>
  );
}

/* ─── Copy Sheet ─────────────────────────────────── */

function CopySheet({
  sourceUserId,
  sourceDayOfWeek,
  sourceDay,
  myDays,
  onClose,
}: {
  sourceUserId: string;
  sourceDayOfWeek: string;
  sourceDay: { exercises: { name: string; series: unknown[] }[] };
  myDays: { dayOfWeek: string; status: string; exercises: unknown[] }[];
  onClose: () => void;
}) {
  const [targetDay, setTargetDay] = useState<string | null>(null);
  const copyDay = useCopyDay();
  const [startY, setStartY] = useState(0);
  const [dragY, setDragY] = useState(0);
  const sheetRef = useRef<HTMLDivElement>(null);
  const targetDayData = myDays.find((d) => d.dayOfWeek === targetDay);
  const hasExercises =
    targetDayData &&
    targetDayData.status === "training" &&
    (targetDayData.exercises as unknown[]).length > 0;

  const handleConfirm = async () => {
    if (!targetDay) return;
    try {
      await copyDay.mutateAsync({
        sourceUserId,
        sourceDayOfWeek,
        targetDayOfWeek: targetDay,
      });
      toast.success("Treino copiado com sucesso!");
      onClose();
    } catch {
      toast.error("Erro ao copiar treino. Tente novamente.");
    }
  };

  const visibleExercises = sourceDay.exercises.slice(0, 4);
  const extraCount = sourceDay.exercises.length - 4;
  useScrollLock();

  const handleTouchStart = (e: React.TouchEvent) => {
    setStartY(e.touches[0].clientY);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    const delta = e.touches[0].clientY - startY;
    if (delta > 0) setDragY(delta);
  };

  const handleTouchEnd = () => {
    if (dragY > 100) {
      onClose();
    }
    setDragY(0);
  };
  return (
    <>
      <SheetBackdrop onClick={onClose} />
      <Sheet
        ref={sheetRef}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        style={{
          transform: `translateX(-50%) translateY(${dragY}px)`,
          transition:
            dragY > 0
              ? "none"
              : "transform 300ms cubic-bezier(0.16, 1, 0.3, 1)",
        }}
      >
        {" "}
        <SheetHandle />
        <SheetHeader>
          <div>
            <SheetTitle>Copiar Treino</SheetTitle>
            <SheetSub>{DAY_FULL[sourceDayOfWeek]}</SheetSub>
          </div>
          <CloseBtn onClick={onClose}>
            <X size={18} />
          </CloseBtn>
        </SheetHeader>
        <SheetSection>
          <SheetLabel>Exercícios</SheetLabel>
          <ExerciseList>
            {visibleExercises.map((ex, i) => (
              <ExerciseRow
                key={i}
                $last={i === visibleExercises.length - 1 && extraCount <= 0}
              >
                <ExerciseNum>{String(i + 1).padStart(2, "0")}</ExerciseNum>
                <ExerciseName>{ex.name}</ExerciseName>
                <ExerciseSeries>{ex.series.length}x</ExerciseSeries>
              </ExerciseRow>
            ))}
            {extraCount > 0 && <ExtraText>+{extraCount} exercícios</ExtraText>}
          </ExerciseList>
        </SheetSection>
        <SheetSection>
          <SheetLabel>Copiar para qual dia?</SheetLabel>
          <DayGrid>
            {ALL_DAYS.map((dow) => {
              const d = myDays.find((x) => x.dayOfWeek === dow);
              const isRest = !d || d.status === "rest";
              const hasEx =
                d &&
                d.status === "training" &&
                (d.exercises as unknown[]).length > 0;
              const selected = targetDay === dow;

              return (
                <DayPill
                  key={dow}
                  $selected={selected}
                  $isRest={isRest}
                  onClick={() => !isRest && setTargetDay(dow)}
                >
                  {DAY_SHORT[dow]}
                  {hasEx && !selected && <DayDot />}
                </DayPill>
              );
            })}
          </DayGrid>
        </SheetSection>
        {hasExercises && (
          <WarningBanner>
            <AlertTriangle size={16} />
            <WarningText>
              Este dia já tem exercícios e serão substituídos.
            </WarningText>
          </WarningBanner>
        )}
        <SheetActions>
          <SheetCancelBtn onClick={onClose}>Cancelar</SheetCancelBtn>
          <SheetConfirmBtn
            onClick={handleConfirm}
            disabled={!targetDay || copyDay.isPending}
          >
            {copyDay.isPending ? "Copiando..." : "Confirmar cópia"}
          </SheetConfirmBtn>
        </SheetActions>
      </Sheet>
    </>
  );
}

/* ─── Styled Components ─────────────────────────── */

const PageWrapper = styled.div`
  position: relative;
  min-height: 100%;
  background: ${({ theme }) => theme.colors.background};
  color: ${({ theme }) => theme.colors.onSurface};
  margin: 0 auto;
  padding-bottom: 32px;
  overflow-x: hidden;
`;

const GlowBg = styled.div`
  pointer-events: none;
  position: absolute;
  top: -80px;
  left: 50%;
  transform: translateX(-50%);
  width: 100%;
  height: 100vh;
  border-radius: 50%;
  background: radial-gradient(
    closest-side,
    rgba(59, 130, 246, 0.2),
    transparent
  );
`;

const TopBar = styled.div`
  position: relative;
  padding: 24px 20px 0;
`;

const BackBtn = styled.button`
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: ${({ theme }) => theme.colors.surfaceElevated};
  border: 1px solid ${({ theme }) => theme.colors.outlineVariant};
  color: ${({ theme }) => theme.colors.onSurface};
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
`;

const Hero = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  padding: 24px 20px 32px;
  gap: 8px;
`;

const AvatarLarge = styled.div`
  width: 72px;
  height: 72px;
  border-radius: 50%;
  background: ${({ theme }) => theme.colors.primary};
  color: ${({ theme }) => theme.colors.onPrimary};
  display: flex;
  align-items: center;
  justify-content: center;
  font-family: var(--font-barlow), sans-serif;
  font-weight: 900;
  font-size: 26px;
  box-shadow: 0 0 32px rgba(59, 130, 246, 0.4);
  margin-bottom: 8px;
`;

const HeroName = styled.h1`
  font-family: var(--font-barlow), sans-serif;
  font-weight: 900;
  font-size: 40px;
  line-height: 0.95;
  color: ${({ theme }) => theme.colors.onSurface};
  margin: 0;
`;

const HeroSub = styled.p`
  font-family: var(--font-inter), sans-serif;
  font-size: 13px;
  color: ${({ theme }) => theme.colors.onSurfaceMuted};
  margin: 0;
`;

const BadgeRow = styled.div`
  display: flex;
  gap: 8px;
  margin-top: 4px;
`;

const Badge = styled.span<{ $color: "primary" | "success" }>`
  padding: 4px 12px;
  border-radius: ${({ theme }) => theme.borderRadius.pill};
  font-family: var(--font-barlow), sans-serif;
  font-weight: 600;
  font-size: 10px;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  background: ${({ theme, $color }) =>
    $color === "primary"
      ? theme.colors.primaryContainer
      : theme.colors.successContainer};
  color: ${({ theme, $color }) =>
    $color === "primary" ? theme.colors.primary : theme.colors.success};
  border: 1px solid
    ${({ theme, $color }) =>
      $color === "primary"
        ? `${theme.colors.primary}40`
        : `${theme.colors.success}40`};
`;

const PlanSection = styled.div`
  padding: 0 20px;
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

const SectionLabel = styled.span`
  font-family: var(--font-barlow), sans-serif;
  font-size: 11px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  color: ${({ theme }) => theme.colors.onSurfaceMuted};
  padding-left: 4px;
`;

const DayCard = styled.div<{ $isRest: boolean }>`
  display: flex;
  align-items: center;
  gap: 12px;
  background: ${({ theme }) => theme.colors.surfaceElevated};
  border: 1px solid ${({ theme }) => theme.colors.outlineVariant};
  border-radius: ${({ theme }) => theme.borderRadius.inner};
  padding: 12px 16px;
  opacity: ${({ $isRest }) => ($isRest ? 0.45 : 1)};
`;

const DayCircle = styled.div<{ $isRest: boolean }>`
  width: 44px;
  height: 44px;
  border-radius: 50%;
  background: ${({ theme, $isRest }) =>
    $isRest ? theme.colors.surface : theme.colors.primary};
  color: ${({ theme, $isRest }) =>
    $isRest ? theme.colors.onSurfaceMuted : theme.colors.onPrimary};
  display: flex;
  align-items: center;
  justify-content: center;
  font-family: var(--font-barlow), sans-serif;
  font-weight: 700;
  font-size: 11px;
  flex-shrink: 0;
`;

const DayContent = styled.div`
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 4px;
`;

const DayName = styled.span`
  font-family: var(--font-inter), sans-serif;
  font-weight: 600;
  font-size: 14px;
  color: ${({ theme }) => theme.colors.onSurface};
`;

const ChipsRow = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
`;

const MuscleChip = styled.span`
  padding: 2px 8px;
  border-radius: ${({ theme }) => theme.borderRadius.pill};
  background: ${({ theme }) => theme.colors.primaryContainer};
  color: ${({ theme }) => theme.colors.primary};
  font-family: var(--font-barlow), sans-serif;
  font-size: 10px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  border: 1px solid ${({ theme }) => theme.colors.primary}30;
`;

const DayMeta = styled.span`
  font-family: var(--font-inter), sans-serif;
  font-size: 11px;
  color: ${({ theme }) => theme.colors.onSurfaceMuted};
`;

const RestLabel = styled.span`
  font-family: var(--font-barlow), sans-serif;
  font-size: 10px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  color: ${({ theme }) => theme.colors.onSurfaceMuted};
  flex-shrink: 0;
`;

const CopyBtn = styled.button`
  height: 32px;
  padding: 0 14px;
  border-radius: ${({ theme }) => theme.borderRadius.pill};
  border: 1.5px solid ${({ theme }) => theme.colors.primary};
  background: transparent;
  color: ${({ theme }) => theme.colors.primary};
  font-family: var(--font-barlow), sans-serif;
  font-weight: 600;
  font-size: 11px;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  cursor: pointer;
  flex-shrink: 0;
  transition: all 150ms ease;

  &:hover {
    background: ${({ theme }) => theme.colors.primaryContainer};
  }
`;

const SkeletonCard = styled.div`
  height: 72px;
  border-radius: ${({ theme }) => theme.borderRadius.inner};
  background: ${({ theme }) => theme.colors.surfaceElevated};
  opacity: 0.5;
`;

/* ─── Copy Sheet Styled ──────────────────────────── */

const SheetBackdrop = styled.div`
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.7);
  backdrop-filter: blur(8px);
  z-index: 490;
`;

const Sheet = styled.div`
  position: fixed;
  bottom: 0;
  left: 50%;
  transform: translateX(-50%);
  width: 100%;
  max-width: 480px;
  background: ${({ theme }) => theme.colors.surfaceElevated};
  border-radius: 24px 24px 0 0;
  border-top: 1px solid ${({ theme }) => theme.colors.outlineVariant};
  padding: 12px 20px 40px;
  z-index: 500;
  max-height: 90vh;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 20px;
  animation: slideUp 300ms cubic-bezier(0.16, 1, 0.3, 1);

  @keyframes slideUp {
    from {
      transform: translateX(-50%) translateY(100%);
    }
    to {
      transform: translateX(-50%) translateY(0);
    }
  }
`;

const SheetHandle = styled.div`
  width: 40px;
  height: 4px;
  border-radius: 999px;
  background: white;
  margin: 0 auto 8px;
  @media (max-width: 768px) {
    background: ${({ theme }) => theme.colors.outlineVariant};
  }
`;

const SheetHeader = styled.div`
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
`;

const SheetTitle = styled.h2`
  font-family: var(--font-barlow), sans-serif;
  font-weight: 900;
  font-size: 22px;
  text-transform: uppercase;
  color: ${({ theme }) => theme.colors.onSurface};
  margin: 0;
`;

const SheetSub = styled.p`
  font-family: var(--font-inter), sans-serif;
  font-size: 13px;
  color: ${({ theme }) => theme.colors.onSurfaceMuted};
  margin: 4px 0 0;
`;

const CloseBtn = styled.button`
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background: ${({ theme }) => theme.colors.surface};
  border: none;
  color: ${({ theme }) => theme.colors.onSurfaceMuted};
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  flex-shrink: 0;
  @media (max-width: 768px) {
    display: none;
  }
`;

const SheetSection = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

const SheetLabel = styled.span`
  font-family: var(--font-barlow), sans-serif;
  font-size: 11px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  color: ${({ theme }) => theme.colors.onSurfaceMuted};
`;

const ExerciseList = styled.div`
  display: flex;
  flex-direction: column;
`;

const ExerciseRow = styled.div<{ $last: boolean }>`
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 10px 0;
  border-bottom: ${({ theme, $last }) =>
    $last ? "none" : `1px solid ${theme.colors.outlineVariant}30`};
`;

const ExerciseNum = styled.span`
  font-family: var(--font-bebas), sans-serif;
  font-size: 18px;
  color: ${({ theme }) => theme.colors.primary};
  width: 28px;
  flex-shrink: 0;
`;

const ExerciseName = styled.span`
  font-family: var(--font-inter), sans-serif;
  font-weight: 600;
  font-size: 14px;
  color: ${({ theme }) => theme.colors.onSurface};
  flex: 1;
`;

const ExerciseSeries = styled.span`
  font-family: var(--font-inter), sans-serif;
  font-size: 13px;
  color: ${({ theme }) => theme.colors.onSurfaceMuted};
`;

const ExtraText = styled.p`
  font-family: var(--font-inter), sans-serif;
  font-size: 12px;
  color: ${({ theme }) => theme.colors.onSurfaceMuted};
  text-align: center;
  padding: 8px 0 0;
  margin: 0;
`;

const DayGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 8px;
`;

const DayPill = styled.button<{ $selected: boolean; $isRest: boolean }>`
  position: relative;
  height: 48px;
  border-radius: 12px;
  font-family: var(--font-barlow), sans-serif;
  font-weight: 700;
  font-size: 12px;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  cursor: ${({ $isRest }) => ($isRest ? "not-allowed" : "pointer")};
  display: flex;
  align-items: center;
  justify-content: center;
  flex-direction: column;
  gap: 3px;
  transition: all 150ms ease;

  background: ${({ theme, $selected }) =>
    $selected ? theme.colors.primary : theme.colors.surface};
  color: ${({ theme, $selected, $isRest }) =>
    $selected
      ? theme.colors.onPrimary
      : $isRest
        ? `${theme.colors.onSurfaceMuted}60`
        : theme.colors.onSurfaceMuted};
  border: ${({ theme, $isRest }) =>
    $isRest
      ? `1px dashed ${theme.colors.outlineVariant}60`
      : `1px solid ${theme.colors.outlineVariant}`};
  box-shadow: ${({ $selected }) =>
    $selected ? "0 0 20px rgba(59,130,246,0.4)" : "none"};
`;

const DayDot = styled.span`
  width: 4px;
  height: 4px;
  border-radius: 50%;
  background: ${({ theme }) => theme.colors.primary};
  position: absolute;
  bottom: 6px;
`;

const WarningBanner = styled.div`
  display: flex;
  align-items: flex-start;
  gap: 10px;
  padding: 10px 14px;
  border-radius: 12px;
  background: rgba(245, 158, 11, 0.12);
  border: 1px solid rgba(245, 158, 11, 0.35);
  color: #f59e0b;
`;

const WarningText = styled.p`
  font-family: var(--font-inter), sans-serif;
  font-size: 13px;
  color: #f59e0b;
  margin: 0;
`;

const SheetActions = styled.div`
  display: flex;
  gap: 8px;
`;

const SheetCancelBtn = styled.button`
  flex: 1;
  height: 52px;
  border-radius: ${({ theme }) => theme.borderRadius.pill};
  border: 1px solid ${({ theme }) => theme.colors.outlineVariant};
  background: transparent;
  color: ${({ theme }) => theme.colors.onSurfaceMuted};
  font-family: var(--font-barlow), sans-serif;
  font-weight: 600;
  font-size: 13px;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  cursor: pointer;
`;

const SheetConfirmBtn = styled.button`
  flex: 1.4;
  height: 52px;
  border-radius: ${({ theme }) => theme.borderRadius.pill};
  border: none;
  background: ${({ theme }) => theme.colors.primary};
  color: ${({ theme }) => theme.colors.onPrimary};
  font-family: var(--font-barlow), sans-serif;
  font-weight: 900;
  font-size: 14px;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  cursor: pointer;
  box-shadow: 0 0 24px rgba(59, 130, 246, 0.4);
  transition: opacity 150ms ease;

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
    box-shadow: none;
  }
`;
