import styled from "styled-components";

const hexToRgba = (hex: string, alpha: number) => {
  const normalized = hex.replace("#", "");
  const r = parseInt(normalized.slice(0, 2), 16);
  const g = parseInt(normalized.slice(2, 4), 16);
  const b = parseInt(normalized.slice(4, 6), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
};

export const StyledWorkoutIntro = styled.div`
  min-height: 100%;
  background: ${({ theme }) => theme.colors.background};
  position: relative;
  overflow: hidden;
  padding: 24px 16px 200px;
  color: ${({ theme }) => theme.colors.onSurface};

  &::before {
    content: "";
    position: absolute;
    top: -20%;
    left: 50%;
    transform: translateX(-50%);
    width: 360px;
    height: 360px;
    background: radial-gradient(
      circle at top,
      ${({ theme }) => hexToRgba(theme.colors.primary, 0.12)} 0%,
      transparent 60%
    );
    pointer-events: none;
  }
`;
export const StyledScrollContent = styled.div`
  flex: 1;
  overflow-y: auto;
  padding: 24px 16px 16px;
  position: relative;
  z-index: 1;
`;
export const StyledTopBar = styled.div`
  position: relative;
  display: flex;
  align-items: center;
  justify-content: flex-start;
  gap: 12px;
  margin-bottom: 32px;
  z-index: 1;
`;

export const StyledBackButton = styled.button`
  width: 44px;
  height: 44px;
  border-radius: 50%;
  border: 1px solid ${({ theme }) => theme.colors.outlineVariant};
  background: ${({ theme }) => theme.colors.surfaceElevated};
  color: ${({ theme }) => theme.colors.onSurface};
  display: grid;
  place-items: center;
  cursor: pointer;
  font-family: inherit;
  transition: transform 180ms ease, background 180ms ease;

  &:hover {
    transform: translateY(-1px);
  }
`;

export const StyledHero = styled.section`
  position: relative;
  z-index: 1;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 18px;
  margin-bottom: 32px;
`;

export const StyledDayName = styled.h1`
  font-family: "Barlow Condensed", Inter, sans-serif;
  font-size: 4rem;
  line-height: 0.9;
  font-weight: 900;
  text-transform: uppercase;
  margin: 0;
  color: ${({ theme }) => theme.colors.onSurface};
`;

export const StyledHeroChips = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
`;

export const StyledStatRow = styled.div`
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 12px;
  margin-bottom: 32px;
`;
export const StyledStatIcon = styled.div`
  color: ${({ theme }) => theme.colors.primary};
  display: flex;
  align-items: center;
  justify-content: center;
`;
export const StyledStatCard = styled.div`
  background: ${({ theme }) => theme.colors.surfaceElevated};
  border-radius: 20px;
  padding: 14px 16px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  min-height: 96px;
  justify-content: center;
`;

export const StyledStatLabel = styled.span`
  font-size: ${({ theme }) => theme.typography.labelSmall.fontSize};
  font-weight: 700;
  color: ${({ theme }) => theme.colors.onSurfaceMuted};
  text-transform: uppercase;
  letter-spacing: 0.08em;
  font-family: "Barlow Condensed", Inter, sans-serif;
`;

export const StyledStatValue = styled.span`
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 1rem;
  font-weight: 600;
  color: ${({ theme }) => theme.colors.onSurface};
  font-family: Inter, sans-serif;
`;

export const StyledExerciseSection = styled.section`
  position: relative;
  z-index: 1;
  display: flex;
  flex-direction: column;
  gap: 12px;
`;

export const StyledSectionLabel = styled.p`
  font-family: "Barlow Condensed", Inter, sans-serif;
  font-size: 11px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.18em;
  color: ${({ theme }) => theme.colors.onSurfaceMuted};
  margin: 0;
`;

export const StyledExerciseList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

export const StyledExerciseRow = styled.div`
  display: grid;
  grid-template-columns: min-content 1fr min-content;
  align-items: center;
  gap: 16px;
  padding: 14px 0;
  border-bottom: 1px solid ${({ theme }) => theme.colors.outlineVariant};
`;

export const StyledExerciseNumber = styled.span`
  font-family: "Bebas Neue", Inter, sans-serif;
  font-size: 1.5rem;
  font-weight: 700;
  color: ${({ theme }) => theme.colors.primary};
  min-width: 40px;
`;

export const StyledExerciseName = styled.span`
  font-family: Inter, sans-serif;
  font-size: 1rem;
  font-weight: 600;
  color: ${({ theme }) => theme.colors.onSurface};
`;

export const StyledExerciseSeries = styled.span`
  font-family: Inter, sans-serif;
  font-size: ${({ theme }) => theme.typography.bodyMedium.fontSize};
  color: ${({ theme }) => theme.colors.onSurfaceMuted};
  text-align: right;
`;

export const StyledBottomBar = styled.div`
  position: fixed;
  bottom: var(--bottom-nav-height);
  left: 50%;
  transform: translateX(-50%);
  width: 100%;
  padding: 16px 24px 20px;
  background: linear-gradient(
    to bottom,
    transparent 0%,
    ${({ theme }) => theme.colors.background} 40%
  );
  display: flex;
  flex-direction: column;
  gap: 4px;
  z-index: 10;
`;

export const StyledBackLink = styled.button`
  background: none;
  border: none;
  color: ${({ theme }) => theme.colors.onSurfaceMuted};
  font-family: Inter, sans-serif;
  font-size: ${({ theme }) => theme.typography.bodyMedium.fontSize};
  cursor: pointer;
  text-align: center;
  padding: 0;
`;

export const StyledStartBtn = styled.button`
  width: 100%;
  height: 56px;
  background: ${({ theme }) => theme.colors.primary};
  color: ${({ theme }) => theme.colors.onPrimary};
  border: none;
  border-radius: 999px;
  font-family: "Barlow Condensed", Inter, sans-serif;
  font-size: 1rem;
  font-weight: 900;
  letter-spacing: 0.18em;
  text-transform: uppercase;
  cursor: pointer;
  transition: transform 180ms ease, opacity 180ms ease;

  &:hover {
    transform: translateY(-1px);
  }
`;
