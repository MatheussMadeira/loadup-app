"use client";

import { useEffect, useRef } from "react";
import styled from "styled-components";

import { modalEnter, modalOverlay, MODAL_TRANSITION } from "@/lib/animations";
import { useScrollLock } from "@/hooks/useScrollLock";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
  title?: string;
}

export default function Modal({
  isOpen,
  onClose,
  children,
  title,
}: ModalProps) {
  const closeButtonRef = useRef<HTMLButtonElement>(null);

  useScrollLock(isOpen);

  useEffect(() => {
    if (isOpen) closeButtonRef.current?.focus();
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <StyledOverlay onClick={onClose} role="dialog" aria-modal="true">
      <StyledCard onClick={(e) => e.stopPropagation()}>
        <StyledHeader>
          <StyledTitleSlot>
            {title && <StyledTitle>{title}</StyledTitle>}
          </StyledTitleSlot>
          <StyledCloseButton
            ref={closeButtonRef}
            onClick={onClose}
            aria-label="Fechar"
          >
            ×
          </StyledCloseButton>
        </StyledHeader>
        <StyledBody>{children}</StyledBody>
      </StyledCard>
    </StyledOverlay>
  );
}

const StyledOverlay = styled.div`
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.45);
  z-index: 200;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: ${({ theme }) => theme.spacing.md};
  animation: ${modalOverlay} ${MODAL_TRANSITION.overlayDuration}
    ${MODAL_TRANSITION.overlayEasing} both;
`;

// Tamanho do cartão travado (largura + teto de altura); quem rola é só o
// StyledBody. Cabeçalho (título + fechar) fica fora do fluxo de scroll, numa
// linha flex — nada de posicionamento absoluto, então não tem como o botão
// de fechar ficar por cima do título ou do conteúdo em nenhum tamanho de tela.
const StyledCard = styled.div`
  display: flex;
  flex-direction: column;
  background: ${({ theme }) => theme.colors.surfaceElevated};
  border: 1px solid ${({ theme }) => theme.colors.outlineVariant};
  border-radius: ${({ theme }) => theme.borderRadius.inner};
  width: min(100%, 520px);
  max-height: 90dvh;
  overflow: hidden;
  animation: ${modalEnter} ${MODAL_TRANSITION.duration}
    ${MODAL_TRANSITION.easing} both;
  box-shadow: ${({ theme }) => theme.shadows.card};
`;

const StyledHeader = styled.div`
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: ${({ theme }) => theme.spacing.sm};
  flex-shrink: 0;
  padding: ${({ theme }) => theme.spacing.lg} ${({ theme }) => theme.spacing.lg}
    0;
`;

const StyledTitleSlot = styled.div`
  flex: 1;
  min-width: 0;
`;

const StyledBody = styled.div`
  flex: 1;
  min-height: 0;
  overflow-y: auto;
  padding: ${({ theme }) => theme.spacing.md} ${({ theme }) => theme.spacing.lg}
    ${({ theme }) => theme.spacing.lg};
`;

const StyledCloseButton = styled.button`
  flex-shrink: 0;
  width: 36px;
  height: 36px;
  border: none;
  background: ${({ theme }) => theme.colors.surface};
  font-size: 22px;
  line-height: 1;
  color: ${({ theme }) => theme.colors.onSurface};
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: ${({ theme }) => theme.borderRadius.pill};
  transition: background 0.2s ease;

  &:hover {
    background: ${({ theme }) => theme.colors.surfaceElevated};
  }
`;

const StyledTitle = styled.h2`
  font-family: "Barlow Condensed", Inter, sans-serif;
  font-size: ${({ theme }) => theme.typography.titleLarge.fontSize};
  font-weight: 700;
  color: ${({ theme }) => theme.colors.onSurface};
  margin: 0;
  padding-top: 6px;
`;
