"use client";

import styled from "@emotion/styled";
import { type ReactNode, createContext, useContext, useState } from "react";
import { Button } from "./Button";
import { Dialog, DialogFooter, DialogHeader, DialogTitle } from "./Dialog";
import { color, fontSize } from "./tokens";

const AlertDialogContext = createContext<{
  open: boolean;
  setOpen: (v: boolean) => void;
}>({ open: false, setOpen: () => {} });

export function AlertDialog({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false);
  return (
    <AlertDialogContext.Provider value={{ open, setOpen }}>{children}</AlertDialogContext.Provider>
  );
}

export function AlertDialogTrigger({ children }: { children: ReactNode }) {
  const { setOpen } = useContext(AlertDialogContext);
  return <span onClick={() => setOpen(true)}>{children}</span>;
}

export function AlertDialogContent({ children }: { children: ReactNode }) {
  const { open, setOpen } = useContext(AlertDialogContext);
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      {children}
    </Dialog>
  );
}

export function AlertDialogHeader({ children }: { children: ReactNode }) {
  return <DialogHeader>{children}</DialogHeader>;
}

export function AlertDialogTitle({ children }: { children: ReactNode }) {
  return <DialogTitle>{children}</DialogTitle>;
}

export function AlertDialogDescription({ children }: { children: ReactNode }) {
  return <Description>{children}</Description>;
}

export function AlertDialogFooter({ children }: { children: ReactNode }) {
  return <DialogFooter>{children}</DialogFooter>;
}

export function AlertDialogCancel({ children }: { children: ReactNode }) {
  const { setOpen } = useContext(AlertDialogContext);
  return (
    <Button variant="outline" onClick={() => setOpen(false)}>
      {children}
    </Button>
  );
}

interface AlertDialogActionProps {
  children: ReactNode;
  onClick?: () => void;
  disabled?: boolean;
}

export function AlertDialogAction({ children, onClick, disabled }: AlertDialogActionProps) {
  const { setOpen } = useContext(AlertDialogContext);
  return (
    <Button
      variant="destructive"
      disabled={disabled}
      onClick={() => {
        onClick?.();
        setOpen(false);
      }}
    >
      {children}
    </Button>
  );
}

const Description = styled.p`
  font-size: ${fontSize.sm};
  color: ${color.gray500};
  margin-top: 4px;
`;
