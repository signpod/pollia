"use client";

import styled from "@emotion/styled";
import { type ReactNode, useEffect } from "react";
import { color, fontSize, radius, shadow } from "./tokens";

interface DialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  children: ReactNode;
}

export function Dialog({ open, onOpenChange, children }: DialogProps) {
  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";
      return () => {
        document.body.style.overflow = "";
      };
    }
  }, [open]);

  if (!open) return null;

  return (
    <Overlay onClick={() => onOpenChange(false)}>
      <Content onClick={e => e.stopPropagation()}>{children}</Content>
    </Overlay>
  );
}

const Overlay = styled.div`
  position: fixed;
  inset: 0;
  z-index: 50;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(0, 0, 0, 0.5);
`;

const Content = styled.div`
  background: ${color.white};
  border-radius: ${radius.lg};
  box-shadow: ${shadow.lg};
  width: 100%;
  max-width: 28rem;
  max-height: 90vh;
  overflow-y: auto;
  padding: 24px;
`;

export const DialogHeader = styled.div`
  margin-bottom: 16px;
`;

export const DialogTitle = styled.h2`
  font-size: ${fontSize.lg};
  font-weight: 600;
  color: ${color.gray900};
`;

export const DialogDescription = styled.p`
  font-size: ${fontSize.sm};
  color: ${color.gray500};
  margin-top: 4px;
`;

export const DialogFooter = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: 8px;
  margin-top: 24px;
`;
