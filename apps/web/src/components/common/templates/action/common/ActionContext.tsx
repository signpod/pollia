"use client";

import type { ActionAnswerItem } from "@/types/dto";
import type { GetMissionResponseResponse } from "@/types/dto/mission-response";
import { type ReactNode, createContext, useContext } from "react";

interface ActionContextValue {
  currentOrder: number;
  totalActionCount: number;
  isFirstAction: boolean;
  onPrevious: () => void;
  onNext: () => void | Promise<void>;
  onPrefetchNext: () => void;
  nextButtonText: string;
  isLoading: boolean;
  isNextDisabled: boolean;
  updateCanGoNext: (canGoNext: boolean) => void;
  onAnswerChange: (answer: ActionAnswerItem) => void;
  missionResponse?: GetMissionResponseResponse;
  animationName?: string;
  shuffleChoices?: boolean;
}

const ActionContext = createContext<ActionContextValue | null>(null);

export function useActionContext() {
  const context = useContext(ActionContext);
  if (!context) {
    throw new Error("useActionContext must be used within ActionProvider");
  }
  return context;
}

interface ActionProviderProps {
  children: ReactNode;
  value: ActionContextValue;
}

export function ActionProvider({ children, value }: ActionProviderProps) {
  return <ActionContext.Provider value={value}>{children}</ActionContext.Provider>;
}
