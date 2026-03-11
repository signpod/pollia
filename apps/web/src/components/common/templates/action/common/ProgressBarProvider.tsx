"use client";
import { ProgressBarV2 } from "@repo/ui/components";
import { type ReactNode, createContext, useContext, useState } from "react";

const PROGRESS_BAR_CONTAINER_HEIGHT = "h-[60px]";

interface ProgressBarContextValue {
  setProgress: (value: number, currentOrder?: number, totalOrder?: number) => void;
  setBadgeVariant: (variant: "success" | "error" | "loading" | undefined) => void;
  setIsBadgeVisible: (visible: boolean) => void;
}

const ProgressBarContext = createContext<ProgressBarContextValue | null>(null);

export function useProgressBar() {
  const context = useContext(ProgressBarContext);
  if (!context) {
    throw new Error("useProgressBar must be used within ProgressBarProvider");
  }
  return context;
}

interface ProgressBarProviderProps {
  children: ReactNode;
}

export function ProgressBarProvider({ children }: ProgressBarProviderProps) {
  const [value, setValue] = useState<number>(0);
  const [currentOrder, setCurrentOrder] = useState<number | undefined>(undefined);
  const [totalOrder, setTotalOrder] = useState<number | undefined>(undefined);
  const [badgeVariant, setBadgeVariant] = useState<"success" | "error" | "loading" | undefined>(
    undefined,
  );
  const [isBadgeVisible, setIsBadgeVisible] = useState<boolean>(false);

  const setProgress = (newValue: number, newCurrentOrder?: number, newTotalOrder?: number) => {
    setValue(newValue);
    if (newCurrentOrder !== undefined) {
      setCurrentOrder(newCurrentOrder);
    }
    if (newTotalOrder !== undefined) {
      setTotalOrder(newTotalOrder);
    }
  };

  return (
    <ProgressBarContext.Provider
      value={{
        setProgress,
        setBadgeVariant,
        setIsBadgeVisible,
      }}
    >
      <div className="pt-1">
        <ProgressBarV2
          value={value}
          currentOrder={currentOrder}
          totalOrder={totalOrder}
          badgeVariant={badgeVariant}
          isBadgeVisible={isBadgeVisible}
        />
      </div>

      {children}
    </ProgressBarContext.Provider>
  );
}
