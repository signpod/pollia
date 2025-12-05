import { MissionLikertScale } from "@/app/mission/[id]/components/MissionLikertScale";
import { ActionStepContentProps } from "@/constants/action";
import { ActionType } from "@/types/domain/action";
import type { ActionAnswerItem, GetMissionResponseResponse } from "@/types/dto";
import { useEffect, useMemo, useRef, useState } from "react";
import { SurveyQuestionTemplate } from "../components/ActionTemplate";

export function Scale({
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
  const { isScaleValueChanged, scaleValue, handleScaleValueChange } = useSurveyScaleValue(
    actionData.id,
    missionResponse,
    updateCanGoNext,
    onAnswerChange,
  );

  // 다른 페이지에서 스크롤된 상태로 이 페이지로 이동할 경우,
  // Tooltip의 위치 계산(getBoundingClientRect)이 잘못된 스크롤 위치를 기준으로 수행되어
  // tooltip이 잘못된 위치에 렌더링되는 문제를 방지하기 위해 스크롤을 맨 위로 초기화
  // biome-ignore lint/correctness/useExhaustiveDependencies: actionData.id 변경 시에만 스크롤 초기화 필요
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [actionData.id]);

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
      <MissionLikertScale value={scaleValue} onChange={handleScaleValueChange}>
        <MissionLikertScale.Thumb value={scaleValue} />
      </MissionLikertScale>
    </SurveyQuestionTemplate>
  );
}

const DEFAULT_SCALE_VALUE = 3;

function useSurveyScaleValue(
  actionId: string,
  missionResponse?: GetMissionResponseResponse,
  updateCanGoNext?: (canGoNext: boolean) => void,
  onAnswerChange?: (answer: ActionAnswerItem) => void,
) {
  const initialScaleValue = useMemo(() => {
    if (!missionResponse?.data?.answers || missionResponse.data.answers.length === 0) {
      return DEFAULT_SCALE_VALUE;
    }

    const questionAnswer = missionResponse.data.answers.find(
      answer => answer.actionId === actionId && answer.scaleAnswer !== null,
    );

    return questionAnswer?.scaleAnswer ?? DEFAULT_SCALE_VALUE;
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
    if (initialScaleValue !== DEFAULT_SCALE_VALUE) {
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
