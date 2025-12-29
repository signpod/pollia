import { ActionStepContentProps } from "@/constants/action";
import { submitAnswerItemSchema } from "@/schemas/action-answer";
import { ActionType } from "@/types/domain/action";
import type { ActionAnswerItem, GetMissionResponseResponse } from "@/types/dto";
import { Textarea } from "@repo/ui/components";
import { useEffect, useMemo, useRef, useState } from "react";
import { SurveyQuestionTemplate } from "../components/ActionTemplate";

const PLACEHOLDER = "답변을 입력해주세요";

export function Subjective({
  actionData,
  currentOrder,
  totalActionCount,
  isFirstAction,
  onPrevious,
  onNext,
  nextButtonText,
  isNextDisabled: isNextDisabledProp,
  updateCanGoNext,
  onAnswerChange,
  missionResponse,
  isLoading,
}: ActionStepContentProps) {
  const {
    subjectiveValue,
    handleSubjectiveValueChange,
    handleBlur,
    helperText,
    validationResult,
    showError,
  } = useSurveySubjectiveValue(actionData.id, missionResponse, updateCanGoNext, onAnswerChange);
  const isNextDisabled = isNextDisabledProp || !validationResult.success;
  const errorMessage = showError ? validationResult.error?.issues[0]?.message : undefined;

  return (
    <SurveyQuestionTemplate
      currentOrder={currentOrder}
      totalActionCount={totalActionCount}
      title={actionData.title}
      description={actionData.description ?? undefined}
      imageUrl={actionData.imageUrl ?? undefined}
      isFirstAction={isFirstAction}
      isNextDisabled={isNextDisabled}
      onPrevious={onPrevious}
      onNext={onNext}
      nextButtonText={nextButtonText}
      isLoading={isLoading}
    >
      <Textarea
        placeholder={PLACEHOLDER}
        maxLength={100}
        showLength
        value={subjectiveValue}
        onChange={handleSubjectiveValueChange}
        onBlur={handleBlur}
        required
        rows={4}
        resize="vertical"
        helperText={helperText}
        errorMessage={errorMessage}
      />
    </SurveyQuestionTemplate>
  );
}

function useSurveySubjectiveValue(
  actionId: string,
  missionResponse?: GetMissionResponseResponse,
  updateCanGoNext?: (canGoNext: boolean) => void,
  onAnswerChange?: (answer: ActionAnswerItem) => void,
) {
  const [helperText, setHelperText] = useState<string | undefined>(undefined);
  const initialTextValue = useMemo(() => {
    if (!missionResponse?.data?.answers || missionResponse.data.answers.length === 0) {
      return "";
    }

    const questionAnswer = missionResponse.data.answers.find(
      answer => answer.actionId === actionId && answer.textAnswer !== null,
    );

    return questionAnswer?.textAnswer ?? "";
  }, [missionResponse, actionId]);

  const [subjectiveValue, setSubjectiveValue] = useState(initialTextValue);
  const [showError, setShowError] = useState(false);

  // updateCanGoNext와 onAnswerChange ref로 최신 참조 유지
  const updateCanGoNextRef = useRef(updateCanGoNext);
  const onAnswerChangeRef = useRef(onAnswerChange);

  useEffect(() => {
    updateCanGoNextRef.current = updateCanGoNext;
    onAnswerChangeRef.current = onAnswerChange;
  }, [updateCanGoNext, onAnswerChange]);

  useEffect(() => {
    setSubjectiveValue(initialTextValue);
    if (initialTextValue.trim()) {
      const result = submitAnswerItemSchema.safeParse({
        actionId,
        type: ActionType.SUBJECTIVE,
        textAnswer: initialTextValue,
      });
      updateCanGoNextRef.current?.(result.success);

      if (result.success) {
        onAnswerChangeRef.current?.({
          actionId,
          type: ActionType.SUBJECTIVE,
          textAnswer: initialTextValue,
        });
      }
    }
  }, [initialTextValue, actionId]);

  function handleSubjectiveValueChange(e: React.ChangeEvent<HTMLTextAreaElement>) {
    const value = e.target.value;
    setSubjectiveValue(value);

    const result = submitAnswerItemSchema.safeParse({
      actionId,
      type: ActionType.SUBJECTIVE,
      textAnswer: value,
    });
    updateCanGoNext?.(result.success);

    if (result.success) {
      onAnswerChange?.({
        actionId,
        type: ActionType.SUBJECTIVE,
        textAnswer: value.trim(),
      });
    }
  }

  function handleBlur() {
    setShowError(true);
    const feedbackMessage =
      FEEDBACK_MESSAGES[Math.min(subjectiveValue.length, MAX_FEEDBACK_MESSAGE_LENGTH)] ??
      FEEDBACK_MESSAGES[1];
    setHelperText(feedbackMessage);
  }

  const validationResult = submitAnswerItemSchema.safeParse({
    actionId,
    type: ActionType.SUBJECTIVE,
    textAnswer: subjectiveValue,
  });

  return {
    subjectiveValue,
    handleSubjectiveValueChange,
    handleBlur,
    helperText,
    validationResult,
    showError,
  };
}

const MAX_FEEDBACK_MESSAGE_LENGTH = 1;

const FEEDBACK_MESSAGES: Record<number, string> = {
  1: "조금 더 구체적으로 적어주세요! 👀",
};
