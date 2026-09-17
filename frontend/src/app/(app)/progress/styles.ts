import styled, { keyframes } from "styled-components";

const shimmer = keyframes`
  0% { background-position: -400px 0; }
  100% { background-position: 400px 0; }
`;

export const StyledPage = styled.div`
  display: flex;
  flex-direction: column;
  min-height: 100%;
  background: ${({ theme }) => theme.colors.background};
  padding: 24px 0 32px;
`;

export const StyledHeader = styled.header`
  background: ${({ theme }) => theme.colors.background};
  padding: 0 24px 16px;
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.xs};
  margin: 0;
`;

export const StyledHeaderSkeleton = styled.div`
  height: 160px;
  border-radius: ${({ theme }) => theme.borderRadius.inner};
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

export const StyledSubtitle = styled.p`
  font-size: 13px;
  font-weight: 400;
  color: ${({ theme }) => theme.colors.onSurfaceMuted};
`;

export const StyledTitle = styled.h1`
  font-size: 26px;
  font-weight: 700;
  color: ${({ theme }) => theme.colors.onSurface};
  line-height: 1.1;
`;

export const StyledStatRow = styled.div`
  display: flex;
  gap: ${({ theme }) => theme.spacing.sm};
  margin-top: ${({ theme }) => theme.spacing.md};
`;

export const StyledStatPill = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 6px;
  min-height: 100px;
  padding: ${({ theme }) => theme.spacing.md};
  background: ${({ theme }) => theme.colors.surface};
  border-radius: ${({ theme }) => theme.borderRadius.inner};
`;

export const StyledPillValue = styled.span`
  font-size: 28px;
  font-weight: 700;
  color: ${({ theme }) => theme.colors.onSurface};
  font-variant-numeric: tabular-nums;
  letter-spacing: -0.03em;
  line-height: 1.1;
`;

export const StyledPillLabel = styled.span`
  font-size: 11px;
  font-weight: 400;
  color: ${({ theme }) => theme.colors.onSurfaceMuted};
  text-align: center;
  line-height: 1.4;
  margin-top: 2px;
`;

export const StyledBody = styled.main`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.md};
  padding: 0 16px ${({ theme }) => theme.spacing.lg};
  margin: 0;
`;

export const StyledTabBar = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  position: relative;
  margin-top: ${({ theme }) => theme.spacing.md};
  border-bottom: 2px solid ${({ theme }) => theme.colors.outlineVariant};
`;

export const StyledTabButton = styled.button<{ $active: boolean }>`
  background: transparent;
  color: ${({ $active, theme }) =>
    $active ? theme.colors.primary : theme.colors.onSurfaceMuted};
  border: none;
  padding: 12px;
  font-family: var(--font-barlow), sans-serif;
  font-size: 18px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  cursor: pointer;
  transition: color 200ms ease;
  position: relative;
  z-index: 1;

  &:active {
    opacity: 0.7;
  }
`;
export const StyledTabIndicator = styled.div<{
  $index: number;
  $total: number;
}>`
  position: absolute;
  bottom: -2px;
  left: 0;
  height: 2px;
  width: ${({ $total }) => 100 / $total}%;
  background: ${({ theme }) => theme.colors.primary};
  border-radius: 999px;
  transform: translateX(${({ $index }) => $index * 100}%);
  transition: transform 250ms cubic-bezier(0.34, 1.56, 0.64, 1);
  box-shadow: 0 0 8px ${({ theme }) => theme.colors.primary}80;
`;
export const StyledProfileRow = styled.div`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.md};
  margin-bottom: ${({ theme }) => theme.spacing.lg};
`;

export const StyledAvatarWrap = styled.div`
  position: relative;
  width: 72px;
  height: 72px;
  border-radius: 50%;
  background: ${({ theme }) => theme.colors.primary};
  display: grid;
  place-items: center;
  color: ${({ theme }) => theme.colors.onPrimary};
  font-family: "Barlow Condensed", Inter, sans-serif;
  font-size: 1.4rem;
  font-weight: 900;
`;

export const StyledAvatarEdit = styled.button`
  position: absolute;
  right: -6px;
  bottom: -6px;
  width: 28px;
  height: 28px;
  border-radius: 50%;
  border: 1px solid ${({ theme }) => theme.colors.surface};
  background: ${({ theme }) => theme.colors.surface};
  color: ${({ theme }) => theme.colors.onSurface};
  display: grid;
  place-items: center;
  cursor: pointer;
