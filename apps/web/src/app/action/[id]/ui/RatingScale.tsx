import { ActionStepContentProps } from "@/constants/action";
import { ActionType } from "@/types/domain/action";
import type { ActionAnswerItem, GetMissionResponseResponse } from "@/types/dto";
import { RatingScale } from "@repo/ui/components";
import { useEffect, useMemo, useRef, useState } from "react";
import { SurveyQuestionTemplate } from "../components/ActionTemplate";

export function MissionRatingScale({
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
}: ActionStepContentProps) {
  const { isScaleValueChanged, scaleValue, handleScaleValueChange } = useMissionRatingScaleValue(
    actionData.id,
    missionResponse,
    updateCanGoNext,
    onAnswerChange,
  );

  const imageUrl = actionData.imageUrl ?? undefined;

  return (
    <SurveyQuestionTemplate
      currentOrder={currentOrder}
      totalActionCount={totalActionCount}
      title={actionData.title}
      description={actionData.description ?? undefined}
      imageUrl={actionData.imageUrl ?? undefined}
      isFirstAction={isFirstAction}
      isNextDisabled={isNextDisabledProp || !isScaleValueChanged}
      onPrevious={onPrevious}
      onNext={onNext}
      nextButtonText={nextButtonText}
    >
      <RatingScale
        value={scaleValue}
        onChange={handleScaleValueChange}
        className={imageUrl ? "" : "pt-6"}
      />
    </SurveyQuestionTemplate>
  );
}

const DEFAULT_RATING_SCALE_VALUE = 3;

function useMissionRatingScaleValue(
  actionId: string,
  missionResponse?: GetMissionResponseResponse,
  updateCanGoNext?: (canGoNext: boolean) => void,
  onAnswerChange?: (answer: ActionAnswerItem) => void,
) {
  const initialScaleValue = useMemo(() => {
    if (!missionResponse?.data?.answers || missionResponse.data.answers.length === 0) {
      return DEFAULT_RATING_SCALE_VALUE;
    }

    const questionAnswer = missionResponse.data.answers.find(
      answer => answer.actionId === actionId && answer.scaleAnswer !== null,
    );

    return questionAnswer?.scaleAnswer ?? DEFAULT_RATING_SCALE_VALUE;
  }, [missionResponse, actionId]);

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
    if (initialScaleValue !== DEFAULT_RATING_SCALE_VALUE) {
      setIsScaleValueChanged(true);
      updateCanGoNextRef.current?.(true);

      onAnswerChangeRef.current?.({
        actionId,
        type: ActionType.SCALE,
        scaleValue: initialScaleValue,
      });
    }
  }, [initialScaleValue, actionId]);

  const handleScaleValueChange = (value: number) => {
    if (!isScaleValueChanged) {
      setIsScaleValueChanged(true);
      updateCanGoNext?.(true);
    }
    setScaleValue(value);

    onAnswerChange?.({
      actionId,
      type: ActionType.SCALE,
      scaleValue: value,
    });
  };

  return { isScaleValueChanged, scaleValue, handleScaleValueChange };
}
