import { ACTION_PLACEHOLDER, ActionStepContentProps } from "@/constants/action";
import { submitAnswerItemSchema } from "@/schemas/action-answer";
import { SHORT_TEXT_ANSWER_MAX_LENGTH } from "@/schemas/action-answer";
import { ActionType } from "@/types/domain/action";
import type { ActionAnswerItem, GetMissionResponseResponse } from "@/types/dto";
import { Input } from "@repo/ui/components";
import { useEffect, useMemo, useRef, useState } from "react";
import { SurveyQuestionTemplate } from "../components/ActionTemplate";

export function ShortText({
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
  const { shortTextValue, handleShortTextValueChange, handleBlur, validationResult, showError } =
    useShortTextValue(
      actionData.id,
      actionData.isRequired,
      missionResponse,
      updateCanGoNext,
      onAnswerChange,
    );
  const isNextDisabled = isNextDisabledProp || !validationResult.success;
  const errorMessage = showError
    ? actionData.isRequired && !shortTextValue.trim()
      ? "필수 입력 사항이에요."
      : validationResult.error?.issues[0]?.message
    : undefined;

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
      isRequired={actionData.isRequired}
    >
      <Input
        placeholder={ACTION_PLACEHOLDER}
        maxLength={SHORT_TEXT_ANSWER_MAX_LENGTH}
        showLength
        value={shortTextValue}
        onChange={handleShortTextValueChange}
        onBlur={handleBlur}
        required
        errorMessage={errorMessage}
      />
    </SurveyQuestionTemplate>
  );
}

function useShortTextValue(
  actionId: string,
  isRequired: boolean,
  missionResponse?: GetMissionResponseResponse,
  updateCanGoNext?: (canGoNext: boolean) => void,
  onAnswerChange?: (answer: ActionAnswerItem) => void,
) {
  const initialTextValue = useMemo(() => {
    if (!missionResponse?.data?.answers || missionResponse.data.answers.length === 0) {
      return "";
    }

    const questionAnswer = missionResponse.data.answers.find(
      answer => answer.actionId === actionId && answer.textAnswer !== null,
    );

    return questionAnswer?.textAnswer ?? "";
  }, [missionResponse, actionId]);

  const [shortTextValue, setShortTextValue] = useState(initialTextValue);
  const [showError, setShowError] = useState(false);

  const updateCanGoNextRef = useRef(updateCanGoNext);
  const onAnswerChangeRef = useRef(onAnswerChange);

  useEffect(() => {
    updateCanGoNextRef.current = updateCanGoNext;
    onAnswerChangeRef.current = onAnswerChange;
  }, [updateCanGoNext, onAnswerChange]);

  useEffect(() => {
    setShortTextValue(initialTextValue);
    if (initialTextValue.trim()) {
      const result = submitAnswerItemSchema.safeParse({
        actionId,
        type: ActionType.SHORT_TEXT,
        isRequired,
        textAnswer: initialTextValue,
      });
      updateCanGoNextRef.current?.(result.success);
    }
  }, [initialTextValue, actionId, isRequired]);

  function handleShortTextValueChange(e: React.ChangeEvent<HTMLInputElement>) {
    const value = e.target.value;
    setShortTextValue(value);

    const result = submitAnswerItemSchema.safeParse({
      actionId,
      type: ActionType.SHORT_TEXT,
      isRequired,
      textAnswer: value,
    });
    updateCanGoNextRef.current?.(result.success);

    if (result.success) {
      onAnswerChangeRef.current?.({
        actionId,
        type: ActionType.SHORT_TEXT,
        isRequired,
        textAnswer: value.trim(),
      });
    }
  }

  function handleBlur() {
    setShowError(true);
  }

  const validationResult = useMemo(() => {
    return submitAnswerItemSchema.safeParse({
      actionId,
      type: ActionType.SHORT_TEXT,
      isRequired,
      textAnswer: shortTextValue,
    });
  }, [actionId, isRequired, shortTextValue]);

  return {
    shortTextValue,
    handleShortTextValueChange,
    handleBlur,
    validationResult,
    showError,
  };
}