`;

export const StyledProfileInfo = styled.div`
  display: flex;
  flex-direction: column;
  gap: 6px;
`;

export const StyledProfileName = styled.button`
  border: none;
  background: none;
  padding: 0;
  text-align: left;
  font-family: Inter, sans-serif;
  font-size: 1.1rem;
  font-weight: 600;
  color: ${({ theme }) => theme.colors.onSurface};
  cursor: pointer;
`;

export const StyledProfileEmail = styled.span`
  font-family: Inter, sans-serif;
  font-size: ${({ theme }) => theme.typography.bodyMedium.fontSize};
  color: ${({ theme }) => theme.colors.onSurfaceMuted};
`;

export const StyledNameInput = styled.input`
  width: 100%;
  max-width: 240px;
  font-family: Inter, sans-serif;
  font-size: 1.1rem;
  font-weight: 600;
  color: ${({ theme }) => theme.colors.onSurface};
  background: ${({ theme }) => theme.colors.surface};
  border: 1px solid ${({ theme }) => theme.colors.outlineVariant};
  border-radius: ${({ theme }) => theme.borderRadius.inner};
  padding: 10px 12px;
  outline: none;
  color: ${({ theme }) => theme.colors.onSurface};
`;

export const StyledSectionHeading = styled.p`
  font-family: "Barlow Condensed", Inter, sans-serif;
  font-size: 11px;
  font-weight: 600;
  letter-spacing: 0.18em;
  text-transform: uppercase;
  color: ${({ theme }) => theme.colors.onSurfaceMuted};
  margin: 0 0 ${({ theme }) => theme.spacing.sm};
`;

export const StyledColorSwatchRow = styled.div`
  display: flex;
  gap: ${({ theme }) => theme.spacing.sm};
  overflow-x: auto;
  padding-bottom: 8px;
  -webkit-overflow-scrolling: touch;
  scrollbar-width: none;
  &::-webkit-scrollbar {
    display: none;
  }
`;

export const StyledColorSwatch = styled.button<{
  $selected: boolean;
  $color: string;
}>`
  border: none;
  background: none;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  min-width: 64px;
`;

export const StyledSwatchCircle = styled.div<{
  $selected: boolean;
  $color: string;
}>`
  width: 44px;
  height: 44px;
  border-radius: 50%;
  background: ${({ $color }) => $color};
  display: grid;
  place-items: center;
  position: relative;
  box-shadow: ${({ $selected, $color }) =>
    $selected ? `0 0 0 3px ${$color}` : "none"};
`;

export const StyledSwatchCheck = styled.span`
  position: absolute;
  width: 18px;
  height: 18px;
  border-radius: 50%;
  background: ${({ theme }) => theme.colors.onPrimary};
  color: ${({ theme }) => theme.colors.primary};
  display: grid;
  place-items: center;
  font-size: 12px;
  font-weight: 700;
`;

export const StyledSwatchLabel = styled.span`
  font-family: Inter, sans-serif;
  font-size: ${({ theme }) => theme.typography.bodyMedium.fontSize};
  color: ${({ theme }) => theme.colors.onSurfaceMuted};
  text-align: center;
`;

export const StyledAppearanceRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: ${({ theme }) => theme.spacing.sm};
`;

export const StyledSectionLabel = styled.span`
  font-family: Inter, sans-serif;
  font-size: ${({ theme }) => theme.typography.bodyMedium.fontSize};
  font-weight: 600;
  color: ${({ theme }) => theme.colors.onSurface};
`;

export const StyledToggleGroup = styled.div`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  background: ${({ theme }) => theme.colors.surfaceElevated};
  border-radius: 999px;
  padding: 4px;
  gap: 4px;
`;

export const StyledToggleOption = styled.button<{ $active: boolean }>`
  border: none;
  background: ${({ $active, theme }) =>
    $active ? theme.colors.primary : theme.colors.surface};
  color: ${({ $active, theme }) =>
    $active ? theme.colors.onPrimary : theme.colors.onSurfaceMuted};
  border-radius: 999px;
  padding: 10px 12px;
  font-family: Inter, sans-serif;
  font-size: ${({ theme }) => theme.typography.bodyMedium.fontSize};
  font-weight: 600;
  cursor: pointer;
`;

export const StyledPreferenceRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: ${({ theme }) => theme.spacing.sm};
  margin-bottom: ${({ theme }) => theme.spacing.sm};
`;

export const StyledPreferenceInfo = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
`;

