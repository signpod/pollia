"use client";

import { submitAnswerOnly } from "@/actions/action-answer";
import { toast } from "@/components/common/Toast";
import { missionQueryKeys } from "@/constants/queryKeys/missionQueryKeys";
import { useReadMissionResponseForMission } from "@/hooks/mission-response";
import { useRecordActionResponse } from "@/hooks/tracking";
import { useAuth } from "@/hooks/user";
import { isAnswerSameAsSubmitted } from "@/lib/answer/compareAnswers";
import { removeSessionStorage } from "@/lib/sessionStorage";
import { clearActionSession, getOrCreateSessionId } from "@/lib/tracking";
import { submitAnswerItemSchema } from "@/schemas/action-answer";
import type { ActionForProgress } from "@/hooks/action";
import type { ActionAnswerItem, ActionDetail, GetMissionResponseResponse } from "@/types/dto";
import { useModal } from "@repo/ui/components";
import { useQueryClient } from "@tanstack/react-query";
import { useCallback, useRef, useState } from "react";

const SURVEY_SUBMIT_MODAL = {
  title: "미션을 최종적으로 제출할까요?",
  description: "제출 이후에는 답변을 수정하거나\n다시 참여할 수 없어요",
  confirmText: "제출하기",
  cancelText: "취소",
} as const;

function buildCacheAnswerEntry(answer: ActionAnswerItem, actionData: ActionDetail) {
  const base = {
    actionId: answer.actionId,
    action: {
      id: answer.actionId,
      type: answer.type,
      isRequired: answer.isRequired,
    },
    options: [] as { id: string; nextActionId?: string | null; nextCompletionId?: string | null }[],
    textAnswer: null as string | null,
    scaleAnswer: null as number | null,
    dateAnswers: [] as Date[],
    fileUploads: [] as { id: string }[],
    nextActionId: answer.nextActionId ?? actionData.nextActionId ?? null,
    nextCompletionId: answer.nextCompletionId ?? actionData.nextCompletionId ?? null,
  };

  if ("selectedOptionIds" in answer && answer.selectedOptionIds) {
    base.options = answer.selectedOptionIds.map(id => {
      const actionOption = actionData.options?.find(opt => opt.id === id);
      return {
        id,
        nextActionId: actionOption?.nextActionId ?? null,
        nextCompletionId: actionOption?.nextCompletionId ?? null,
      };
    });
  }
  if ("textAnswer" in answer && answer.textAnswer) {
    base.textAnswer = answer.textAnswer;
  }
  if ("scaleValue" in answer && answer.scaleValue !== undefined) {
    base.scaleAnswer = answer.scaleValue;
  }
  if ("dateAnswers" in answer && answer.dateAnswers) {
    base.dateAnswers = answer.dateAnswers.map(d => new Date(d));
  }
  if ("fileUploadIds" in answer && answer.fileUploadIds) {
    base.fileUploads = answer.fileUploadIds.map(id => ({ id }));
  }

  return base;
}

interface ProgressInfo {
  currentOrder: number;
  totalCount: number;
}

interface UseClientActionSubmitParams {
  missionId: string;
  actionData: ActionDetail;
  actions: ActionForProgress[];
  progressInfo: ProgressInfo;
  currentAnswer: ActionAnswerItem | null;
  navigateToAction: (actionId: string) => void;
  navigateToDone: (completionId?: string) => void;
  navigateToMission: () => void;
}

interface UseClientActionSubmitReturn {
  submit: () => Promise<void>;
  isSubmitting: boolean;
  isActualLastStep: boolean;
}

type CacheData = GetMissionResponseResponse | { data: null };

// 진행 중인 제출을 추적하는 전역 Set (컴포넌트 간 공유)
const pendingSubmissions = new Set<string>();

function findNextActionByOrder(currentAction: ActionForProgress, actions: ActionForProgress[]): string | null {
  const currentOrder = currentAction.order ?? 0;
  const nextAction = actions.find(a => (a.order ?? 0) === currentOrder + 1);
  return nextAction?.id ?? null;
}

