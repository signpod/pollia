"use client";

import { toast } from "@/components/common/Toast";
import { MISSION_TOAST_MESSAGE } from "@/constants/missionMessages";
import { ROUTES } from "@/constants/routes";
import {
  useCompleteMission,
  useReadMissionResponseForMission,
  useSubmitQuestionAnswer,
} from "@/hooks/mission-response";
import { useRecordActionResponse } from "@/hooks/tracking";
import { useAuth } from "@/hooks/user";
import { isAnswerSameAsSubmitted } from "@/lib/answer/compareAnswers";
import { removeSessionStorage } from "@/lib/sessionStorage";
import { clearActionSession, getOrCreateSessionId } from "@/lib/tracking";
import { submitAnswerItemSchema } from "@/schemas/action-answer";
import type { ActionAnswerItem, ActionDetail } from "@/types/dto";
import { useModal } from "@repo/ui/components";
import { useRouter } from "next/navigation";
import { useCallback, useRef } from "react";

const SURVEY_SUBMIT_MODAL = {
  title: "미션을 최종적으로 제출할까요?",
  description: "제출 이후에는 답변을 수정하거나\n다시 참여할 수 없어요",
  confirmText: "제출하기",
  cancelText: "취소",
} as const;

interface ProgressInfo {
  currentOrder: number;
  totalCount: number;
}

interface UseActionSubmitParams {
  missionId: string;
  actionData: ActionDetail;
  progressInfo: ProgressInfo;
  currentAnswer: ActionAnswerItem | null;
  goNext: (nextActionId?: string) => void;
}

interface UseActionSubmitReturn {
  submit: () => Promise<void>;
  isSubmitting: boolean;
  isCompleting: boolean;
  isActualLastStep: boolean;
}

export function useActionSubmit({
  missionId,
  actionData,
  progressInfo,
  currentAnswer,
  goNext,
}: UseActionSubmitParams): UseActionSubmitReturn {
  const router = useRouter();
  const { showModal } = useModal();
  const { user } = useAuth();
  const isFinalSubmitRef = useRef(false);

  const { data: missionResponse } = useReadMissionResponseForMission({ missionId });
  const recordResponse = useRecordActionResponse();

  const toastStorageKey = `mission-toast-${missionId}`;
  const responseId = missionResponse?.data?.id ?? "";

  const handleAlreadyCompleted = useCallback(() => {
    toast.warning("이미 완료된 미션입니다", { id: "mission-already-completed" });
    router.push(ROUTES.MISSION(missionId));
  }, [missionId, router]);

  const { mutateAsync: submitAnswer, isPending: isSubmittingAnswer } = useSubmitQuestionAnswer({
    onSuccess: async () => {
      if (currentAnswer) {
        recordResponse({
          missionId,
          sessionId: getOrCreateSessionId(currentAnswer.actionId),
          userId: user?.id || undefined,
          actionId: currentAnswer.actionId,
          metadata: {
            actionType: currentAnswer.type,
            ...(isFinalSubmitRef.current && { isFinalSubmit: true }),
          },
        });
        clearActionSession(currentAnswer.actionId);
      }

      if (isFinalSubmitRef.current) {
        return;
      }

      goNext(currentAnswer?.nextActionId);
    },
    onError: () => {
      toast.warning("답변 저장에 실패했습니다", { id: "submit-answer-error" });
    },
    onAlreadyCompleted: handleAlreadyCompleted,
    missionId,
  });

  const { mutateAsync: completeMissionAsync, isPending: isCompletingMission } = useCompleteMission({
    onError: () => {
      toast.warning(MISSION_TOAST_MESSAGE.error.message, { id: MISSION_TOAST_MESSAGE.error.id });
    },
    onAlreadyCompleted: handleAlreadyCompleted,
    missionId,
  });

  const handleCompleteMission = useCallback(
    async (completionId?: string) => {
      await completeMissionAsync({ responseId });
      removeSessionStorage(toastStorageKey);
      router.push(ROUTES.MISSION_DONE(missionId, completionId));
    },
    [completeMissionAsync, missionId, router, toastStorageKey, responseId],
  );

  const isActualLastStep =
    !!currentAnswer?.nextCompletionId || progressInfo.currentOrder === progressInfo.totalCount;

  const submit = useCallback(async () => {
    if (!currentAnswer) return;

    if (currentAnswer.actionId !== actionData.id) {
      toast.warning("답변을 다시 입력해주세요", { id: "answer-mismatch-error" });
      return;
    }

    const validationResult = submitAnswerItemSchema.safeParse(currentAnswer);
    if (!validationResult.success) {
      const errorMessage =
        validationResult.error.issues[0]?.message || "답변 형식이 올바르지 않습니다";
      toast.warning(errorMessage, { id: "answer-validation-error" });
      return;
    }

    const submittedAnswers = missionResponse?.data?.answers ?? [];
    const isSame = isAnswerSameAsSubmitted(currentAnswer, submittedAnswers);

    const isActualLast =
      !!currentAnswer?.nextCompletionId || progressInfo.currentOrder === progressInfo.totalCount;

    if (isSame) {
      recordResponse({
        missionId,
        sessionId: getOrCreateSessionId(currentAnswer.actionId),
        userId: user?.id || undefined,
        actionId: currentAnswer.actionId,
        metadata: {
          actionType: currentAnswer.type,
          isFinalSubmit: isActualLast,
        },
      });
      clearActionSession(currentAnswer.actionId);

      if (currentAnswer?.nextCompletionId) {
        handleCompleteMission(currentAnswer.nextCompletionId);
        return;
      }

      goNext(currentAnswer?.nextActionId);
      return;
    }

    const nextCompletionIdForSubmit = currentAnswer?.nextCompletionId;

    if (isActualLast) {
      showModal({
        ...SURVEY_SUBMIT_MODAL,
        showCancelButton: true,
        onConfirm: async () => {
          isFinalSubmitRef.current = true;
          try {
            await submitAnswer({ responseId, answer: currentAnswer });
            await handleCompleteMission(nextCompletionIdForSubmit);
          } finally {
            isFinalSubmitRef.current = false;
          }
        },
      });
    } else {
      await submitAnswer({
        responseId,
        answer: currentAnswer,
      });
    }
  }, [
    progressInfo,
    responseId,
    currentAnswer,
    submitAnswer,
    handleCompleteMission,
    showModal,
    goNext,
    actionData.id,
    missionId,
    recordResponse,
    user?.id,
    missionResponse?.data?.answers,
  ]);

  return {
    submit,
    isSubmitting: isSubmittingAnswer,
    isCompleting: isCompletingMission,
    isActualLastStep,
  };
}