export const StyledPreferenceLabel = styled.span`
  font-family: Inter, sans-serif;
  font-size: ${({ theme }) => theme.typography.bodyMedium.fontSize};
  font-weight: 600;
  color: ${({ theme }) => theme.colors.onSurface};
`;

export const StyledPreferenceControl = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
`;

export const StyledControlButton = styled.button`
  width: 40px;
  height: 40px;
  border-radius: 50%;
  border: 1px solid ${({ theme }) => theme.colors.outlineVariant};
  background: ${({ theme }) => theme.colors.surface};
  color: ${({ theme }) => theme.colors.onSurface};
  font-size: 1.1rem;
  display: grid;
  place-items: center;
  cursor: pointer;
`;

export const StyledControlValue = styled.span`
  min-width: 40px;
  text-align: center;
  font-family: Inter, sans-serif;
  font-size: 1rem;
  color: ${({ theme }) => theme.colors.onSurface};
`;

export const StyledLanguageRow = styled.button`
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: ${({ theme }) => theme.spacing.sm};
  background: ${({ theme }) => theme.colors.surface};
  border: 1px solid ${({ theme }) => theme.colors.outlineVariant};
  border-radius: ${({ theme }) => theme.borderRadius.inner};
  padding: 14px 16px;
  cursor: pointer;
  color: ${({ theme }) => theme.colors.onSurface};
  font-family: Inter, sans-serif;
  font-size: ${({ theme }) => theme.typography.bodyMedium.fontSize};
`;

export const StyledLanguageValue = styled.span`
  font-family: Inter, sans-serif;
  font-size: ${({ theme }) => theme.typography.bodyMedium.fontSize};
  color: ${({ theme }) => theme.colors.onSurfaceMuted};
`;

export const StyledSignOutButton = styled.button`
  width: 100%;
  background: transparent;
  border: 1px solid ${({ theme }) => theme.colors.destructive};
  color: ${({ theme }) => theme.colors.destructive};
  border-radius: ${({ theme }) => theme.borderRadius.pill};
  padding: 16px;
  font-family: Inter, sans-serif;
  font-size: ${({ theme }) => theme.typography.bodyMedium.fontSize};
  font-weight: 700;
  cursor: pointer;
`;

export const StyledCard = styled.section`
  background: ${({ theme }) => theme.colors.surfaceElevated};
  border-radius: ${({ theme }) => theme.borderRadius.card};
  padding: ${({ theme }) => theme.spacing.lg};
  box-shadow: ${({ theme }) => theme.shadows.card};
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.sm};
`;

export const StyledSkeletonCard = styled.section`
  background: ${({ theme }) => theme.colors.surfaceElevated};
  border-radius: ${({ theme }) => theme.borderRadius.card};
  padding: ${({ theme }) => theme.spacing.lg};
  box-shadow: ${({ theme }) => theme.shadows.card};
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.sm};
  min-height: 180px;
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

export const StyledSectionCard = styled.section`
  background: ${({ theme }) => theme.colors.surfaceElevated};
  border-radius: ${({ theme }) => theme.borderRadius.card};
  padding: ${({ theme }) => theme.spacing.lg};
  box-shadow: ${({ theme }) => theme.shadows.card};
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.sm};
`;

export const StyledSectionHeader = styled.div`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.xs};
  margin-bottom: 4px;
`;

export const StyledSectionIcon = styled.span`
  display: flex;
  align-items: center;
  color: ${({ theme }) => theme.colors.primary};
`;

export const StyledSectionTitle = styled.h2`
  font-size: ${({ theme }) => theme.typography.headlineMedium.fontSize};
  font-weight: ${({ theme }) => theme.typography.headlineMedium.fontWeight};
  color: ${({ theme }) => theme.colors.onSurface};
`;

export const StyledChipScroll = styled.div`
  display: flex;
  gap: ${({ theme }) => theme.spacing.xs};
  overflow-x: auto;
  padding-bottom: 4px;
  -webkit-overflow-scrolling: touch;
  scrollbar-width: none;
  &::-webkit-scrollbar {
    display: none;
  }
`;

