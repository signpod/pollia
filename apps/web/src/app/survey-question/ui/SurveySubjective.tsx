import { QuestionStepContentProps } from "@/constants/surveyQuestion";
// TODO: @/schemas_legacy는 deprecated. 새로운 @/schemas/{domain}/ 스키마로 교체 필요
import { subjectiveResponseSchema } from "@/schemas_legacy/survey/question/response/subjectiveResponseSchema";
import type { GetSurveyResponseResponse, SurveyAnswerItem } from "@/types/dto";
import { Textarea } from "@repo/ui/components";
import { useEffect, useMemo, useRef, useState } from "react";
import { SurveyQuestionTemplate } from "../[id]/components/SurveyQuestionTemplate";

const PLACEHOLDER = "답변을 입력해주세요";

export function SurveySubjective({
  questionData,
  currentOrder,
  totalQuestionCount,
  isFirstQuestion,
  onPrevious,
  onNext,
  nextButtonText,
  updateCanGoNext,
  onAnswerChange,
  surveyResponse,
}: QuestionStepContentProps) {
  const {
    subjectiveValue,
    handleSubjectiveValueChange,
    handleBlur,
    feedbackMessage,
    validationResult,
    showError,
  } = useSurveySubjectiveValue(questionData.id, surveyResponse, updateCanGoNext, onAnswerChange);

  const isNextDisabled = !validationResult.success;
  const errorMessage = showError ? validationResult.error?.issues[0]?.message : undefined;

  return (
    <SurveyQuestionTemplate
      currentOrder={currentOrder}
      totalQuestionCount={totalQuestionCount}
      title={questionData.title}
      description={questionData.description ?? undefined}
      imageUrl={questionData.imageUrl ?? undefined}
      isFirstQuestion={isFirstQuestion}
      isNextDisabled={isNextDisabled}
      onPrevious={onPrevious}
      onNext={onNext}
      nextButtonText={nextButtonText}
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
        helperText={feedbackMessage}
        errorMessage={errorMessage}
      />
    </SurveyQuestionTemplate>
  );
}

function useSurveySubjectiveValue(
  questionId: string,
  surveyResponse?: GetSurveyResponseResponse,
  updateCanGoNext?: (canGoNext: boolean) => void,
  onAnswerChange?: (answer: SurveyAnswerItem) => void,
) {
  const initialTextValue = useMemo(() => {
    if (!surveyResponse?.data?.answers || surveyResponse.data.answers.length === 0) {
      return "";
    }

    const questionAnswer = surveyResponse.data.answers.find(
      answer => answer.questionId === questionId && answer.textAnswer !== null,
    );

    return questionAnswer?.textAnswer ?? "";
  }, [surveyResponse, questionId]);

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
      const result = subjectiveResponseSchema.safeParse({
        questionId,
        textResponse: initialTextValue,
      });
      updateCanGoNextRef.current?.(result.success);

      if (result.success) {
        onAnswerChangeRef.current?.({
          questionId,
          type: "SUBJECTIVE",
          textResponse: initialTextValue,
        });
      }
    }
  }, [initialTextValue, questionId]);

  function handleSubjectiveValueChange(e: React.ChangeEvent<HTMLTextAreaElement>) {
    const value = e.target.value;
    setSubjectiveValue(value);

    const result = subjectiveResponseSchema.safeParse({
      questionId,
      textResponse: value,
    });
    updateCanGoNext?.(result.success);

    if (value.trim()) {
      onAnswerChange?.({
        questionId,
        type: "SUBJECTIVE",
        textResponse: value,
      });
    }
  }

  function handleBlur() {
    setShowError(true);
  }

  const feedbackMessage =
    FEEDBACK_MESSAGES[Math.min(subjectiveValue.length, MAX_FEEDBACK_MESSAGE_LENGTH)];

  const validationResult = subjectiveResponseSchema.safeParse({
    questionId,
    textResponse: subjectiveValue,
  });

  return {
    subjectiveValue,
    handleSubjectiveValueChange,
    handleBlur,
    feedbackMessage,
    validationResult,
    showError,
  };
}

const MAX_FEEDBACK_MESSAGE_LENGTH = 2;

const FEEDBACK_MESSAGES: Record<number, string> = {
  1: "앗! 혹시 답변하기 곤란하신가요 😔",
  2: "답변하신 내용이 큰 도움이 되고 있어요! 🫡",
};
