import styled, { keyframes } from "styled-components";

const shimmer = keyframes`
  0% { background-position: -400px 0; }
  100% { background-position: 400px 0; }
`;

export const StyledSessionPage = styled.div`
  position: relative;
  min-height: 100%;
  background: ${({ theme }) => theme.colors.background};
  /* Altura da StyledSessionBottomBar fixa desta tela. */
  padding-bottom: 92px;
  color: ${({ theme }) => theme.colors.onSurface};
`;

export const StyledSessionHeader = styled.header`
  padding: 24px 16px 16px;
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.sm};
`;

export const StyledSessionTopRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
`;

export const StyledBackBtn = styled.button`
  background: ${({ theme }) => theme.colors.surface};
  border: 1px solid ${({ theme }) => theme.colors.outlineVariant};
  border-radius: 50%;
  width: 44px;
  height: 44px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: ${({ theme }) => theme.colors.primary};
  cursor: pointer;
  flex-shrink: 0;
  transition: background 150ms ease, transform 150ms ease;

  &:hover {
    background: ${({ theme }) => theme.colors.primaryContainer};
    transform: translateY(-1px);
  }

  &:focus-visible {
    outline: 2px solid ${({ theme }) => theme.colors.primary};
    outline-offset: 2px;
  }
`;

export const StyledMenuBtn = styled.button`
  background: ${({ theme }) => theme.colors.surface};
  border: 1px solid ${({ theme }) => theme.colors.outlineVariant};
  border-radius: 50%;
  width: 44px;
  height: 44px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: ${({ theme }) => theme.colors.onSurface};
  cursor: pointer;
  flex-shrink: 0;
  transition: background 150ms ease, transform 150ms ease;

  &:hover {
    background: ${({ theme }) => theme.colors.surfaceElevated};
    transform: translateY(-1px);
  }

  &:focus-visible {
    outline: 2px solid ${({ theme }) => theme.colors.primary};
    outline-offset: 2px;
  }
`;

export const StyledProgressBadge = styled.span`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 10px 14px;
  border-radius: 999px;
  background: ${({ theme }) => theme.colors.primary};
  color: ${({ theme }) => theme.colors.onPrimary};
  font-family: "Barlow Condensed", Inter, sans-serif;
  font-size: 12px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.12em;
`;

export const StyledSessionDayName = styled.h1`
  font-family: "Barlow Condensed", Inter, sans-serif;
  font-size: 2.8rem;
  font-weight: 900;
  line-height: 1.05;
  margin: 0;
  color: ${({ theme }) => theme.colors.onSurface};
`;

export const StyledSessionMuscleRow = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
`;

export const StyledSessionMuscle = styled.span`
  font-family: "Barlow Condensed", Inter, sans-serif;
  font-size: 11px;
  font-weight: 600;
  color: ${({ theme }) => theme.colors.primary};
  letter-spacing: 0.08em;
  text-transform: uppercase;
`;

export const StyledSessionBody = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.lg};
  padding: 0 16px 120px;
  margin-top: 8px;
`;

export const StyledExerciseSection = styled.div`
  background: ${({ theme }) => theme.colors.surfaceElevated};
  border-radius: ${({ theme }) => theme.borderRadius.inner};
  padding: ${({ theme }) => theme.spacing.md};
  box-shadow: ${({ theme }) => theme.shadows.card};
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.md};
`;

export const StyledExerciseHeader = styled.div`
  display: flex;
  align-items: flex-start;
  gap: ${({ theme }) => theme.spacing.sm};
`;

export const StyledExerciseNum = styled.div`
  width: 38px;
  height: 38px;
  border-radius: 50%;
  background: ${({ theme }) => theme.colors.primaryContainer};
  color: ${({ theme }) => theme.colors.primary};
  font-size: 14px;
  font-weight: 700;
  display: grid;
  place-items: center;
  flex-shrink: 0;
`;

export const StyledExerciseInfo = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
  min-width: 0;
`;

export const StyledExerciseName = styled.h2`
  font-family: "Barlow Condensed", Inter, sans-serif;
  font-size: 2.5rem;
  font-weight: 900;
  line-height: 1.02;
  margin: 0;
  color: ${({ theme }) => theme.colors.onSurface};
`;

export const StyledExerciseMuscle = styled.span`
  font-family: "Barlow Condensed", Inter, sans-serif;
  font-size: 12px;
  font-weight: 600;
  color: ${({ theme }) => theme.colors.primary};
  letter-spacing: 0.08em;
  text-transform: uppercase;
`;

