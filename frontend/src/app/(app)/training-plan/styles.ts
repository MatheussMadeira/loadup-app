import styled, { keyframes } from "styled-components";

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

export const StyledSection = styled.section`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.sm};
`;

export const StyledSectionTitle = styled.h2`
  font-size: 13px;
  font-weight: 600;
  color: ${({ theme }) => theme.colors.onSurfaceMuted};
`;

export const StyledMuscleRow = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: ${({ theme }) => theme.spacing.xs};
`;

export const StyledSkeletonCard = styled.div`
  height: 80px;
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
    background: ${({ theme }) => theme.colors.outlineVariant};
  }
`;

export const StyledErrorText = styled.p`
  font-size: 13px;
  color: ${({ theme }) => theme.colors.error};
  text-align: center;
`;

export const StyledEditBar = styled.div<{ $visible: boolean }>`
  position: fixed;
  bottom: var(--bottom-nav-height);
  left: 0;
  right: 0;
  z-index: 90;
  display: flex;
  align-items: flex-end;
  gap: 12px;
  padding: 28px 16px 16px;
  background: linear-gradient(
    to bottom,
    transparent,
    ${({ theme }) => theme.colors.background} 45%
  );
  pointer-events: ${({ $visible }) => ($visible ? "auto" : "none")};
  opacity: ${({ $visible }) => ($visible ? 1 : 0)};
  transform: translateY(${({ $visible }) => ($visible ? "0" : "60px")});
  transition:
    opacity 220ms ease,
    transform 220ms ease;
`;

export const StyledEditHint = styled.p`
  flex: 1;
  font-size: 12px;
  color: ${({ theme }) => theme.colors.onSurfaceMuted};
  line-height: 1.5;
`;

export const StyledConcluirBtn = styled.button`
  height: 46px;
  padding: 0 20px;
  border-radius: ${({ theme }) => theme.borderRadius.pill};
  background: ${({ theme }) => theme.colors.primary};
  color: ${({ theme }) => theme.colors.onPrimary};
  border: none;
  cursor: pointer;
  font-family: var(--font-barlow), sans-serif;
  font-size: 14px;
  font-weight: 900;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  display: flex;
  align-items: center;
  gap: 6px;
  white-space: nowrap;
  flex-shrink: 0;
  box-shadow: ${({ theme }) => theme.shadows.primary};
`;
