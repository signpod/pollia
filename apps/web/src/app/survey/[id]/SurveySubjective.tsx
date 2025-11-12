import { subjectiveResponseSchema } from "@/schemas/survey/question/response/subjectiveResponseSchema";
import { Textarea } from "@repo/ui/components";
import { useState } from "react";
import { SurveyQuestionLayout } from "./components/SurveyQuestionLayout";

const mockData = {
  questionId: "1",
  title: "설문조사 제목입니다. 최대 20자까지 가능합니다.",
  description: "설문조사 설명입니다. 최대 100자까지 가능합니다.",
  imageUrl: "https://images.unsplash.com/photo-1484480974693-6ca0a78fb36b?w=800&h=400&fit=crop",
  order: 2,
  totalQuestionCount: 10,
};

const PLACEHOLDER = "답변을 입력해주세요";

export function SurveySubjective() {
  const {
    subjectiveValue,
    handleSubjectiveValueChange,
    handleBlur,
    feedbackMessage,
    validationResult,
    showError,
  } = useSurveySubjectiveValue();
  const { title, description, imageUrl, order, totalQuestionCount } = mockData;
  const isFirstQuestion = order === 1;
  const isNextDisabled = !validationResult.success;
  const errorMessage = showError ? validationResult.error?.issues[0]?.message : undefined;

  return (
    <SurveyQuestionLayout
      currentOrder={order}
      totalQuestionCount={totalQuestionCount}
      title={title}
      description={description}
      imageUrl={imageUrl}
      isFirstQuestion={isFirstQuestion}
      isNextDisabled={isNextDisabled}
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
    </SurveyQuestionLayout>
  );
}

function useSurveySubjectiveValue() {
  const { questionId } = mockData;
  const [subjectiveValue, setSubjectiveValue] = useState("");
  const [showError, setShowError] = useState(false);

  function handleSubjectiveValueChange(e: React.ChangeEvent<HTMLTextAreaElement>) {
    setSubjectiveValue(e.target.value);
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
