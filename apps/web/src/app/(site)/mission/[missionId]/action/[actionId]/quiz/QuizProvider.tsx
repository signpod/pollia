"use client";

import type { QuizConfig } from "@/schemas/mission/quizConfigSchema";
import { type ReactNode, createContext, useContext, useMemo } from "react";

interface QuizContextValue {
  quizConfig: QuizConfig;
}

const QuizContext = createContext<QuizContextValue | null>(null);

export function useQuizContext() {
  return useContext(QuizContext);
}

interface QuizProviderProps {
  children: ReactNode;
  quizConfig: QuizConfig;
}

export function QuizProvider({ children, quizConfig }: QuizProviderProps) {
  const value = useMemo(() => ({ quizConfig }), [quizConfig]);

  return <QuizContext.Provider value={value}>{children}</QuizContext.Provider>;
}
