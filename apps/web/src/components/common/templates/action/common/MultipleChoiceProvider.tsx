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
  maxSelections: number;
}

const SurveyMultipleChoiceContext = createContext<SurveyMultipleChoiceContextType | undefined>(
  undefined,
);

interface ActionOption {
  id: string;
  nextActionId?: string | null;
  nextCompletionId?: string | null;
}

interface SurveyMultipleChoiceProviderProps {
  children: React.ReactNode;
  maxSelections: number;
  actionId: string;
  isRequired: boolean;
  missionResponse?: GetMissionResponseResponse;
  updateCanGoNext?: (canGoNext: boolean) => void;
  onAnswerChange?: (answer: ActionAnswerItem) => void;
  answerType?: typeof ActionType.MULTIPLE_CHOICE | typeof ActionType.TAG | typeof ActionType.OX;
  options?: ActionOption[];
  actionNextActionId?: string | null;
  actionNextCompletionId?: string | null;
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
  options = [],
  actionNextActionId,
  actionNextCompletionId,
}: SurveyMultipleChoiceProviderProps) {
  const initialSelectedIds = useMemo(() => {
    if (!missionResponse?.data?.answers || missionResponse.data.answers.length === 0) {
      return new Set<string>();
    }

    const questionAnswer = missionResponse.data.answers.find(
      answer => answer.actionId === actionId && answer.options.length > 0,
    );

    if (!questionAnswer) {
      return new Set<string>();
    }

    return new Set(questionAnswer.options.map(option => option.id));
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
          ? {
              selectedOptions: Array.from(initialSelectedIds).map(optionId => ({
                optionId,
                nextActionId: "",
              })),
            }
          : {}),
        ...(answerWithText?.textAnswer ? { textAnswer: answerWithText.textAnswer } : {}),
        ...(actionNextActionId && { nextActionId: actionNextActionId }),
        ...(actionNextCompletionId && { nextCompletionId: actionNextCompletionId }),
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
        ...(actionNextActionId && { nextActionId: actionNextActionId }),
        ...(actionNextCompletionId && { nextCompletionId: actionNextCompletionId }),
      });
    } else {
      updateCanGoNextRef.current?.(false);
      // 필수 질문이어도 항상 현재 질문의 답변 상태로 초기화
      onAnswerChangeRef.current?.({
        actionId,
        type: answerType ?? ActionType.MULTIPLE_CHOICE,
        isRequired,
        ...(actionNextActionId && { nextActionId: actionNextActionId }),
        ...(actionNextCompletionId && { nextCompletionId: actionNextCompletionId }),
      });
    }
  }, [
    initialSelectedIds,
    actionId,
    answerType,
    isRequired,
    missionResponse,
    actionNextActionId,
    actionNextCompletionId,
  ]);

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

      // 단일 선택인 경우 선택된 option의 nextActionId, nextCompletionId 가져오기
      const selectedOption =
        maxSelections === 1 && realOptionIds.length === 1
          ? options.find(opt => opt.id === realOptionIds[0])
          : null;
      // 옵션의 nextActionId가 없으면 action의 nextActionId 사용
      const nextActionId = selectedOption?.nextActionId ?? actionNextActionId ?? undefined;
      // 옵션의 nextCompletionId가 없으면 action의 nextCompletionId 사용
      const nextCompletionId =
        selectedOption?.nextCompletionId ?? actionNextCompletionId ?? undefined;

      const answer: ActionAnswerItem = {
        actionId,
        type: answerType ?? ActionType.MULTIPLE_CHOICE,
        isRequired,
        ...(realOptionIds.length > 0 ? { selectedOptionIds: realOptionIds } : {}),
        ...(isOtherSelected && textAnswer.trim() ? { textAnswer: textAnswer.trim() } : {}),
        ...(nextActionId ? { nextActionId } : {}),
        ...(nextCompletionId ? { nextCompletionId } : {}),
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
        ...(actionNextActionId && { nextActionId: actionNextActionId }),
        ...(actionNextCompletionId && { nextCompletionId: actionNextCompletionId }),
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
    maxSelections,
    options,
    actionNextActionId,
    actionNextCompletionId,
  ]);

  const value = useMemo(
    () => ({
      selectedIds,
      toggleSelectedId,
      canGoNext,
      textAnswer,
      setTextAnswer,
      isOtherSelected,
      maxSelections,
    }),
    [selectedIds, toggleSelectedId, canGoNext, textAnswer, isOtherSelected, maxSelections],
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
