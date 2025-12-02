import { SurveyLikertScale } from "@/app/survey/[id]/components/SurveyLikertScale";
import { QuestionStepContentProps } from "@/constants/surveyQuestion";
import type { GetSurveyResponseResponse, SurveyAnswerItem } from "@/types/dto";
import { useEffect, useMemo, useRef, useState } from "react";
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
  surveyResponse,
}: QuestionStepContentProps) {
  const { isScaleValueChanged, scaleValue, handleScaleValueChange } = useSurveyScaleValue(
    questionData.id,
    surveyResponse,
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
  surveyResponse?: GetSurveyResponseResponse,
  updateCanGoNext?: (canGoNext: boolean) => void,
  onAnswerChange?: (answer: SurveyAnswerItem) => void,
) {
  const initialScaleValue = useMemo(() => {
    if (!surveyResponse?.data?.answers || surveyResponse.data.answers.length === 0) {
      return DEFAULT_SCALE_VALUE;
    }

    const questionAnswer = surveyResponse.data.answers.find(
      answer => answer.questionId === questionId && answer.scaleAnswer !== null,
    );

    return questionAnswer?.scaleAnswer ?? DEFAULT_SCALE_VALUE;
  }, [surveyResponse, questionId]);

  const [isScaleValueChanged, setIsScaleValueChanged] = useState(false);
  const [scaleValue, setScaleValue] = useState(initialScaleValue);

  // updateCanGoNext와 onAnswerChange ref로 최신 참조 유지
  const updateCanGoNextRef = useRef(updateCanGoNext);
  const onAnswerChangeRef = useRef(onAnswerChange);

  useEffect(() => {
    updateCanGoNextRef.current = updateCanGoNext;
    onAnswerChangeRef.current = onAnswerChange;
  }, [updateCanGoNext, onAnswerChange]);

  useEffect(() => {
    setScaleValue(initialScaleValue);
    if (initialScaleValue !== DEFAULT_SCALE_VALUE) {
      setIsScaleValueChanged(true);
      updateCanGoNextRef.current?.(true);

      onAnswerChangeRef.current?.({
        questionId,
        type: "SCALE",
        scaleValue: initialScaleValue,
      });
    }
  }, [initialScaleValue, questionId]);

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
