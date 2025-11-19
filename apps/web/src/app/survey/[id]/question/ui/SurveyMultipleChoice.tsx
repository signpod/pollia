import { QuestionStepContentProps } from "@/constants/surveyQuestion";
import { SurveyQuestionOptionButton } from "../../components/SurveyQuestionOptionButton";
import { SurveyQuestionTemplate } from "../components/SurveyQuestionTemplate";
import {
  SurveyMultipleChoiceProvider,
  useSurveyMultipleChoice,
} from "./SurveyMultipleChoiceProvider";

export function SurveyMultipleChoice({
  questionData,
  currentOrder,
  totalQuestionCount,
  isFirstQuestion,
  onPrevious,
  onNext,
  nextButtonText,
  updateCanGoNext,
  onAnswerChange,
  hasShownToastsRef,
}: QuestionStepContentProps) {
  return (
    <SurveyMultipleChoiceProvider
      maxSelections={questionData.maxSelections ?? 1}
      questionId={questionData.id}
      updateCanGoNext={updateCanGoNext}
      onAnswerChange={onAnswerChange}
    >
      <SurveyMultipleChoiceContent
        questionData={questionData}
        currentOrder={currentOrder}
        totalQuestionCount={totalQuestionCount}
        isFirstQuestion={isFirstQuestion}
        onPrevious={onPrevious}
        onNext={onNext}
        nextButtonText={nextButtonText}
        hasShownToastsRef={hasShownToastsRef}
      />
    </SurveyMultipleChoiceProvider>
  );
}

function SurveyMultipleChoiceContent({
  questionData,
  currentOrder,
  totalQuestionCount,
  isFirstQuestion,
  onPrevious,
  onNext,
  nextButtonText,
  hasShownToastsRef,
}: Omit<QuestionStepContentProps, "isNextDisabled" | "updateCanGoNext" | "onAnswerChange">) {
  const isMultipleChoice = !!questionData.maxSelections && questionData.maxSelections > 1;
  const { selectedIds, toggleSelectedId, canGoNext } = useSurveyMultipleChoice();

  return (
    <SurveyQuestionTemplate
      currentOrder={currentOrder}
      totalQuestionCount={totalQuestionCount}
      title={questionData.title}
      description={questionData.description ?? undefined}
      imageUrl={questionData.imageUrl ?? undefined}
      isFirstQuestion={isFirstQuestion}
      isNextDisabled={!canGoNext}
      onPrevious={onPrevious}
      onNext={onNext}
      nextButtonText={nextButtonText}
      hasShownToastsRef={hasShownToastsRef}
    >
      {questionData.options?.map(option => (
        <SurveyQuestionOptionButton
          key={option.id}
          selectType={isMultipleChoice ? "checkbox" : "radio"}
          imageUrl={option.imageUrl ?? undefined}
          title={option.title}
          description={option.description ?? undefined}
          isSelected={selectedIds.has(option.id)}
          onClick={() => toggleSelectedId(option.id)}
        />
      ))}
    </SurveyQuestionTemplate>
  );
}
