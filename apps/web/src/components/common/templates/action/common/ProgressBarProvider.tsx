"use client";

import { type ReactNode, createContext, useCallback, useContext, useRef, useState } from "react";

interface ProgressBarContextValue {
  progress: number;
  setProgress: (value: number) => void;
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
  const maxProgressRef = useRef(0);
  const [progress, setProgressState] = useState(0);

  const setProgress = useCallback((newValue: number) => {
    const clamped = Math.max(newValue, maxProgressRef.current);
    maxProgressRef.current = clamped;
    setProgressState(clamped);
  }, []);

  return (
    <ProgressBarContext.Provider value={{ progress, setProgress }}>
      {children}
    </ProgressBarContext.Provider>
  );
}
