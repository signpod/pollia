"use client";

import { submitAnswerOnly } from "@/actions/action-answer";
import { toast } from "@/components/common/Toast";
import { ROUTES } from "@/constants/routes";
import { useReadMissionResponseForMission } from "@/hooks/mission-response";
import { useRecordActionResponse } from "@/hooks/tracking";
import { useAuth } from "@/hooks/user";
import { isAnswerSameAsSubmitted } from "@/lib/answer/compareAnswers";
import { removeSessionStorage } from "@/lib/sessionStorage";
import { clearActionSession, getOrCreateSessionId } from "@/lib/tracking";
import { submitAnswerItemSchema } from "@/schemas/action-answer";
import type { ActionAnswerItem, ActionDetail } from "@/types/dto";
import { useModal } from "@repo/ui/components";
import { useRouter } from "next/navigation";
import { useCallback, useState } from "react";

const SURVEY_SUBMIT_MODAL = {
  title: "완료할까요?",
  description: "제출 이후에는 답변을 수정할 수 없어요",
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
}

interface UseActionSubmitReturn {
  submit: () => Promise<void>;
  isSubmitting: boolean;
  isActualLastStep: boolean;
}

export function useActionSubmit({
  missionId,
  actionData,
  progressInfo,
  currentAnswer,
}: UseActionSubmitParams): UseActionSubmitReturn {
  const router = useRouter();
  const { showModal } = useModal();
  const { user } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { data: missionResponse } = useReadMissionResponseForMission({ missionId });
  const recordResponse = useRecordActionResponse();

  const toastStorageKey = `mission-toast-${missionId}`;
  const responseId = missionResponse?.data?.id ?? "";

  const handleAlreadyCompleted = useCallback(() => {
    toast.warning("이미 완료된 컨텐츠입니다", { id: "mission-already-completed" });
    router.push(ROUTES.MISSION(missionId));
  }, [missionId, router]);

  const isActualLastStep =
    !!currentAnswer?.nextCompletionId || progressInfo.currentOrder === progressInfo.totalCount;

  const navigateToNext = useCallback(
    (answer: ActionAnswerItem, isActualLast: boolean) => {
      if (isActualLast || answer.nextCompletionId) {
        removeSessionStorage(toastStorageKey);
        router.push(ROUTES.MISSION_DONE(missionId, answer.nextCompletionId));
      } else if (answer.nextActionId) {
        router.push(ROUTES.ACTION({ missionId, actionId: answer.nextActionId }));
      }
    },
    [missionId, router, toastStorageKey],
  );

  const executeSubmitAndNavigate = useCallback(
    async (answer: ActionAnswerItem, isActualLast: boolean) => {
      setIsSubmitting(true);

      // 성능 측정 시작
      sessionStorage.setItem("nav-start", Date.now().toString());

      try {
        // 1. 답변 저장 (서버)
        const result = await submitAnswerOnly({
          missionId,
          responseId,
          answer,
          isLastAction: isActualLast,
        });

        if (!result.success) {
          if (result.code === "ALREADY_COMPLETED") {
            handleAlreadyCompleted();
          } else {
            toast.warning(result.error || "답변 저장에 실패했습니다", {
              id: "submit-answer-error",
            });
          }
          setIsSubmitting(false);
          return;
        }

        // 2. 트래킹
        recordResponse({
          missionId,
          sessionId: getOrCreateSessionId(answer.actionId),
          userId: user?.id || undefined,
          actionId: answer.actionId,
          metadata: {
            actionType: answer.type,
            ...(isActualLast && { isFinalSubmit: true }),
          },
        });
        clearActionSession(answer.actionId);

        // 3. 클라이언트 네비게이션 (빠름!)
        navigateToNext(answer, isActualLast);
      } catch {
        setIsSubmitting(false);
      }
    },
    [missionId, responseId, handleAlreadyCompleted, recordResponse, user?.id, navigateToNext],
  );

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

    // 이미 저장된 답변이면 바로 이동 (서버 호출 없이)
    if (isSame) {
      // 성능 측정 시작
      sessionStorage.setItem("nav-start", Date.now().toString());

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
      navigateToNext(currentAnswer, isActualLast);
      return;
    }

    if (isActualLast) {
      showModal({
        ...SURVEY_SUBMIT_MODAL,
        showCancelButton: true,
        onConfirm: async () => {
          await executeSubmitAndNavigate(currentAnswer, isActualLast);
        },
      });
    } else {
      await executeSubmitAndNavigate(currentAnswer, isActualLast);
    }
  }, [
    progressInfo,
    currentAnswer,
    executeSubmitAndNavigate,
    showModal,
    actionData.id,
    missionId,
    recordResponse,
    user?.id,
    missionResponse?.data?.answers,
    navigateToNext,
  ]);

  return {
    submit,
    isSubmitting,
    isActualLastStep,
  };
}
