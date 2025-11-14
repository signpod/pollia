import type { SurveyAnswerItem } from "@/types/dto/survey";
import { createContext, useCallback, useContext, useMemo, useState } from "react";

interface SurveyMultipleChoiceContextType {
  selectedIds: Set<string>;
  toggleSelectedId: (optionId: string) => void;
  canGoNext: boolean;
}

const SurveyMultipleChoiceContext = createContext<SurveyMultipleChoiceContextType | null>(null);

interface SurveyMultipleChoiceProviderProps {
  children: React.ReactNode;
  maxSelections: number;
  questionId: string;
  updateCanGoNext?: (canGoNext: boolean) => void;
  onAnswerChange?: (answer: SurveyAnswerItem) => void;
}

export function SurveyMultipleChoiceProvider({
  children,
  maxSelections,
  questionId,
  updateCanGoNext,
  onAnswerChange,
}: SurveyMultipleChoiceProviderProps) {
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [canGoNext, setCanGoNext] = useState(false);

  const toggleSelectedId = useCallback(
    (optionId: string) => {
      const newSet = new Set(selectedIds);

      if (newSet.has(optionId)) {
        newSet.delete(optionId);
      } else {
        if (maxSelections === 1) {
          newSet.clear();
        }
        if (newSet.size < maxSelections) {
          newSet.add(optionId);
        }
      }

      const newCanGoNext = newSet.size > 0;

      setSelectedIds(newSet);

      queueMicrotask(() => {
        setCanGoNext(newCanGoNext);
        updateCanGoNext?.(newCanGoNext);

        if (newSet.size > 0) {
          onAnswerChange?.({
            questionId,
            type: "MULTIPLE_CHOICE",
            selectedOptionIds: Array.from(newSet),
          });
        }
      });
    },
    [selectedIds, maxSelections, questionId, updateCanGoNext, onAnswerChange],
  );

  const value = useMemo(
    () => ({ selectedIds, toggleSelectedId, canGoNext }),
    [selectedIds, toggleSelectedId, canGoNext],
  );

  return (
    <SurveyMultipleChoiceContext.Provider value={value}>
      {children}
    </SurveyMultipleChoiceContext.Provider>
  );
}

export function useSurveyMultipleChoice() {
  const context = useContext(SurveyMultipleChoiceContext);
  if (!context) {
    throw new Error("useSurveyMultipleChoice must be used within a SurveyMultipleChoiceProvider");
  }
  return context;
}