export const StyledSeriesList = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.sm};
`;

export const StyledDoneBanner = styled.div<{ $skipped: boolean }>`
  margin: ${({ theme }) => theme.spacing.md} 0;
  padding: ${({ theme }) => theme.spacing.md};
  border-radius: ${({ theme }) => theme.borderRadius.inner};
  background: ${({ $skipped, theme }) =>
    $skipped ? theme.colors.errorContainer : theme.colors.successContainer};
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
  text-align: center;
`;

export const StyledDoneBannerIcon = styled.span<{ $skipped?: boolean }>`
  font-size: 28px;
  font-weight: 700;
  color: ${({ $skipped, theme }) =>
    $skipped ? theme.colors.error : theme.colors.success};
`;

export const StyledDoneBannerText = styled.p`
  font-size: ${({ theme }) => theme.typography.titleMedium.fontSize};
  font-weight: 700;
  color: ${({ theme }) => theme.colors.onSurface};
  margin: 0;
`;

export const StyledDoneBannerSub = styled.p`
  font-size: 13px;
  color: ${({ theme }) => theme.colors.onSurfaceMuted};
  margin: 0;
`;

export const StyledEmptyText = styled.p`
  font-size: ${({ theme }) => theme.typography.bodyMedium.fontSize};
  color: ${({ theme }) => theme.colors.onSurfaceMuted};
  text-align: center;
  padding: ${({ theme }) => theme.spacing.xl} 0;
  margin: 0;
`;

export const StyledSessionBottomBar = styled.div`
  position: fixed;
  bottom: var(--bottom-nav-height);
  left: 0;
  right: 0;
  display: flex;
  gap: ${({ theme }) => theme.spacing.sm};
  padding: 12px ${({ theme }) => theme.spacing.md} calc(12px + var(--floating-gap));
  background: ${({ theme }) => theme.colors.background};
  border-top: 1px solid ${({ theme }) => theme.colors.outlineVariant};
  box-shadow: 0 -4px 24px rgba(0, 0, 0, 0.05);
  z-index: 90;
`;

export const StyledSkipBtn = styled.button`
  flex: 1;
  padding: 14px 20px;
  border-radius: ${({ theme }) => theme.borderRadius.pill};
  border: 1.5px solid ${({ theme }) => theme.colors.onSurfaceMuted};
  background: transparent;
  color: ${({ theme }) => theme.colors.onSurfaceMuted};
  font-size: ${({ theme }) => theme.typography.labelLarge.fontSize};
  font-weight: 600;
  cursor: pointer;
  font-family: inherit;
  transition: background 150ms ease, transform 150ms ease;
  &:hover:not(:disabled) {
    background: ${({ theme }) => theme.colors.surface};
    transform: translateY(-1px);
  }
  &:active:not(:disabled) {
    opacity: 0.9;
  }
  &:disabled {
    opacity: 0.5;
  }
`;

export const StyledConcludeBtn = styled.button`
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  padding: 14px;
  border-radius: ${({ theme }) => theme.borderRadius.pill};
  border: none;
  background: ${({ theme }) => theme.colors.primary};
  color: ${({ theme }) => theme.colors.onPrimary};
  font-size: ${({ theme }) => theme.typography.labelLarge.fontSize};
  font-weight: 700;
  cursor: pointer;
  font-family: inherit;
  transition: transform 150ms ease, opacity 150ms ease;
  &:hover:not(:disabled) {
    transform: translateY(-1px);
  }
  &:active:not(:disabled) {
    opacity: 0.85;
  }
  &:disabled {
    opacity: 0.5;
  }
`;

export const StyledSheetBackdrop = styled.div`
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.5);
  z-index: 200;
  display: flex;
  align-items: flex-end;
  justify-content: center;
  @media (prefers-reduced-motion: no-preference) {
    animation: fadeIn 150ms ease;
  }
  @keyframes fadeIn {
    from {
      opacity: 0;
    }
    to {
      opacity: 1;
    }
  }
`;

export const StyledSheet = styled.div`
  width: 100%;
  max-width: 430px;
  background: ${({ theme }) => theme.colors.surface};
  border-radius: ${({ theme }) =>
    `${theme.borderRadius.inner} ${theme.borderRadius.inner} 0 0`};
  padding: ${({ theme }) => theme.spacing.lg} ${({ theme }) => theme.spacing.md};
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.md};
  @media (prefers-reduced-motion: no-preference) {
    animation: slideUp 200ms cubic-bezier(0.16, 1, 0.3, 1);
  }
  @keyframes slideUp {
    from {
      transform: translateY(100%);
    }
    to {
      transform: translateY(0);
    }
  }
