import { SurveyQuestionOptionButton } from "@/app/survey/[id]/components";
import { QuestionStepContentProps } from "@/constants/surveyQuestion";
import { SurveyQuestionTemplate } from "../[id]/components/SurveyQuestionTemplate";
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
  surveyResponse,
}: QuestionStepContentProps) {
  return (
    <SurveyMultipleChoiceProvider
      maxSelections={questionData.maxSelections ?? 1}
      questionId={questionData.id}
      surveyResponse={surveyResponse}
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
    >
      <div className="flex flex-col gap-2 w-full">
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
      </div>
    </SurveyQuestionTemplate>
  );
}
