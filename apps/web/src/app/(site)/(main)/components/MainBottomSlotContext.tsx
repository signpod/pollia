"use client";

import { type ReactNode, createContext, useCallback, useContext, useMemo, useState } from "react";

interface MainBottomSlotContextValue {
  currentSlotNode: ReactNode | null;
  setMainBottomSlot: (key: string, node: ReactNode) => void;
  clearMainBottomSlot: (key: string) => void;
}

interface MainBottomSlotState {
  key: string;
  node: ReactNode;
}

const MainBottomSlotContext = createContext<MainBottomSlotContextValue | null>(null);

export function MainBottomSlotProvider({ children }: { children: ReactNode }) {
  const [slot, setSlot] = useState<MainBottomSlotState | null>(null);

  const setMainBottomSlot = useCallback((key: string, node: ReactNode) => {
    setSlot({ key, node });
  }, []);

  const clearMainBottomSlot = useCallback((key: string) => {
    setSlot(prev => {
      if (!prev || prev.key !== key) {
        return prev;
      }
      return null;
    });
  }, []);

  const value = useMemo<MainBottomSlotContextValue>(
    () => ({
      currentSlotNode: slot?.node ?? null,
      setMainBottomSlot,
      clearMainBottomSlot,
    }),
    [slot, setMainBottomSlot, clearMainBottomSlot],
  );

  return <MainBottomSlotContext.Provider value={value}>{children}</MainBottomSlotContext.Provider>;
}

export function useMainBottomSlot() {
  const context = useContext(MainBottomSlotContext);

  if (!context) {
    throw new Error("useMainBottomSlot must be used within MainBottomSlotProvider");
  }

  return context;
}
