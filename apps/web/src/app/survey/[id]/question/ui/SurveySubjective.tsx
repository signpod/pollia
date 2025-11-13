import { QuestionStepContentProps } from "@/constants/surveyQuestion";
import { subjectiveResponseSchema } from "@/schemas/survey/question/response/subjectiveResponseSchema";
import { Textarea } from "@repo/ui/components";
import { useState } from "react";
import { SurveyQuestionTemplate } from "../components/SurveyQuestionTemplate";

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
}: QuestionStepContentProps) {
  const {
    subjectiveValue,
    handleSubjectiveValueChange,
    handleBlur,
    feedbackMessage,
    validationResult,
    showError,
  } = useSurveySubjectiveValue(questionData.id, updateCanGoNext, onAnswerChange);

  const isNextDisabled = !validationResult.success;
  const errorMessage = showError ? validationResult.error?.issues[0]?.message : undefined;

  return (
    <SurveyQuestionTemplate
      currentOrder={currentOrder}
      totalQuestionCount={totalQuestionCount}
      title={questionData.title}
      description={questionData.description}
      imageUrl={questionData.imageUrl}
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
  updateCanGoNext?: (canGoNext: boolean) => void,
  onAnswerChange?: (answer: import("@/types/dto/survey").SurveyAnswerItem) => void,
) {
  const [subjectiveValue, setSubjectiveValue] = useState("");
  const [showError, setShowError] = useState(false);

  function handleSubjectiveValueChange(e: React.ChangeEvent<HTMLTextAreaElement>) {
    const value = e.target.value;
    setSubjectiveValue(value);

    const result = subjectiveResponseSchema.safeParse({
      questionId,
      textResponse: value,
    });
    updateCanGoNext?.(result.success);

    // 답변 변경 전달
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