export const StyledExerciseChip = styled.button<{ $selected: boolean }>`
  flex-shrink: 0;
  padding: 6px 14px;
  border-radius: ${({ theme }) => theme.borderRadius.pill};
  border: 1.5px solid
    ${({ $selected, theme }) =>
      $selected ? theme.colors.primary : theme.colors.outlineVariant};
  background: ${({ $selected, theme }) =>
    $selected ? theme.colors.primary : theme.colors.surface};
  color: ${({ $selected, theme }) =>
    $selected ? theme.colors.onPrimary : theme.colors.onSurface};
  font-size: ${({ theme }) => theme.typography.labelLarge.fontSize};
  font-weight: 500;
  font-family: inherit;
  cursor: pointer;
  transition:
    background 200ms ease,
    border-color 200ms ease,
    color 200ms ease;
  white-space: nowrap;
  &:active {
    opacity: 0.8;
  }
`;

export const StyledPrBanner = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: ${({ theme }) => theme.spacing.sm};
  background: ${({ theme }) => theme.colors.surfaceElevated};
  border: 1px solid ${({ theme }) => theme.colors.outlineVariant};
  border-radius: ${({ theme }) => theme.borderRadius.inner};
  padding: 14px 16px;
`;

export const StyledPrText = styled.span`
  font-size: ${({ theme }) => theme.typography.labelLarge.fontSize};
  font-weight: 600;
  color: ${({ theme }) => theme.colors.primary};
  flex: 1;
  display: flex;
  align-items: center;
  gap: 6px;
`;

export const StyledImprovementBadge = styled.span`
  font-size: ${({ theme }) => theme.typography.labelLarge.fontSize};
  font-weight: 700;
  color: ${({ theme }) => theme.colors.success};
  background: ${({ theme }) => theme.colors.successContainer};
  border-radius: ${({ theme }) => theme.borderRadius.pill};
  padding: 3px 10px;
  white-space: nowrap;
`;

export const StyledHint = styled.p`
  font-size: ${({ theme }) => theme.typography.bodyMedium.fontSize};
  color: ${({ theme }) => theme.colors.onSurfaceMuted};
  text-align: center;
  padding: ${({ theme }) => theme.spacing.lg} 0
    ${({ theme }) => theme.spacing.sm};
`;

export const StyledMuscleList = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.sm};
`;

export const StyledMuscleRow = styled.div`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.sm};
`;

export const StyledMuscleName = styled.span`
  font-size: ${({ theme }) => theme.typography.bodyMedium.fontSize};
  font-weight: 500;
  color: ${({ theme }) => theme.colors.onSurface};
  width: 80px;
  flex-shrink: 0;
`;

export const StyledMuscleBarWrap = styled.div`
  flex: 1;
  height: 8px;
  border-radius: 4px;
  background: ${({ theme }) => theme.colors.outlineVariant};
  overflow: hidden;
`;

export const StyledMuscleBar = styled.div<{ $pct: number; $bg: string }>`
  height: 100%;
  width: ${({ $pct }) => $pct}%;
  background: ${({ $bg }) => $bg};
  border-radius: 4px;
  transition: width 600ms ease;
`;

export const StyledMuscleCount = styled.span`
  font-size: ${({ theme }) => theme.typography.labelLarge.fontSize};
  color: ${({ theme }) => theme.colors.onSurfaceMuted};
  width: 64px;
  text-align: right;
  flex-shrink: 0;
`;
export const StyledHistoryRow = styled.button`
  display: flex;
  align-items: center;
  gap: 12px;
  width: 100%;
  padding: ${({ theme }) => theme.spacing.md} 0;
  background: none;
  border: none;
  border-top: 1px solid ${({ theme }) => theme.colors.outlineVariant};
  cursor: pointer;
  text-align: left;
  margin-top: ${({ theme }) => theme.spacing.sm};
  transition: opacity 150ms ease;

  &:hover {
    opacity: 0.8;
  }
`;

export const StyledHistoryIcon = styled.div`
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background: ${({ theme }) => theme.colors.primaryContainer};
  color: ${({ theme }) => theme.colors.primary};
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
`;

export const StyledHistoryInfo = styled.div`
  flex: 1;
`;

export const StyledHistoryLabel = styled.span`
  font-family: var(--font-inter), sans-serif;
  font-weight: 600;
  font-size: 14px;
  color: ${({ theme }) => theme.colors.onSurface};
  display: block;
`;

export const StyledHistorySub = styled.span`
  font-family: var(--font-inter), sans-serif;
  font-size: 12px;
  color: ${({ theme }) => theme.colors.onSurfaceMuted};
`;

export const StyledHistoryChevron = styled.span`
  color: ${({ theme }) => theme.colors.onSurfaceMuted};
  font-size: 18px;
`;
