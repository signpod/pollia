import { useReadSurveyResponseForSurvey } from "@/hooks/survey-response";
import type { SurveyAnswerItem } from "@/types/dto/survey";
import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";

interface SurveyMultipleChoiceContextType {
  selectedIds: Set<string>;
  toggleSelectedId: (optionId: string) => void;
  canGoNext: boolean;
}

const SurveyMultipleChoiceContext = createContext<SurveyMultipleChoiceContextType | undefined>(
  undefined,
);

interface SurveyMultipleChoiceProviderProps {
  children: React.ReactNode;
  maxSelections: number;
  questionId: string;
  surveyId: string | null;
  updateCanGoNext?: (canGoNext: boolean) => void;
  onAnswerChange?: (answer: SurveyAnswerItem) => void;
}

export function SurveyMultipleChoiceProvider({
  children,
  maxSelections,
  questionId,
  surveyId,
  updateCanGoNext,
  onAnswerChange,
}: SurveyMultipleChoiceProviderProps) {
  const { data: responseData } = useReadSurveyResponseForSurvey({
    surveyId: surveyId || "",
  });

  const initialSelectedIds = useMemo(() => {
    if (!surveyId || !responseData?.data?.answers || responseData.data.answers.length === 0) {
      return new Set<string>();
    }

    const questionAnswers = responseData.data.answers.filter(
      answer => answer.questionId === questionId && answer.optionId !== null,
    );

    if (questionAnswers.length === 0) {
      return new Set<string>();
    }

    return new Set(questionAnswers.map(answer => answer.optionId).filter(Boolean) as string[]);
  }, [surveyId, responseData, questionId]);

  const [selectedIds, setSelectedIds] = useState<Set<string>>(initialSelectedIds);
  const [canGoNext, setCanGoNext] = useState(false);

  useEffect(() => {
    setSelectedIds(initialSelectedIds);

    if (initialSelectedIds.size > 0) {
      onAnswerChange?.({
        questionId,
        type: "MULTIPLE_CHOICE",
        selectedOptionIds: Array.from(initialSelectedIds),
      });
    }
  }, [initialSelectedIds, questionId, onAnswerChange]);

  const toggleSelectedId = useCallback(
    (optionId: string) => {
      setSelectedIds(prev => {
        const newSet = new Set(prev);

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

        return newSet;
      });
    },
    [maxSelections],
  );

  useEffect(() => {
    const newCanGoNext = selectedIds.size > 0;
    setCanGoNext(newCanGoNext);
    updateCanGoNext?.(newCanGoNext);

    if (selectedIds.size > 0) {
      onAnswerChange?.({
        questionId,
        type: "MULTIPLE_CHOICE",
        selectedOptionIds: Array.from(selectedIds),
      });
    }
  }, [selectedIds, questionId, updateCanGoNext, onAnswerChange]);

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