`;

export const StyledSheetTitle = styled.p`
  font-size: ${({ theme }) => theme.typography.titleLarge.fontSize};
  font-weight: 700;
  color: ${({ theme }) => theme.colors.onSurface};
  text-align: center;
`;

export const StyledSheetSub = styled.p`
  font-size: ${({ theme }) => theme.typography.bodyMedium.fontSize};
  color: ${({ theme }) => theme.colors.onSurfaceMuted};
  text-align: center;
`;

export const StyledSheetConfirmBtn = styled.button`
  width: 100%;
  padding: 14px;
  border-radius: ${({ theme }) => theme.borderRadius.pill};
  border: none;
  background: ${({ theme }) => theme.colors.error};
  color: ${({ theme }) => theme.colors.onPrimary};
  font-size: 14px;
  font-weight: 700;
  cursor: pointer;
  font-family: inherit;
  transition: opacity 150ms ease;
  &:hover {
    opacity: 0.88;
  }
  &:active {
    opacity: 0.76;
  }
  &:focus-visible {
    outline: 2px solid ${({ theme }) => theme.colors.error};
    outline-offset: 2px;
  }
`;

export const StyledSheetCancelBtn = styled.button`
  width: 100%;
  padding: 14px;
  border-radius: ${({ theme }) => theme.borderRadius.pill};
  border: 1.5px solid ${({ theme }) => theme.colors.outlineVariant};
  background: transparent;
  color: ${({ theme }) => theme.colors.onSurface};
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  font-family: inherit;
  transition: border-color 150ms ease;
  &:hover {
    border-color: ${({ theme }) => theme.colors.outline};
  }
  &:active {
    opacity: 0.8;
  }
  &:focus-visible {
    outline: 2px solid ${({ theme }) => theme.colors.outline};
    outline-offset: 2px;
  }
`;

export const StyledErrorToast = styled.div`
  position: fixed;
  bottom: var(--fab-bottom);
  left: 50%;
  transform: translateX(-50%);
  background: ${({ theme }) => theme.colors.errorContainer};
  color: ${({ theme }) => theme.colors.error};
  font-size: 13px;
  font-weight: 600;
  padding: 10px 20px;
  border-radius: ${({ theme }) => theme.borderRadius.pill};
  white-space: nowrap;
  z-index: 300;
  pointer-events: none;
  @media (prefers-reduced-motion: no-preference) {
    animation: toastIn 200ms ease;
  }
  @keyframes toastIn {
    from {
      opacity: 0;
      transform: translateX(-50%) translateY(8px);
    }
    to {
      opacity: 1;
      transform: translateX(-50%) translateY(0);
    }
  }
`;
export const StyledSessionStatusText = styled.p`
  font-size: 0.75rem;
  font-weight: 500;
  color: ${({ theme }) => theme.colors.onSurfaceMuted};
  margin: 0;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  font-family: "Barlow Condensed", sans-serif;
`;

export const StyledExerciseSkeleton = styled.div`
  height: 120px;
  border-radius: ${({ theme }) => theme.borderRadius.inner};
  background: linear-gradient(
    90deg,
    ${({ theme }) => theme.colors.surface} 25%,
    ${({ theme }) => theme.colors.surfaceElevated} 50%,
    ${({ theme }) => theme.colors.surface} 75%
  );
  background-size: 800px 100%;
  animation: ${shimmer} 1.5s infinite linear;
`;

export const StyledExerciseFocus = styled.div`
  display: flex;
  flex-direction: column;
  gap: 24px;
  padding: 24px 16px;
  flex: 1;
`;

export const StyledSeriesTypeBadgeFocus = styled.span`
  display: inline-flex;
  align-self: flex-start;
  padding: 6px 14px;
  border-radius: ${({ theme }) => theme.borderRadius.pill};
  background: ${({ theme }) => theme.colors.primary};
  color: ${({ theme }) => theme.colors.onPrimary};
  font-family: "Barlow Condensed", Inter, sans-serif;
  font-size: 11px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.12em;
