"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import styled, { keyframes } from "styled-components";
import { X } from "lucide-react";

import { PlateauAlert } from "@/types";
import { useScrollLock } from "@/hooks/useScrollLock";
import { markPresented } from "@/services/plateauService";

interface PlateauAlertSheetProps {
  alert: PlateauAlert;
  currentWeight: number;
  onConfirm: (newWeight: number) => void;
  onDismiss: () => void;
}

export default function PlateauAlertSheet({
  alert,
  currentWeight,
  onConfirm,
  onDismiss,
}: PlateauAlertSheetProps) {
  const [mounted, setMounted] = useState(false);
  const [weight, setWeight] = useState(String(currentWeight + 2.5));
  const [startY, setStartY] = useState(0);
  const [dragY, setDragY] = useState(0);
  const sheetRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMounted(true);
    markPresented(alert._id).catch(() => {});
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [alert._id]);

  useScrollLock();

  const handleTouchStart = (e: React.TouchEvent) => {
    setStartY(e.touches[0].clientY);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    const delta = e.touches[0].clientY - startY;
    if (delta > 0) setDragY(delta);
  };

  const handleTouchEnd = () => {
    if (dragY > 80) onDismiss();
    setDragY(0);
  };

  const parsedWeight = parseFloat(weight);
  const safeWeight = isNaN(parsedWeight) || parsedWeight <= 0 ? currentWeight : parsedWeight;

  if (!mounted) return null;

  return createPortal(
    <>
      <Backdrop onClick={onDismiss} />
      <Sheet
        ref={sheetRef}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        style={{
          transform: `translateY(${dragY}px)`,
          transition:
            dragY > 0
              ? "none"
              : "transform 300ms cubic-bezier(0.16, 1, 0.3, 1)",
        }}
      >
        <Handle />

        <SheetHeader>
          <SheetTitle>Você estagnou nesse exercício</SheetTitle>
          <CloseBtn onClick={onDismiss} aria-label="Fechar">
            <X size={16} />
          </CloseBtn>
        </SheetHeader>

        <SheetBody>
          <Message>
            {alert.suggestion ??
              `${alert.exerciseName} está sem evolução de carga há ${alert.sessionCount} treinos.`}
          </Message>

          <FieldGroup>
            <FieldLabel>Novo peso sugerido (kg)</FieldLabel>
            <WeightRow>
              <StepBtn
                type="button"
                onClick={() =>
                  setWeight((v) =>
                    String(Math.max(0.5, (parseFloat(v) || 0) - 2.5))
                  )
                }
              >
                −
              </StepBtn>
              <WeightInput
                type="number"
                min={0.5}
                step={0.5}
                value={weight}
                onChange={(e) => setWeight(e.target.value)}
              />
              <StepBtn
                type="button"
                onClick={() =>
                  setWeight((v) => String((parseFloat(v) || 0) + 2.5))
                }
              >
                +
              </StepBtn>
            </WeightRow>
          </FieldGroup>

          <ActionsRow>
            <DismissBtn type="button" onClick={onDismiss}>
              Agora não
            </DismissBtn>
            <ConfirmBtn type="button" onClick={() => onConfirm(safeWeight)}>
              Salvar novo peso
            </ConfirmBtn>
          </ActionsRow>
        </SheetBody>
      </Sheet>
    </>,
    document.body,
  );
}

const slideUp = keyframes`
  from { transform: translateY(100%); }
  to { transform: translateY(0); }
`;

const Backdrop = styled.div`
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.6);
  backdrop-filter: blur(4px);
  z-index: 999;
`;

const Sheet = styled.div`
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  max-width: 480px;
  margin: 0 auto;
  background: ${({ theme }) => theme.colors.surfaceElevated};
  border-radius: 24px 24px 0 0;
  border-top: 1px solid ${({ theme }) => theme.colors.outlineVariant};
  padding: 12px 0 40px;
  z-index: 1000;
  display: flex;
  flex-direction: column;
  gap: 0;
  animation: ${slideUp} 320ms cubic-bezier(0.16, 1, 0.3, 1);
  box-shadow: 0 -8px 40px rgba(0, 0, 0, 0.4);
`;