export function useClientActionSubmit({
  missionId,
  actionData,
  actions,
  progressInfo,
  currentAnswer,
  navigateToAction,
  navigateToDone,
  navigateToMission,
}: UseClientActionSubmitParams): UseClientActionSubmitReturn {
  const queryClient = useQueryClient();
  const { showModal } = useModal();
  const { user } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const previousCacheRef = useRef<CacheData | undefined>(undefined);

  const { data: missionResponse } = useReadMissionResponseForMission({ missionId });
  const recordResponse = useRecordActionResponse();

  const toastStorageKey = `mission-toast-${missionId}`;
  const responseId = missionResponse?.data?.id ?? "";
  const queryKey = missionQueryKeys.missionResponseForMission(missionId);

  const handleAlreadyCompleted = useCallback(() => {
    toast.warning("이미 완료된 미션입니다", { id: "mission-already-completed" });
    navigateToMission();
  }, [navigateToMission]);

  const updateCacheOptimistically = useCallback(
    (answer: ActionAnswerItem) => {
      previousCacheRef.current = queryClient.getQueryData<CacheData>(queryKey);

      queryClient.setQueryData<CacheData>(queryKey, oldData => {
        if (!oldData?.data) return oldData;

        const existingIndex = oldData.data.answers.findIndex(a => a.actionId === answer.actionId);
        const newAnswerEntry = buildCacheAnswerEntry(answer, actionData);

        const updatedAnswers =
          existingIndex >= 0
            ? oldData.data.answers.map((a, i) => {
                if (i !== existingIndex) return a;
                // 기존 답변 업데이트 시 action 객체는 보존
                const { action: _, ...updateFields } = newAnswerEntry;
                return { ...a, ...updateFields };
              })
            : [
                ...oldData.data.answers,
                newAnswerEntry as unknown as (typeof oldData.data.answers)[number],
              ];

        return {
          data: {
            ...oldData.data,
            answers: updatedAnswers,
          },
        } as GetMissionResponseResponse;
      });
    },
    [queryClient, queryKey, actionData],
  );

  const rollbackCache = useCallback(() => {
    if (previousCacheRef.current !== undefined) {
      queryClient.setQueryData<CacheData>(queryKey, previousCacheRef.current);
      previousCacheRef.current = undefined;
    }
  }, [queryClient, queryKey]);

  const isActualLastStep =
    !!currentAnswer?.nextCompletionId || progressInfo.currentOrder === progressInfo.totalCount;

  const navigateToNext = useCallback(
    (answer: ActionAnswerItem, isActualLast: boolean) => {
      if (isActualLast || answer.nextCompletionId) {
        removeSessionStorage(toastStorageKey);
        navigateToDone(answer.nextCompletionId);
      } else if (answer.nextActionId) {
        navigateToAction(answer.nextActionId);
      } else {
        const nextByOrder = findNextActionByOrder(actionData, actions);
        if (nextByOrder) {
          navigateToAction(nextByOrder);
        }
      }
    },
    [navigateToAction, navigateToDone, toastStorageKey, actionData, actions],
  );

  const executeSubmitAndNavigate = useCallback(
    async (answer: ActionAnswerItem, isActualLast: boolean) => {
      const currentActionId = answer.actionId;

      // 이미 제출 중인 액션이면 이동만 수행
      if (pendingSubmissions.has(currentActionId)) {
        navigateToNext(answer, isActualLast);
        return;
      }

      setIsSubmitting(true);
      pendingSubmissions.add(currentActionId);

      // 트래킹
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

      // 1. 캐시 낙관적 업데이트
      updateCacheOptimistically(answer);

      // 2. 먼저 이동! (즉시 반응)
      navigateToNext(answer, isActualLast);
      setIsSubmitting(false);

      // 3. 백그라운드에서 저장
      submitAnswerOnly({
        missionId,
        responseId,
        answer,
        isLastAction: isActualLast,
      })
        .then(result => {
          if (!result.success) {
            // 캐시 롤백
            rollbackCache();

            if (result.code === "ALREADY_COMPLETED") {
              handleAlreadyCompleted();
            } else {
              toast.warning("답변 저장에 실패했습니다. 다시 시도해주세요.", {
                id: "submit-answer-error",
              });
              navigateToAction(currentActionId);
            }
          }
        })
        .finally(() => {
          pendingSubmissions.delete(currentActionId);
        });
    },
    [
      missionId,
      responseId,
      handleAlreadyCompleted,
      recordResponse,
      user?.id,
      navigateToNext,
      navigateToAction,
      updateCacheOptimistically,
      rollbackCache,
    ],
  );

  const submit = useCallback(async () => {
    if (!currentAnswer) return;

    // 액션 ID 불일치 시 (빠른 네비게이션으로 인한 상태 불일치)
    if (currentAnswer.actionId !== actionData.id) {
      // 현재 액션에 대해 이미 제출 중이면 무시 (중복 제출 방지, 이미 이동 중)
      if (pendingSubmissions.has(actionData.id)) {
        return;
      }
      // 현재 액션에 이미 제출된 답변이 있으면 다음으로 이동
      const submittedAnswers = missionResponse?.data?.answers ?? [];
      const existingAnswer = submittedAnswers.find(a => a.actionId === actionData.id) as
        | (typeof submittedAnswers)[number] & { nextActionId?: string; nextCompletionId?: string }
        | undefined;
      if (existingAnswer) {
        const isActualLast =
          !!existingAnswer.nextCompletionId ||
          progressInfo.currentOrder === progressInfo.totalCount;

        if (isActualLast) {
          removeSessionStorage(toastStorageKey);
          navigateToDone(existingAnswer.nextCompletionId);
        } else if (existingAnswer.nextActionId) {
          navigateToAction(existingAnswer.nextActionId);
        } else if (actionData.nextActionId) {
          navigateToAction(actionData.nextActionId);
        } else {
          // 선택된 옵션에서 nextActionId 찾기 (분기형)
          const selectedOption = existingAnswer.options?.[0];
          const nextActionId = actionData.options?.find(
            opt => opt.id === selectedOption?.id,
          )?.nextActionId;
          if (nextActionId) {
            navigateToAction(nextActionId);
          } else {
            const nextByOrder = findNextActionByOrder(actionData, actions);
            if (nextByOrder) {
              navigateToAction(nextByOrder);
            }
          }
        }
        return;
      }
      // 그 외의 경우 에러
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
    actionData,
    missionId,
    recordResponse,
    user?.id,
    missionResponse?.data?.answers,
    navigateToNext,
    navigateToAction,
    navigateToDone,
    toastStorageKey,
  ]);

  return {
    submit,
    isSubmitting,
    isActualLastStep,
  };
}
