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
        <StyledCloseButton
          ref={closeButtonRef}
          onClick={onClose}
          aria-label="Fechar"
        >
          ×
        </StyledCloseButton>
        {title && <StyledTitle>{title}</StyledTitle>}
        {children}
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

const StyledCard = styled.div`
  position: relative;
  background: ${({ theme }) => theme.colors.surfaceElevated};
  border: 1px solid ${({ theme }) => theme.colors.outlineVariant};
  border-radius: ${({ theme }) => theme.borderRadius.inner};
  padding: ${({ theme }) => theme.spacing.lg};
  width: min(100%, 520px);
  max-height: 90dvh;
  overflow-y: auto;
  animation: ${modalEnter} ${MODAL_TRANSITION.duration}
    ${MODAL_TRANSITION.easing} both;
  box-shadow: ${({ theme }) => theme.shadows.card};
`;

const StyledCloseButton = styled.button`
  position: absolute;
  top: ${({ theme }) => theme.spacing.sm};
  right: ${({ theme }) => theme.spacing.sm};
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
  margin-bottom: ${({ theme }) => theme.spacing.md};
  padding-right: ${({ theme }) => theme.spacing.lg};
`;
