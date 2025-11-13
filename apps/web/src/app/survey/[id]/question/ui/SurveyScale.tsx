import { SurveyLikertScale } from "@/app/survey/[id]/components/SurveyLikertScale";
import { QuestionStepContentProps } from "@/constants/surveyQuestion";
import type { SurveyAnswerItem } from "@/types/dto/survey";
import { useState } from "react";
import { SurveyQuestionTemplate } from "../components/SurveyQuestionTemplate";

export function SurveyScale({
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
  const { isScaleValueChanged, scaleValue, handleScaleValueChange } = useSurveyScaleValue(
    questionData.id,
    updateCanGoNext,
    onAnswerChange,
  );

  return (
    <SurveyQuestionTemplate
      currentOrder={currentOrder}
      totalQuestionCount={totalQuestionCount}
      title={questionData.title}
      description={questionData.description}
      imageUrl={questionData.imageUrl}
      isFirstQuestion={isFirstQuestion}
      isNextDisabled={!isScaleValueChanged}
      onPrevious={onPrevious}
      onNext={onNext}
      nextButtonText={nextButtonText}
    >
      <SurveyLikertScale value={scaleValue} onChange={handleScaleValueChange}>
        <SurveyLikertScale.Thumb value={scaleValue} />
      </SurveyLikertScale>
    </SurveyQuestionTemplate>
  );
}

const DEFAULT_SCALE_VALUE = 3;

function useSurveyScaleValue(
  questionId: string,
  updateCanGoNext?: (canGoNext: boolean) => void,
  onAnswerChange?: (answer: SurveyAnswerItem) => void,
) {
  const [isScaleValueChanged, setIsScaleValueChanged] = useState(false);
  const [scaleValue, setScaleValue] = useState(DEFAULT_SCALE_VALUE);

  const handleScaleValueChange = (value: number) => {
    if (!isScaleValueChanged) {
      setIsScaleValueChanged(true);
      updateCanGoNext?.(true);
    }
    setScaleValue(value);

    // 답변 변경 전달
    onAnswerChange?.({
      questionId,
      type: "SCALE",
      scaleValue: value,
    });
  };

  return { isScaleValueChanged, scaleValue, handleScaleValueChange };
}
