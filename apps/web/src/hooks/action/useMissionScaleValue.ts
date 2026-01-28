import { ActionType } from "@/types/domain/action";
import type { ActionAnswerItem, GetMissionResponseResponse } from "@/types/dto";
import { useEffect, useMemo, useRef, useState } from "react";

interface UseMissionScaleValueOptions {
  actionId: string;
  isRequired: boolean;
  missionResponse?: GetMissionResponseResponse;
  updateCanGoNext?: (canGoNext: boolean) => void;
  onAnswerChange?: (answer: ActionAnswerItem) => void;
  defaultValue: number;
  nextActionId?: string | null;
  nextCompletionId?: string | null;
}

export function useMissionScaleValue({
  actionId,
  isRequired,
  missionResponse,
  updateCanGoNext,
  onAnswerChange,
  defaultValue,
  nextActionId,
  nextCompletionId,
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
  const [scaleValue, setScaleValue] = useState(defaultValue);

  const updateCanGoNextRef = useRef(updateCanGoNext);
  const onAnswerChangeRef = useRef(onAnswerChange);

  useEffect(() => {
    updateCanGoNextRef.current = updateCanGoNext;
    onAnswerChangeRef.current = onAnswerChange;
  }, [updateCanGoNext, onAnswerChange]);

  useEffect(() => {
    setScaleValue(initialScaleValue);
    updateCanGoNextRef.current?.(true);

    if (initialScaleValue !== defaultValue) {
      setIsScaleValueChanged(true);
    }

    onAnswerChangeRef.current?.({
      actionId,
      type: ActionType.SCALE,
      isRequired,
      scaleValue: initialScaleValue,
      ...(nextActionId && { nextActionId }),
      ...(nextCompletionId && { nextCompletionId }),
    });
  }, [initialScaleValue, actionId, defaultValue, isRequired, nextActionId, nextCompletionId]);

  const handleScaleValueChange = (value: number) => {
    if (!isScaleValueChanged) {
      setIsScaleValueChanged(true);
      updateCanGoNext?.(true);
    }
    setScaleValue(value);

    onAnswerChange?.({
      actionId,
      type: ActionType.SCALE,
      isRequired,
      scaleValue: value,
      ...(nextActionId && { nextActionId }),
      ...(nextCompletionId && { nextCompletionId }),
    });
  };

  return { isScaleValueChanged, scaleValue, handleScaleValueChange };
}
