import styled from "styled-components";

export const StyledOverlay = styled.div`
  position: fixed;
  inset: 0;
  background-color: rgba(0, 0, 0, 0.6);
  backdrop-filter: blur(4px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 100;
  padding: ${({ theme }) => theme.spacing.md};
`;

export const StyledModal = styled.div`
  background-color: ${({ theme }) => theme.colors.surface};
  border-radius: ${({ theme }) => theme.borderRadius.inner};
  padding: ${({ theme }) => theme.spacing.xl};
  width: 100%;
  max-width: 500px;
  max-height: min(85vh, calc(100vh - 32px));
  display: flex;
  flex-direction: column;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.3);
  overflow: hidden;

  @media (max-width: 768px) {
    padding: ${({ theme }) => theme.spacing.lg};
    max-height: min(85vh, calc(100vh - 16px));
  }

  @media (max-width: 480px) {
    padding: ${({ theme }) => theme.spacing.md};
    max-height: min(90vh, calc(100vh - 12px));
  }
`;

export const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: ${({ theme }) => theme.spacing.md};
`;

export const Title = styled.h2`
  margin: 0;
  font-size: ${({ theme }) => theme.typography.headlineMedium.fontSize};
  font-weight: ${({ theme }) => theme.typography.headlineMedium.fontWeight};
  color: ${({ theme }) => theme.colors.onSurface};
`;

export const CloseButton = styled.button`
  background: none;
  border: none;
  font-size: 24px;
  color: ${({ theme }) => theme.colors.onSurfaceMuted};
  cursor: pointer;
  padding: ${({ theme }) => theme.spacing.sm};
  display: flex;
  align-items: center;
  justify-content: center;
  transition: color 200ms ease-out;

  &:hover {
    color: ${({ theme }) => theme.colors.onSurface};
  }

  &:focus-visible {
    outline: 2px solid ${({ theme }) => theme.colors.primary};
    outline-offset: 2px;
    border-radius: 4px;
  }
`;

export const DismissAllLink = styled.button`
  align-self: flex-end;
  background: none;
  border: none;
  padding: 0;
  margin-bottom: ${({ theme }) => theme.spacing.md};
  font-size: ${({ theme }) => theme.typography.bodyMedium.fontSize};
  color: ${({ theme }) => theme.colors.primary};
  cursor: pointer;
  text-decoration: underline;
  transition: color 200ms ease-out;

  &:hover {
    color: ${({ theme }) => theme.colors.primaryStrong};
  }

  &:disabled {
    opacity: 0.5;
    cursor: default;
  }

  &:focus-visible {
    outline: 2px solid ${({ theme }) => theme.colors.primary};
    outline-offset: 2px;
    border-radius: 2px;
  }
`;

export const NotifList = styled.div`
  flex: 1;
  overflow-y: auto;
  display: flex;
  flex-direction: column;

  &::-webkit-scrollbar {
    width: 6px;
  }
  &::-webkit-scrollbar-thumb {
    background: ${({ theme }) => theme.colors.outlineVariant};
    border-radius: 3px;
  }
`;

export const NotifCard = styled.div<{ $unread: boolean }>`
  position: relative;
  display: flex;
  gap: 12px;
  padding: 12px;
  border-radius: 12px;
  cursor: ${({ $unread }) => ($unread ? "pointer" : "default")};
  background: ${({ theme, $unread }) =>
    $unread ? theme.colors.surfaceElevated : "transparent"};
  border-left: ${({ theme, $unread }) =>
    $unread ? `3px solid ${theme.colors.primary}` : "3px solid transparent"};
  transition: background 150ms ease;
`;

export const NotifAvatar = styled.div`
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: ${({ theme }) => theme.colors.primary};
  color: ${({ theme }) => theme.colors.onPrimary};
  display: flex;
  align-items: center;
  justify-content: center;
  font-family: var(--font-barlow), sans-serif;
  font-weight: 900;
  font-size: 14px;
  flex-shrink: 0;
`;

export const NotifContent = styled.div`
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 3px;
`;

export const NotifText = styled.p`
  font-family: var(--font-inter), sans-serif;
  font-size: 13px;
  color: ${({ theme }) => theme.colors.onSurface};
  margin: 0;
  line-height: 1.4;
`;

export const NotifName = styled.span`
  font-weight: 600;
`;

export const NotifTime = styled.span`
  font-family: var(--font-inter), sans-serif;
  font-size: 11px;
  color: ${({ theme }) => theme.colors.onSurfaceMuted};
`;

export const NotifActions = styled.div`
  display: flex;
  gap: 6px;
  margin-top: 6px;
`;

export const AcceptBtn = styled.button`
  height: 26px;
  padding: 0 10px;
  border-radius: ${({ theme }) => theme.borderRadius.pill};
  border: none;
  background: ${({ theme }) => theme.colors.primary};
  color: ${({ theme }) => theme.colors.onPrimary};
  font-family: var(--font-barlow), sans-serif;
  font-weight: 600;
  font-size: 10px;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  cursor: pointer;

  &:disabled {
    opacity: 0.5;
  }
`;

export const RejectBtn = styled.button`
  height: 26px;
  padding: 0 10px;
  border-radius: ${({ theme }) => theme.borderRadius.pill};
  border: 1px solid ${({ theme }) => theme.colors.outlineVariant};
  background: transparent;
  color: ${({ theme }) => theme.colors.onSurfaceMuted};
  font-family: var(--font-barlow), sans-serif;
  font-weight: 600;
  font-size: 10px;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  cursor: pointer;

  &:disabled {
    opacity: 0.5;
  }
`;

export const ViewBtn = styled.button`
  height: 26px;
  padding: 0 10px;
  border-radius: ${({ theme }) => theme.borderRadius.pill};
  border: 1px solid ${({ theme }) => theme.colors.primary};
  background: transparent;
  color: ${({ theme }) => theme.colors.primary};
  font-family: var(--font-barlow), sans-serif;
  font-weight: 600;
  font-size: 10px;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  cursor: pointer;
`;

export const UnreadDot = styled.span`
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: ${({ theme }) => theme.colors.primary};
  position: absolute;
  top: 12px;
  right: 12px;
  flex-shrink: 0;
`;

export const NotifDivider = styled.div`
  height: 1px;
  background: ${({ theme }) => theme.colors.outlineVariant};
  opacity: 0.3;
  margin: 2px 0;
`;

export const EmptyNotif = styled.p`
  font-family: var(--font-inter), sans-serif;
  font-size: 13px;
  color: ${({ theme }) => theme.colors.onSurfaceMuted};
  text-align: center;
  padding: 32px 0;
  margin: 0;
`;
