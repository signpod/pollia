import { ActionType } from "@/types/domain/action";
import type { ActionAnswerItem, GetMissionResponseResponse } from "@/types/dto";
import { useEffect, useMemo, useRef, useState } from "react";

interface UseMissionScaleValueOptions {
  actionId: string;
  missionResponse?: GetMissionResponseResponse;
  updateCanGoNext?: (canGoNext: boolean) => void;
  onAnswerChange?: (answer: ActionAnswerItem) => void;
  defaultValue: number;
}

export function useMissionScaleValue({
  actionId,
  missionResponse,
  updateCanGoNext,
  onAnswerChange,
  defaultValue,
}: UseMissionScaleValueOptions) {
  const initialScaleValue = useMemo(() => {
    if (!missionResponse?.data?.answers || missionResponse.data.answers.length === 0) {
      return defaultValue;
    }

    const questionAnswer = missionResponse.data.answers.find(
      answer => answer.actionId === actionId && answer.scaleAnswer !== null,
    );

    return questionAnswer?.scaleAnswer ?? defaultValue;
  }, [missionResponse, actionId, defaultValue]);

  const [isScaleValueChanged, setIsScaleValueChanged] = useState(false);
  const [scaleValue, setScaleValue] = useState(initialScaleValue);

  const updateCanGoNextRef = useRef(updateCanGoNext);
  const onAnswerChangeRef = useRef(onAnswerChange);

  useEffect(() => {
    updateCanGoNextRef.current = updateCanGoNext;
    onAnswerChangeRef.current = onAnswerChange;
  }, [updateCanGoNext, onAnswerChange]);

  useEffect(() => {
    setScaleValue(initialScaleValue);
    if (initialScaleValue !== defaultValue) {
      setIsScaleValueChanged(true);
      updateCanGoNextRef.current?.(true);

      onAnswerChangeRef.current?.({
        actionId,
        type: ActionType.SCALE,
        scaleValue: initialScaleValue,
      });
    }
  }, [initialScaleValue, actionId, defaultValue]);

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
