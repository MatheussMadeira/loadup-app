"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { useScrollLock } from "@/hooks/useScrollLock";

import {
  StyledNumPadBackdrop,
  StyledNumPadConfirmBtn,
  StyledNumPadDisplay,
  StyledNumPadDisplayValue,
  StyledNumPadGrid,
  StyledNumPadHandle,
  StyledNumPadHeader,
  StyledNumPadKey,
  StyledNumPadSheet,
} from "./styles";

interface NumPadProps {
  value: string;
  label: string;
  allowDecimal?: boolean;
  onConfirm: (value: string) => void;
  onClose: () => void;
}

const KEYS = ["7", "8", "9", "4", "5", "6", "1", "2", "3"];

export default function NumPad({
  value,
  label,
  allowDecimal = false,
  onConfirm,
  onClose,
}: NumPadProps) {
  const [display, setDisplay] = useState(() => {
    const num = parseFloat(value);
    return isNaN(num) ? "" : String(num);
  });
  const [mounted, setMounted] = useState(false);
  const [startY, setStartY] = useState(0);
  const [dragY, setDragY] = useState(0);
  const sheetRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  useScrollLock();

  const handleTouchStart = (e: React.TouchEvent) => {
    setStartY(e.touches[0].clientY);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    const delta = e.touches[0].clientY - startY;
    if (delta > 0) setDragY(delta);
  };

  const handleTouchEnd = () => {
    if (dragY > 100) {
      onClose();
    }
    setDragY(0);
  };

  const handleKey = (key: string) => {
    if (key === "⌫") {
      setDisplay((prev) => prev.slice(0, -1));
      return;
    }
    if (key === ".") {
      setDisplay((prev) => {
        if (!allowDecimal || prev.includes(".")) return prev;
        return (prev === "" ? "0" : prev) + ".";
      });
      return;
    }
    setDisplay((prev) => {
      if (prev.length >= 6) return prev;
      if (prev === "0") return key;
      return prev + key;
    });
  };

  const handleConfirm = () => {
    const parsed = parseFloat(display);
    onConfirm(isNaN(parsed) ? "0" : String(parsed));
    onClose();
  };

  const displayValue = display || "0";
  const bottomKeys: string[] = [allowDecimal ? "." : "", "0", "⌫"];

  if (!mounted) return null;

  return createPortal(
    <>
      <StyledNumPadBackdrop onClick={onClose} />
      <StyledNumPadSheet
        ref={sheetRef}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        style={{
          transform: `translateY(${dragY}px)`,
          transition:
            dragY > 0 ? "none" : "transform 300ms cubic-bezier(0.16, 1, 0.3, 1)",
        }}
      >
        <StyledNumPadHandle />
        <StyledNumPadHeader>{label}</StyledNumPadHeader>
        <StyledNumPadDisplay>
          <StyledNumPadDisplayValue>{displayValue}</StyledNumPadDisplayValue>
        </StyledNumPadDisplay>
        <StyledNumPadGrid>
          {KEYS.map((key) => (
            <StyledNumPadKey
              key={key}
              type="button"
              onClick={() => handleKey(key)}
            >
              {key}
            </StyledNumPadKey>
          ))}
          {bottomKeys.map((key, i) => (
            <StyledNumPadKey
              key={`bottom-${i}`}
              type="button"
              $isBackspace={key === "⌫"}
              $isEmpty={key === ""}
              onClick={() => key && handleKey(key)}
            >
              {key === "⌫" ? (
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                >
                  <path d="M22 3H7c-.69 0-1.23.35-1.59.88L0 12l5.41 8.11c.36.53.9.89 1.59.89H22c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-3.29 13.29a1 1 0 0 1-1.41 0L15 14l-2.29 2.29a1 1 0 1 1-1.41-1.41L13.59 13l-2.3-2.29a1 1 0 0 1 1.41-1.41L15 11.59l2.29-2.29a1 1 0 0 1 1.41 1.41L16.41 13l2.29 2.29c.4.4.4 1.02.01 1.41z" />
                </svg>
              ) : (
                key
              )}
            </StyledNumPadKey>
          ))}
        </StyledNumPadGrid>
        <StyledNumPadConfirmBtn type="button" onClick={handleConfirm}>
          Confirmar
        </StyledNumPadConfirmBtn>
      </StyledNumPadSheet>
    </>,
    document.body,
  );
}