const Handle = styled.div`
  width: 40px;
  height: 4px;
  border-radius: 999px;
  background: transparent;
  margin: 0 auto 4px;
  @media (max-width: 768px) {
    background: ${({ theme }) => theme.colors.outlineVariant};
  }
`;

const SheetHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 8px 20px 16px;
`;

const SheetTitle = styled.span`
  font-family: "Barlow Condensed", sans-serif;
  font-weight: 900;
  font-size: 22px;
  text-transform: uppercase;
  letter-spacing: 0.04em;
  color: ${({ theme }) => theme.colors.primary};
`;

const CloseBtn = styled.button`
  width: 32px;
  height: 32px;
  border-radius: 50%;
  border: 1px solid ${({ theme }) => theme.colors.outlineVariant};
  background: transparent;
  color: ${({ theme }) => theme.colors.onSurfaceMuted};
  display: grid;
  place-items: center;
  cursor: pointer;
`;

const SheetBody = styled.div`
  display: flex;
  flex-direction: column;
  gap: 20px;
  padding: 0 20px;
`;

const Message = styled.p`
  font-size: 14px;
  color: ${({ theme }) => theme.colors.onSurfaceMuted};
  line-height: 1.5;
  margin: 0;
`;

const FieldGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

const FieldLabel = styled.label`
  font-size: 12px;
  font-weight: 700;
  color: ${({ theme }) => theme.colors.onSurfaceMuted};
  text-transform: uppercase;
  letter-spacing: 0.08em;
`;

const WeightRow = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
`;

const StepBtn = styled.button`
  width: 44px;
  height: 44px;
  border-radius: ${({ theme }) => theme.borderRadius.inner};
  border: 1.5px solid ${({ theme }) => theme.colors.outlineVariant};
  background: ${({ theme }) => theme.colors.surface};
  color: ${({ theme }) => theme.colors.onSurface};
  font-size: 22px;
  font-weight: 700;
  display: grid;
  place-items: center;
  cursor: pointer;
  flex-shrink: 0;
  transition: background 150ms ease;
  &:active {
    background: ${({ theme }) => theme.colors.primaryContainer};
  }
`;

const WeightInput = styled.input`
  flex: 1;
  height: 52px;
  border-radius: ${({ theme }) => theme.borderRadius.inner};
  border: 1.5px solid ${({ theme }) => theme.colors.outlineVariant};
  background: ${({ theme }) => theme.colors.surface};
  color: ${({ theme }) => theme.colors.onSurface};
  font-size: 24px;
  font-weight: 700;
  text-align: center;
  font-family: inherit;
  &:focus {
    outline: none;
    border-color: ${({ theme }) => theme.colors.primary};
  }
`;

const ActionsRow = styled.div`
  display: flex;
  gap: 10px;
`;

const DismissBtn = styled.button`
  height: 52px;
  padding: 0 20px;
  border-radius: ${({ theme }) => theme.borderRadius.pill};
  border: 1.5px solid ${({ theme }) => theme.colors.outlineVariant};
  background: transparent;
  color: ${({ theme }) => theme.colors.onSurfaceMuted};
  font-family: "Barlow Condensed", sans-serif;
  font-weight: 700;
  font-size: 14px;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  cursor: pointer;
  white-space: nowrap;
`;

const ConfirmBtn = styled.button`
  flex: 1;
  height: 52px;
  border-radius: ${({ theme }) => theme.borderRadius.pill};
  border: none;
  background: ${({ theme }) => theme.colors.primary};
  color: ${({ theme }) => theme.colors.onPrimary};
  font-family: "Barlow Condensed", sans-serif;
  font-weight: 900;
  font-size: 16px;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  cursor: pointer;
  box-shadow: ${({ theme }) => theme.shadows.primary};
`;
