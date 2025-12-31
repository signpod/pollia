import { submitAnswerItemSchema } from "@/schemas/action-answer";
import { ActionType } from "@/types/domain/action";
import type { ActionAnswerItem, GetMissionResponseResponse } from "@/types/dto";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

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
  actionId: string;
  isRequired: boolean;
  missionResponse?: GetMissionResponseResponse;
  updateCanGoNext?: (canGoNext: boolean) => void;
  onAnswerChange?: (answer: ActionAnswerItem) => void;
  answerType?: typeof ActionType.MULTIPLE_CHOICE | typeof ActionType.TAG;
}

export function MultipleChoiceProvider({
  children,
  maxSelections,
  actionId,
  isRequired,
  missionResponse,
  updateCanGoNext,
  onAnswerChange,
  answerType,
}: SurveyMultipleChoiceProviderProps) {
  const initialSelectedIds = useMemo(() => {
    if (!missionResponse?.data?.answers || missionResponse.data.answers.length === 0) {
      return new Set<string>();
    }

    const questionAnswers = missionResponse.data.answers.filter(
      answer => answer.actionId === actionId && answer.optionId !== null,
    );

    if (questionAnswers.length === 0) {
      return new Set<string>();
    }

    return new Set(questionAnswers.map(answer => answer.optionId).filter(Boolean) as string[]);
  }, [missionResponse, actionId]);

  const [selectedIds, setSelectedIds] = useState<Set<string>>(() => new Set<string>());
  const [canGoNext, setCanGoNext] = useState(false);

  // updateCanGoNext와 onAnswerChange ref로 최신 참조 유지
  const updateCanGoNextRef = useRef(updateCanGoNext);
  const onAnswerChangeRef = useRef(onAnswerChange);
  useEffect(() => {
    updateCanGoNextRef.current = updateCanGoNext;
    onAnswerChangeRef.current = onAnswerChange;
  }, [updateCanGoNext, onAnswerChange]);

  useEffect(() => {
    setSelectedIds(initialSelectedIds);

    if (initialSelectedIds.size > 0) {
      const answer: ActionAnswerItem = {
        actionId,
        type: answerType ?? ActionType.MULTIPLE_CHOICE,
        isRequired,
        selectedOptionIds: Array.from(initialSelectedIds),
      };

      const validationResult = submitAnswerItemSchema.safeParse(answer);
      updateCanGoNextRef.current?.(validationResult.success);

      if (validationResult.success) {
        onAnswerChangeRef.current?.(answer);
      }
    } else {
      updateCanGoNextRef.current?.(false);
    }
  }, [initialSelectedIds, actionId, answerType]);

  const toggleSelectedId = useCallback(
    (optionId: string) => {
      setSelectedIds(prev => {
        const newSet = new Set(prev);

        if (maxSelections === 1) {
          if (newSet.has(optionId)) {
            newSet.delete(optionId);
            return newSet;
          }
          newSet.clear();
          newSet.add(optionId);
          return newSet;
        }

        if (newSet.has(optionId)) {
          newSet.delete(optionId);
        } else {
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
    if (selectedIds.size > 0) {
      const answer: ActionAnswerItem = {
        actionId,
        type: answerType ?? ActionType.MULTIPLE_CHOICE,
        isRequired,
        selectedOptionIds: Array.from(selectedIds),
      };

      const validationResult = submitAnswerItemSchema.safeParse(answer);
      const newCanGoNext = validationResult.success;
      setCanGoNext(newCanGoNext);
      updateCanGoNext?.(newCanGoNext);

      if (validationResult.success) {
        onAnswerChange?.(answer);
      }
    } else {
      setCanGoNext(false);
      updateCanGoNext?.(false);
    }
  }, [selectedIds, actionId, updateCanGoNext, onAnswerChange, answerType]);

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
