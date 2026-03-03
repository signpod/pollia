"use client";

import { useMainBottomSlot } from "@/app/(site)/(main)/components/MainBottomSlotContext";
import { type ReactNode, useEffect } from "react";

interface EditorBottomSaveSlotProps {
  slotKey: string;
  isActive: boolean;
  node: ReactNode;
}

export function EditorBottomSaveSlot({ slotKey, isActive, node }: EditorBottomSaveSlotProps) {
  const { setMainBottomSlot, clearMainBottomSlot } = useMainBottomSlot();

  useEffect(() => {
    if (!isActive) {
      clearMainBottomSlot(slotKey);
      return;
    }

    setMainBottomSlot(slotKey, node);

    return () => {
      clearMainBottomSlot(slotKey);
    };
  }, [isActive, slotKey, node, setMainBottomSlot, clearMainBottomSlot]);

  return null;
}