`;

export const StyledExerciseNameFocus = styled.h2`
  font-family: "Barlow Condensed", Inter, sans-serif;
  font-size: clamp(2.5rem, 8vw, 3rem);
  font-weight: 900;
  line-height: 1.02;
  margin: 0;
  color: ${({ theme }) => theme.colors.onSurface};
`;

export const StyledExerciseMuscleFocus = styled.span`
  font-family: "Barlow Condensed", Inter, sans-serif;
  font-size: 12px;
  font-weight: 600;
  color: ${({ theme }) => theme.colors.primary};
  letter-spacing: 0.1em;
  text-transform: uppercase;
`;

export const StyledExerciseNameRow = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  flex-wrap: wrap;
`;

/** Peso sugerido acabou de ser ajustado por um alerta de platô. */
export const StyledNewWeightBadge = styled.span`
  display: inline-flex;
  align-items: center;
  padding: 4px 10px;
  border-radius: ${({ theme }) => theme.borderRadius.pill};
  background: ${({ theme }) => theme.colors.primaryContainer};
  color: ${({ theme }) => theme.colors.primary};
  font-family: "Barlow Condensed", Inter, sans-serif;
  font-size: 11px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.08em;
`;

/** Exercício com platô ativo (usuário dispensou o alerta sem ajustar o peso). */
export const StyledStagnantDot = styled.span`
  display: inline-block;
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: ${({ theme }) => theme.colors.onSurfaceMuted};
  flex-shrink: 0;
`;

export const StyledSeriesProgressDots = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 10px;
  padding: 8px 0 24px;
`;

export const StyledSeriesProgressDot = styled.span<{
  $completed: boolean;
  $current: boolean;
}>`
  width: ${({ $current }) => ($current ? "10px" : "8px")};
  height: ${({ $current }) => ($current ? "10px" : "8px")};
  border-radius: 50%;
  flex-shrink: 0;
  transition: width 150ms ease, height 150ms ease, background 150ms ease,
    border-color 150ms ease;
  background: ${({ theme, $completed, $current }) =>
    $completed || $current ? theme.colors.primary : "transparent"};
  border: ${({ theme, $completed, $current }) =>
    $completed || $current
      ? "none"
      : `1.5px solid ${theme.colors.outlineVariant}`};
`;

export const StyledActiveSessionLayout = styled.div`
  display: flex;
  flex-direction: column;
  min-height: calc(100% - 160px);
`;

export const StyledRestOverlay = styled.div`
  position: fixed;
  inset: 0;
  z-index: 500;
  background: ${({ theme }) => theme.colors.background};
  opacity: 0.97;
  backdrop-filter: blur(8px);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 32px;
`;

export const StyledClockWrapper = styled.div`
  width: 240px;
  height: 240px;
  position: relative;
  display: grid;
  place-items: center;
`;

export const StyledDigitalTime = styled.p`
  font-family: "Bebas Neue", Inter, sans-serif;
  font-size: 4rem;
  font-weight: 700;
  color: ${({ theme }) => theme.colors.onSurface};
  letter-spacing: 0.05em;
  margin: 0;
`;

export const StyledRestLabel = styled.p`
  font-family: "Barlow Condensed", Inter, sans-serif;
  font-size: 13px;
  font-weight: 600;
  text-transform: uppercase;
  color: ${({ theme }) => theme.colors.onSurfaceMuted};
  letter-spacing: 0.15em;
  margin: 0;
`;

export const StyledSkipRestBtn = styled.button`
  padding: 12px 32px;
  border-radius: 999px;
  border: 1px solid ${({ theme }) => theme.colors.onSurfaceMuted};
  background: transparent;
  color: ${({ theme }) => theme.colors.onSurfaceMuted};
  font-family: Inter, sans-serif;
  font-size: 14px;
  font-weight: 400;
  cursor: pointer;
  transition: background 150ms ease, transform 150ms ease;

  &:hover {
    background: ${({ theme }) => theme.colors.surface};
    transform: translateY(-1px);
  }
`;

const spin = keyframes`
  to { transform: rotate(360deg); }
`;

/** Spinner do botao "concluir serie" enquanto o registro esta sendo salvo. */
export const StyledBtnSpinner = styled.span`
  width: 16px;
  height: 16px;
  flex-shrink: 0;
  border-radius: 50%;
  border: 2px solid currentColor;
  border-top-color: transparent;
  animation: ${spin} 700ms linear infinite;

  @media (prefers-reduced-motion: reduce) {
    animation-duration: 2s;
  }
`;
