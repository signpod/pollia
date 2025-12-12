import { toast } from "@/components/common/Toast";
import { SURVEY_TOAST_MESSAGE } from "@/constants/missionMessages";
import {
  getSessionStorageJSON,
  setSessionStorageJSON,
} from "@/lib/sessionStorage";
import { useEffect } from "react";

interface UseMissionSurveyToastParams {
  currentOrder: number;
  totalActionCount: number;
  toastStorageKey: string;
}

export function useMissionSurveyToast({
  currentOrder,
  totalActionCount,
  toastStorageKey,
}: UseMissionSurveyToastParams) {
  const progressValue = ((currentOrder + 1) / totalActionCount) * 100 || 0;

  // currentOrder는 0부터 시작 (첫 번째 질문 = 0)
  const isFirstQuestion = currentOrder === 0;
  const isFinalQuestion = currentOrder === totalActionCount && totalActionCount > 1;
  const isHalfway = progressValue >= 50 && totalActionCount > 2;

  useEffect(() => {
    const toastState = getSessionStorageJSON(toastStorageKey, {
      first: false,
      half: false,
      final: false,
    });

    if (isFirstQuestion && !toastState.first) {
      setSessionStorageJSON(toastStorageKey, { ...toastState, first: true });
      toast.default(SURVEY_TOAST_MESSAGE.first.message, {
        id: SURVEY_TOAST_MESSAGE.first.id,
        duration: 4000,
      });
    }

    if (isFinalQuestion && !toastState.final) {
      setSessionStorageJSON(toastStorageKey, { ...toastState, final: true });
      toast.default(SURVEY_TOAST_MESSAGE.final.message, {
        id: SURVEY_TOAST_MESSAGE.final.id,
        duration: 4000,
      });
    }

    if (isHalfway && !toastState.half) {
      setSessionStorageJSON(toastStorageKey, { ...toastState, half: true });
      toast.default(SURVEY_TOAST_MESSAGE.half.message, {
        id: SURVEY_TOAST_MESSAGE.half.id,
        duration: 4000,
      });
    }
  }, [isFirstQuestion, isFinalQuestion, isHalfway, toastStorageKey]);
}

