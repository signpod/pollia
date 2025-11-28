import { SurveyLikertScale } from "@/app/survey/[id]/components/SurveyLikertScale";
import { QuestionStepContentProps } from "@/constants/surveyQuestion";
import { useReadSurveyResponseForSurvey } from "@/hooks/survey-response";
import type { SurveyAnswerItem } from "@/types/dto";
import { useEffect, useMemo, useState } from "react";
import { SurveyQuestionTemplate } from "../[id]/components/SurveyQuestionTemplate";

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
  hasShownToastsRef,
}: QuestionStepContentProps) {
  const { isScaleValueChanged, scaleValue, handleScaleValueChange } = useSurveyScaleValue(
    questionData.id,
    questionData.surveyId,
    updateCanGoNext,
    onAnswerChange,
  );

  return (
    <SurveyQuestionTemplate
      currentOrder={currentOrder}
      totalQuestionCount={totalQuestionCount}
      title={questionData.title}
      description={questionData.description ?? undefined}
      imageUrl={questionData.imageUrl ?? undefined}
      isFirstQuestion={isFirstQuestion}
      isNextDisabled={!isScaleValueChanged}
      onPrevious={onPrevious}
      onNext={onNext}
      nextButtonText={nextButtonText}
      hasShownToastsRef={hasShownToastsRef}
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
  surveyId: string | null,
  updateCanGoNext?: (canGoNext: boolean) => void,
  onAnswerChange?: (answer: SurveyAnswerItem) => void,
) {
  const { data: responseData } = useReadSurveyResponseForSurvey({
    surveyId: surveyId || "",
  });

  const initialScaleValue = useMemo(() => {
    if (!surveyId || !responseData?.data?.answers || responseData.data.answers.length === 0) {
      return DEFAULT_SCALE_VALUE;
    }

    const questionAnswer = responseData.data.answers.find(
      answer => answer.questionId === questionId && answer.scaleAnswer !== null,
    );

    return questionAnswer?.scaleAnswer ?? DEFAULT_SCALE_VALUE;
  }, [surveyId, responseData, questionId]);

  const [isScaleValueChanged, setIsScaleValueChanged] = useState(false);
  const [scaleValue, setScaleValue] = useState(initialScaleValue);

  useEffect(() => {
    setScaleValue(initialScaleValue);
    if (initialScaleValue !== DEFAULT_SCALE_VALUE) {
      setIsScaleValueChanged(true);
      updateCanGoNext?.(true);

      onAnswerChange?.({
        questionId,
        type: "SCALE",
        scaleValue: initialScaleValue,
      });
    }
  }, [initialScaleValue, questionId, updateCanGoNext, onAnswerChange]);

  const handleScaleValueChange = (value: number) => {
    if (!isScaleValueChanged) {
      setIsScaleValueChanged(true);
      updateCanGoNext?.(true);
    }
    setScaleValue(value);

    onAnswerChange?.({
      questionId,
      type: "SCALE",
      scaleValue: value,
    });
  };

  return { isScaleValueChanged, scaleValue, handleScaleValueChange };
}
