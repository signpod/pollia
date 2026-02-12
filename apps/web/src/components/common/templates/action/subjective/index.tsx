import { ACTION_PLACEHOLDER, ActionStepContentProps } from "@/constants/action";
import { submitAnswerItemSchema } from "@/schemas/action-answer";
import { TEXT_ANSWER_MAX_LENGTH } from "@/schemas/action-answer";
import { ActionType } from "@/types/domain/action";
import type { ActionAnswerItem, GetMissionResponseResponse } from "@/types/dto";
import { Textarea } from "@repo/ui/components";
import { useEffect, useMemo, useRef, useState } from "react";
import { useActionContext } from "../common/ActionContext";
import { SurveyQuestionTemplate } from "../common/ActionTemplate";

export function Subjective({ actionData }: ActionStepContentProps) {
  const { updateCanGoNext, onAnswerChange, missionResponse } = useActionContext();

  const {
    subjectiveValue,
    handleSubjectiveValueChange,
    handleBlur,
    helperText,
    validationResult,
    showError,
  } = useSurveySubjectiveValue(
    actionData.id,
    actionData.isRequired,
    missionResponse,
    updateCanGoNext,
    onAnswerChange,
    actionData.nextActionId,
    actionData.nextCompletionId,
  );

  const errorMessage = showError ? validationResult.error?.issues[0]?.message : undefined;

  return (
    <SurveyQuestionTemplate
      title={actionData.title}
      description={actionData.description ?? undefined}
      imageUrl={actionData.imageUrl ?? undefined}
      isRequired={actionData.isRequired}
    >
      <Textarea
        placeholder={ACTION_PLACEHOLDER}
        maxLength={TEXT_ANSWER_MAX_LENGTH}
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
  isRequired: boolean,
  missionResponse?: GetMissionResponseResponse,
  updateCanGoNext?: (canGoNext: boolean) => void,
  onAnswerChange?: (answer: ActionAnswerItem) => void,
  nextActionId?: string | null,
  nextCompletionId?: string | null,
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
        isRequired,
        textAnswer: initialTextValue,
      });
      updateCanGoNextRef.current?.(result.success);

      if (result.success) {
        onAnswerChangeRef.current?.({
          actionId,
          type: ActionType.SUBJECTIVE,
          isRequired,
          textAnswer: initialTextValue,
          ...(nextActionId && { nextActionId }),
          ...(nextCompletionId && { nextCompletionId }),
        });
      }
    } else if (!isRequired) {
      updateCanGoNextRef.current?.(true);
      onAnswerChangeRef.current?.({
        actionId,
        type: ActionType.SUBJECTIVE,
        isRequired,
        textAnswer: "",
        ...(nextActionId && { nextActionId }),
        ...(nextCompletionId && { nextCompletionId }),
      });
    } else {
      updateCanGoNextRef.current?.(false);
      onAnswerChangeRef.current?.({
        actionId,
        type: ActionType.SUBJECTIVE,
        isRequired,
        textAnswer: "",
        ...(nextActionId && { nextActionId }),
        ...(nextCompletionId && { nextCompletionId }),
      });
    }
  }, [initialTextValue, actionId, isRequired, nextActionId, nextCompletionId]);

  function handleSubjectiveValueChange(e: React.ChangeEvent<HTMLTextAreaElement>) {
    const value = e.target.value;
    setSubjectiveValue(value);

    const result = submitAnswerItemSchema.safeParse({
      actionId,
      type: ActionType.SUBJECTIVE,
      isRequired,
      textAnswer: value,
    });
    updateCanGoNext?.(result.success);

    if (result.success) {
      onAnswerChange?.({
        actionId,
        type: ActionType.SUBJECTIVE,
        isRequired,
        textAnswer: value.trim(),
        ...(nextActionId && { nextActionId }),
        ...(nextCompletionId && { nextCompletionId }),
      });
    }
  }

  function handleBlur() {
    setShowError(true);
    if (subjectiveValue.length === 1) {
      const feedbackMessage = FEEDBACK_MESSAGES[1];
      setHelperText(feedbackMessage);
    } else {
      setHelperText(undefined);
    }
  }

  const validationResult = submitAnswerItemSchema.safeParse({
    actionId,
    type: ActionType.SUBJECTIVE,
    isRequired,
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

const FEEDBACK_MESSAGES: Record<number, string> = {
  1: "조금 더 구체적으로 적어주세요! 👀",
};
