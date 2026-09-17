import styled, { keyframes } from "styled-components";

export const StyledRestOverlay = styled.div`
  position: fixed;
  inset: 0;
  z-index: 500;
  background: ${({ theme }) => theme.colors.background};
  opacity: 0.97;
  backdrop-filter: blur(20px);
  border-radius: 28px 28px 0 0;
  display: flex;
  flex-direction: column;
  overflow-y: auto;
  overscroll-behavior: contain;
`;

export const StyledHandleButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  align-self: stretch;
  flex-shrink: 0;
  width: 100%;
  padding-top: max(env(safe-area-inset-top, 0px), 12px);
  padding-bottom: 20px;
  border: none;
  background: transparent;
  cursor: grab;
  touch-action: none;

  &:active {
    cursor: grabbing;
  }
`;

export const StyledOverlayBody = styled.div`
  flex: 1;
  min-height: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 32px;
  padding-bottom: calc(env(safe-area-inset-bottom, 0px) + 24px);
`;

export const StyledHandleBar = styled.span`
  width: 40px;
  height: 4px;
  border-radius: 999px;
  background: ${({ theme }) => theme.colors.outlineVariant};
`;

export const StyledClockWrapper = styled.div`
  width: 100%;
  position: relative;
  display: grid;
  place-items: center;
`;

export const StyledClockSvg = styled.svg`
  width: min(240px, 55vw);
  aspect-ratio: 1;
  height: auto;
`;

export const StyledDigitalTime = styled.p`
  font-family: "Bebas Neue", Inter, sans-serif;
  font-size: 3rem;
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

const CARD_RADIUS = "24px";
const CARD_PAD_X = "clamp(16px, 5vw, 20px)";
const CARD_PAD_Y = "clamp(14px, 4vw, 16px)";

export const StyledNextCard = styled.div`
  position: relative;
  width: 100%;
  max-width: min(300px, calc(100% - 32px));
  border-radius: ${CARD_RADIUS};
  overflow: hidden;
  background: linear-gradient(
    180deg,
    ${({ theme }) => theme.colors.surface} 0%,
    ${({ theme }) => theme.colors.background} 100%
  );
  border: 1px solid ${({ theme }) => theme.colors.primary}59;
  box-shadow: 0 20px 60px -20px ${({ theme }) => theme.colors.primary}59;
`;

export const StyledNextCardAccentBar = styled.div`
  position: absolute;
  left: 0;
  top: 0;
  bottom: 0;
  width: 3px;
  background-color: ${({ theme }) => theme.colors.primary};
`;

export const StyledNextCardContent = styled.div`
  padding: ${CARD_PAD_Y} ${CARD_PAD_X} ${CARD_PAD_Y};
`;

export const StyledNextCardHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 0.5em;
`;

export const StyledNextCardLabel = styled.span`
  font-size: 0.625rem;
  font-weight: 700;
  letter-spacing: 0.22em;
  text-transform: uppercase;
  color: ${({ theme }) => theme.colors.primary};
`;

export const StyledNextCardName = styled.h3`
  font-size: clamp(1.1rem, 4.5vw, 1.375rem);
  font-weight: 900;
  text-transform: uppercase;
  letter-spacing: -0.01em;
  line-height: 1.05;
  color: ${({ theme }) => theme.colors.onSurface};
  margin: 0.5em 0 0.75em 0;
`;

export const StyledNextCardChips = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  margin-bottom: 0.875em;
`;

export const StyledNextCardMuscleChip = styled.span`
  font-size: 0.625rem;
  font-weight: 700;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  padding: 0.25em 0.75em;
  border-radius: 999px;
  color: ${({ theme }) => theme.colors.primary};
  background-color: ${({ theme }) => theme.colors.primary}1F;
  border: 1px solid ${({ theme }) => theme.colors.primary}59;
`;

export const StyledNextCardTypeChip = styled.span`
  font-size: 0.625rem;
  font-weight: 700;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  padding: 0.25em 0.75em;
  border-radius: 999px;
  color: ${({ theme }) => theme.colors.onSurfaceMuted};
  border: 1px solid ${({ theme }) => theme.colors.outlineVariant};
`;

export const StyledNextCardStats = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(min(110px, 100%), 1fr));
  gap: 10px;
  margin-bottom: 1em;
`;

export const StyledNextCardStat = styled.div`
  padding: 0.75em 1em;
  border-radius: 14px;
  background-color: ${({ theme }) => theme.colors.surfaceElevated};
  border: 1px solid ${({ theme }) => theme.colors.outlineVariant};
`;

export const StyledNextCardStatLabel = styled.div`
  font-size: 0.5625rem;
  font-weight: 700;
  letter-spacing: 0.2em;
  text-transform: uppercase;
  color: ${({ theme }) => theme.colors.onSurfaceMuted};
  margin-bottom: 0.4em;
`;

export const StyledNextCardStatValue = styled.div`
  font-size: clamp(1.75rem, 8vw, 2.25rem);
  font-weight: 700;
  line-height: 1;
  color: ${({ theme }) => theme.colors.onSurface};
  display: flex;
  align-items: baseline;
  gap: 0.15em;
  font-variant-numeric: tabular-nums;
`;

export const StyledNextCardStatUnit = styled.span`
  font-size: clamp(0.6875rem, 2.5vw, 0.8125rem);
  font-weight: 700;
  letter-spacing: 0.18em;
  text-transform: uppercase;
  color: ${({ theme }) => theme.colors.onSurfaceMuted};
`;

export const StyledNextCardCta = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  width: calc(100% + 2 * ${CARD_PAD_X});
  margin-left: calc(-1 * ${CARD_PAD_X});
  margin-right: calc(-1 * ${CARD_PAD_X});
  margin-top: 1em;
  margin-bottom: calc(-1 * ${CARD_PAD_Y});
  height: 48px;
  font-size: 0.8125rem;
  font-weight: 900;
  letter-spacing: 0.16em;
  text-transform: uppercase;
  color: ${({ theme }) => theme.colors.onPrimary};
  background-color: ${({ theme }) => theme.colors.primary};
  border: none;
  cursor: pointer;
  border-radius: 0 0 ${CARD_RADIUS} ${CARD_RADIUS};
  transition: filter 0.15s ease;

  &:active {
    filter: brightness(1.1);
  }
`;

/* ── Estado de carregamento do card de proxima serie ──────────────────────
   O descanso abre no instante em que a serie termina, mas o peso sugerido
   pode depender de uma chamada de rede. Enquanto ela nao volta o card
   aparece como esqueleto, no lugar de a tela ficar em branco (ou pior: de
   a proxima serie aparecer antes do cronometro). */
const skeletonPulse = keyframes`
  0%, 100% { opacity: 0.35; }
  50% { opacity: 0.7; }
`;

export const StyledNextCardSkeletonLine = styled.div<{ $w: string; $h?: string }>`
  width: ${({ $w }) => $w};
  height: ${({ $h }) => $h ?? "12px"};
  border-radius: 999px;
  background: ${({ theme }) => theme.colors.outlineVariant};
  animation: ${skeletonPulse} 1.2s ease-in-out infinite;

  @media (prefers-reduced-motion: reduce) {
    animation: none;
  }
`;

export const StyledNextCardSkeletonStack = styled.div`
  display: flex;
  flex-direction: column;
  gap: 10px;
`;
