import styled, { keyframes } from "styled-components";

import { CalendarSessionStatus } from "@/types";

const shimmer = keyframes`
  0% { background-position: -400px 0; }
  100% { background-position: 400px 0; }
`;

export const StyledPage = styled.div`
  display: flex;
  flex-direction: column;
  min-height: 100%;
  background-color: ${({ theme }) => theme.colors.background};
`;

export const StyledBody = styled.main`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.md};
  padding: ${({ theme }) => theme.spacing.md};
  padding-bottom: ${({ theme }) => theme.spacing.lg};
`;

export const StyledHeaderSkeleton = styled.div`
  height: 160px;
  border-bottom: 1px solid ${({ theme }) => theme.colors.outlineVariant};
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

export const StyledSkeletonCard = styled.div`
  height: 160px;
  border-radius: ${({ theme }) => theme.borderRadius.card};
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
    background: ${({ theme }) => theme.colors.outlineVariant};
  }
`;

export const StyledCard = styled.section`
  background: ${({ theme }) => theme.colors.surfaceElevated};
  border: 1px solid ${({ theme }) => theme.colors.outlineVariant};
  border-radius: ${({ theme }) => theme.borderRadius.card};
  padding: ${({ theme }) => theme.spacing.lg};
  box-shadow: ${({ theme }) => theme.shadows.card};
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.sm};
`;

export const StyledCardHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
`;

export const StyledCardTitle = styled.h2`
  font-family: var(--font-barlow), sans-serif;
  font-size: ${({ theme }) => theme.typography.headlineMedium.fontSize};
  font-weight: 900;
  text-transform: uppercase;
  letter-spacing: -0.01em;
  color: ${({ theme }) => theme.colors.onSurface};
`;

export const StyledBadge = styled.span<{ $status: string }>`
  font-family: var(--font-barlow), sans-serif;
  font-size: ${({ theme }) => theme.typography.labelLarge.fontSize};
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: ${({ theme }) => theme.colors.primary};
  background-color: ${({ theme }) => theme.colors.primaryContainer};
  border-radius: ${({ theme }) => theme.borderRadius.chip};
  padding: 4px 10px;
`;

export const StyledCalendarHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 4px;
`;

export const StyledMonthLabel = styled.span`
  font-family: var(--font-inter), sans-serif;
  font-size: ${({ theme }) => theme.typography.titleMedium.fontSize};
  font-weight: 600;
  color: ${({ theme }) => theme.colors.onSurface};
`;

export const StyledPlanLink = styled.button`
  background: none;
  border: none;
  cursor: pointer;
  font-size: ${({ theme }) => theme.typography.labelLarge.fontSize};
  font-weight: 600;
  color: ${({ theme }) => theme.colors.primary};
  padding: 0;
  font-family: inherit;
`;

export const StyledRestIndicator = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.sm};
  padding: ${({ theme }) => theme.spacing.lg} 0;
  color: ${({ theme }) => theme.colors.onSurfaceMuted};
`;

export const StyledRestText = styled.p`
  font-family: var(--font-inter), sans-serif;
  font-size: ${({ theme }) => theme.typography.bodyMedium.fontSize};
  color: ${({ theme }) => theme.colors.onSurfaceMuted};
  text-align: center;
`;

export const StyledRecentHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
`;

export const StyledSectionTitle = styled.h3`
  font-family: var(--font-barlow), sans-serif;
  font-size: ${({ theme }) => theme.typography.titleMedium.fontSize};
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: ${({ theme }) => theme.colors.onSurface};
`;

export const StyledViewAllBtn = styled.button`
  background: none;
  border: none;
  cursor: pointer;
  font-size: ${({ theme }) => theme.typography.labelLarge.fontSize};
  font-weight: 600;
  color: ${({ theme }) => theme.colors.primary};
  padding: 0;
  font-family: inherit;
`;

export const StyledSessionList = styled.ul`
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.sm};
`;

export const StyledSessionItem = styled.li`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.sm};
  cursor: pointer;
  border-radius: ${({ theme }) => theme.borderRadius.chip};
  padding: 4px;
  margin: -4px;
  &:active {
    background: ${({ theme }) => theme.colors.background};
  }
`;

export const StyledSessionIcon = styled.div<{ $status: CalendarSessionStatus }>`
  width: 36px;
  height: 36px;
  border-radius: 50%;
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: ${({ $status, theme }) => {
    if ($status === "recorded") return theme.colors.successContainer;
    if ($status === "skipped") return theme.colors.errorContainer;
    return theme.colors.primaryContainer;
  }};
  color: ${({ $status, theme }) => {
    if ($status === "recorded") return theme.colors.success;
    if ($status === "skipped") return theme.colors.error;
    return theme.colors.primary;
  }};
`;

export const StyledSessionContent = styled.div`
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 2px;
`;

export const StyledSessionNameRow = styled.div`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.xs};
`;

export const StyledSessionName = styled.span`
  font-family: var(--font-inter), sans-serif;
  font-size: ${({ theme }) => theme.typography.titleMedium.fontSize};
  font-weight: 600;
  color: ${({ theme }) => theme.colors.onSurface};
`;

export const StyledSessionBadge = styled.span<{
  $status: CalendarSessionStatus;
}>`
  font-size: 10px;
  font-weight: 700;
  padding: 2px 8px;
  border-radius: ${({ theme }) => theme.borderRadius.chip};
  background-color: ${({ $status, theme }) => {
    if ($status === "recorded") return theme.colors.successContainer;
    if ($status === "skipped") return theme.colors.errorContainer;
    return theme.colors.primaryContainer;
  }};
  color: ${({ $status, theme }) => {
    if ($status === "recorded") return theme.colors.success;
    if ($status === "skipped") return theme.colors.error;
    return theme.colors.primary;
  }};
`;

export const StyledSessionMeta = styled.span`
  font-family: var(--font-inter), sans-serif;
  font-size: 12px;
  color: ${({ theme }) => theme.colors.onSurfaceMuted};
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

export const StyledSessionDate = styled.span`
  font-family: var(--font-inter), sans-serif;
  font-size: 12px;
  color: ${({ theme }) => theme.colors.onSurfaceMuted};
  flex-shrink: 0;
  white-space: nowrap;
`;
