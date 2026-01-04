import { CLIENT_OTHER_OPTION_ID } from "@/constants/action";
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
  textAnswer: string;
  setTextAnswer: (text: string) => void;
  isOtherSelected: boolean;
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
  const [textAnswer, setTextAnswer] = useState("");
  const isOtherSelected = selectedIds.has(CLIENT_OTHER_OPTION_ID);

  // updateCanGoNext와 onAnswerChange ref로 최신 참조 유지
  const updateCanGoNextRef = useRef(updateCanGoNext);
  const onAnswerChangeRef = useRef(onAnswerChange);
  useEffect(() => {
    updateCanGoNextRef.current = updateCanGoNext;
    onAnswerChangeRef.current = onAnswerChange;
  }, [updateCanGoNext, onAnswerChange]);

  useEffect(() => {
    // Load initial textAnswer from textAnswer field
    const answerWithText = missionResponse?.data?.answers.find(
      answer => answer.actionId === actionId && answer.textAnswer,
    );

    const initialIds = new Set(initialSelectedIds);
    if (answerWithText?.textAnswer) {
      setTextAnswer(answerWithText.textAnswer);
      initialIds.add(CLIENT_OTHER_OPTION_ID);
    }

    setSelectedIds(initialIds);

    if (initialIds.size > 0 || answerWithText?.textAnswer) {
      const answer: ActionAnswerItem = {
        actionId,
        type: answerType ?? ActionType.MULTIPLE_CHOICE,
        isRequired,
        ...(initialSelectedIds.size > 0
          ? { selectedOptionIds: Array.from(initialSelectedIds) }
          : {}),
        ...(answerWithText?.textAnswer ? { textAnswer: answerWithText.textAnswer } : {}),
      };

      const validationResult = submitAnswerItemSchema.safeParse(answer);
      updateCanGoNextRef.current?.(validationResult.success);

      if (validationResult.success) {
        onAnswerChangeRef.current?.(answer);
      }
    } else if (!isRequired) {
      updateCanGoNextRef.current?.(true);
      onAnswerChangeRef.current?.({
        actionId,
        type: answerType ?? ActionType.MULTIPLE_CHOICE,
        isRequired,
      });
    } else {
      updateCanGoNextRef.current?.(false);
    }
  }, [initialSelectedIds, actionId, answerType, isRequired, missionResponse]);

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
      // Filter out CLIENT_OTHER_OPTION_ID from selectedOptionIds
      const realOptionIds = Array.from(selectedIds).filter(id => id !== CLIENT_OTHER_OPTION_ID);

      const answer: ActionAnswerItem = {
        actionId,
        type: answerType ?? ActionType.MULTIPLE_CHOICE,
        isRequired,
        ...(realOptionIds.length > 0 ? { selectedOptionIds: realOptionIds } : {}),
        ...(isOtherSelected && textAnswer.trim() ? { textAnswer: textAnswer.trim() } : {}),
      };

      // If "기타" is selected, textAnswer must be filled
      const isTextAnswerValid = !isOtherSelected || textAnswer.trim().length > 0;
      // Must have at least one real option OR "기타" with text
      const hasValidSelection = realOptionIds.length > 0 || (isOtherSelected && textAnswer.trim());

      const validationResult = submitAnswerItemSchema.safeParse(answer);
      const newCanGoNext = Boolean(
        validationResult.success && isTextAnswerValid && hasValidSelection,
      );
      setCanGoNext(newCanGoNext);
      updateCanGoNext?.(newCanGoNext);

      if (validationResult.success && isTextAnswerValid && hasValidSelection) {
        onAnswerChange?.(answer);
      }
    } else if (!isRequired) {
      setCanGoNext(true);
      updateCanGoNext?.(true);
      onAnswerChange?.({
        actionId,
        type: answerType ?? ActionType.MULTIPLE_CHOICE,
        isRequired,
      });
    } else {
      setCanGoNext(false);
      updateCanGoNext?.(false);
    }
  }, [
    selectedIds,
    actionId,
    updateCanGoNext,
    onAnswerChange,
    answerType,
    isOtherSelected,
    textAnswer,
    isRequired,
  ]);

  const value = useMemo(
    () => ({
      selectedIds,
      toggleSelectedId,
      canGoNext,
      textAnswer,
      setTextAnswer,
      isOtherSelected,
    }),
    [selectedIds, toggleSelectedId, canGoNext, textAnswer, isOtherSelected],
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
