import styled from "styled-components";

export const StyledWidget = styled.div`
  position: fixed;
  right: ${({ theme }) => theme.spacing.md};
  bottom: var(--fab-bottom);
  z-index: 90;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2px;
  padding: 6px 10px 8px;
  border-radius: 5px;
  background-color: ${({ theme }) => theme.colors.glassOverlay};
  backdrop-filter: blur(16px);
  box-shadow: 0 8px 24px -8px rgba(0, 0, 0, 0.4);
  color: ${({ theme }) => theme.colors.primary};
  cursor: pointer;
  user-select: none;
  transition:
    transform 0.2s ease,
    background-color 0.25s ease;

  &:active {
    transform: scale(0.96);
  }
`;

export const StyledWidgetRing = styled.div`
  position: relative;
  display: grid;
  place-items: center;
  width: 48px;
  height: 48px;
`;

export const StyledWidgetTime = styled.span`
  position: absolute;
  inset: 0;
  display: grid;
  place-items: center;
  font-family: Inter, sans-serif;
  font-size: 0.6875rem;
  font-weight: 700;
  font-variant-numeric: tabular-nums;
  color: ${({ theme }) => theme.colors.onSurface};
`;

export const StyledWidgetLabel = styled.span`
  font-size: 0.5rem;
  font-weight: 700;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  color: ${({ theme }) => theme.colors.onSurfaceMuted};
`;
