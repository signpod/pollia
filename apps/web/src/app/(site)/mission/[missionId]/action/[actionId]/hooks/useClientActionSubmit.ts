"use client";

import { completeResponseOnly, submitAnswerOnly } from "@/actions/action-answer";
import { toast } from "@/components/common/Toast";
import { missionQueryKeys } from "@/constants/queryKeys/missionQueryKeys";
import type { ActionForProgress } from "@/hooks/action";
import { useReadMissionResponseForMission } from "@/hooks/mission-response";
import { useRecordActionResponse } from "@/hooks/tracking";
import { useAuth } from "@/hooks/user";
import { isAnswerSameAsSubmitted } from "@/lib/answer/compareAnswers";
import { removeSessionStorage } from "@/lib/sessionStorage";
import { clearActionSession, getOrCreateSessionId } from "@/lib/tracking";
import { submitAnswerItemSchema } from "@/schemas/action-answer";
import type { ActionAnswerItem, ActionDetail, GetMissionResponseResponse } from "@/types/dto";
import { useModal } from "@repo/ui/components";
import { useQueryClient } from "@tanstack/react-query";
import { useCallback, useMemo, useRef, useState } from "react";

const SURVEY_SUBMIT_MODAL = {
  title: "완료할까요?",
  description: "완료 후에는 답변을 수정할 수 없어요",
  confirmText: "완료",
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
  shuffleQuestions?: boolean;
}

interface UseClientActionSubmitReturn {
  submit: () => Promise<void>;
  isSubmitting: boolean;
  isActualLastStep: boolean;
}

type CacheData = GetMissionResponseResponse | { data: null };

// 진행 중인 제출을 추적하는 전역 Set (컴포넌트 간 공유)
const pendingSubmissions = new Set<string>();

function findNextActionByOrder(
  currentAction: ActionForProgress,
  actions: ActionForProgress[],
): string | null {
  const currentOrder = currentAction.order ?? 0;
  const nextAction = actions.find(a => (a.order ?? 0) === currentOrder + 1);
  return nextAction?.id ?? null;
}

function findNextActionShuffle(
  currentActionId: string,
  actions: ActionForProgress[],
  submittedActionIds: Set<string>,
): string | null {
  const candidates = actions.filter(a => a.id !== currentActionId && !submittedActionIds.has(a.id));
  if (candidates.length === 0) return null;
  return candidates[Math.floor(Math.random() * candidates.length)]!.id;
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
  shuffleQuestions,
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
  const actorKey = user?.id ?? "guest";
  const queryKey = [...missionQueryKeys.missionResponseForMission(missionId), actorKey];

  const submittedActionIds = useMemo(
    () => new Set(missionResponse?.data?.answers?.map(a => a.actionId) ?? []),
    [missionResponse?.data?.answers],
  );

  const handleAlreadyCompleted = useCallback(() => {
    toast.warning("이미 완료된 컨텐츠입니다", { id: "mission-already-completed" });
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

  const shuffleRemainingCount = shuffleQuestions
    ? actions.filter(a => a.id !== actionData.id && !submittedActionIds.has(a.id)).length
    : undefined;

  const isActualLastStep = shuffleQuestions
    ? shuffleRemainingCount === 0
    : !!currentAnswer?.nextCompletionId || progressInfo.currentOrder === progressInfo.totalCount;

  const navigateToNext = useCallback(
    (answer: ActionAnswerItem, isActualLast: boolean) => {
      if (isActualLast) {
        removeSessionStorage(toastStorageKey);
        navigateToDone(answer.nextCompletionId);
      } else if (shuffleQuestions) {
        const updatedSubmitted = new Set(submittedActionIds);
        updatedSubmitted.add(answer.actionId);
        const nextId = findNextActionShuffle(answer.actionId, actions, updatedSubmitted);
        if (nextId) {
          navigateToAction(nextId);
        } else {
          removeSessionStorage(toastStorageKey);
          navigateToDone();
        }
      } else if (answer.nextCompletionId) {
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
    [
      navigateToAction,
      navigateToDone,
      toastStorageKey,
      actionData,
      actions,
      shuffleQuestions,
      submittedActionIds,
    ],
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

      if (isActualLast) {
        // 마지막 단계: 서버 저장 완료 후 이동 (completedAt 반영 필요)
        try {
          const result = await submitAnswerOnly({
            missionId,
            responseId,
            answer,
            isLastAction: true,
          });

          if (!result.success) {
            rollbackCache();
            if (result.code === "ALREADY_COMPLETED") {
              handleAlreadyCompleted();
            } else {
              toast.warning("답변 저장에 실패했습니다. 다시 시도해주세요.", {
                id: "submit-answer-error",
              });
              navigateToAction(currentActionId);
            }
            return;
          }

          removeSessionStorage(toastStorageKey);
          navigateToDone(result.selectedCompletionId ?? answer.nextCompletionId);
        } finally {
          setIsSubmitting(false);
          pendingSubmissions.delete(currentActionId);
        }
      } else {
        // 중간 단계: 먼저 이동, 백그라운드에서 저장 (기존 optimistic)
        navigateToNext(answer, isActualLast);
        setIsSubmitting(false);

        // shuffle 모드에서는 nextCompletionId를 제거하여 서버에서 조기 완료 방지
        const answerForServer = shuffleQuestions
          ? { ...answer, nextCompletionId: undefined }
          : answer;

        submitAnswerOnly({
          missionId,
          responseId,
          answer: answerForServer,
          isLastAction: false,
        })
          .then(result => {
            if (!result.success) {
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
      }
    },
    [
      missionId,
      responseId,
      handleAlreadyCompleted,
      recordResponse,
      user?.id,
      navigateToNext,
      navigateToAction,
      navigateToDone,
      toastStorageKey,
      updateCacheOptimistically,
      rollbackCache,
      shuffleQuestions,
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
        | ((typeof submittedAnswers)[number] & { nextActionId?: string; nextCompletionId?: string })
        | undefined;
      if (existingAnswer) {
        const isActualLast = shuffleQuestions
          ? shuffleRemainingCount === 0
          : !!existingAnswer.nextCompletionId ||
            progressInfo.currentOrder === progressInfo.totalCount;
        const isAlreadyCompleted = !!missionResponse?.data?.completedAt;

        if (isActualLast && !isAlreadyCompleted) {
          showModal({
            ...SURVEY_SUBMIT_MODAL,
            showCancelButton: true,
            onConfirm: async () => {
              const result = await completeResponseOnly({ missionId, responseId });
              if (!result.success) {
                if (result.code === "ALREADY_COMPLETED") {
                  handleAlreadyCompleted();
                } else {
                  toast.warning(result.error, { id: "complete-response-error" });
                }
                return;
              }
              removeSessionStorage(toastStorageKey);
              navigateToDone(result.selectedCompletionId ?? existingAnswer.nextCompletionId);
            },
          });
        } else if (isActualLast) {
          removeSessionStorage(toastStorageKey);
          navigateToDone(existingAnswer.nextCompletionId);
        } else if (shuffleQuestions) {
          const nextId = findNextActionShuffle(actionData.id, actions, submittedActionIds);
          if (nextId) {
            navigateToAction(nextId);
          }
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

    const isActualLast = shuffleQuestions
      ? shuffleRemainingCount === 0
      : !!currentAnswer?.nextCompletionId || progressInfo.currentOrder === progressInfo.totalCount;

    // 이미 저장된 답변이면 바로 이동 (서버 호출 없이)
    if (isSame) {
      const isAlreadyCompleted = !!missionResponse?.data?.completedAt;

      if (isActualLast && !isAlreadyCompleted) {
        showModal({
          ...SURVEY_SUBMIT_MODAL,
          showCancelButton: true,
          onConfirm: async () => {
            await executeSubmitAndNavigate(currentAnswer, isActualLast);
          },
        });
        return;
      }

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
    responseId,
    handleAlreadyCompleted,
    recordResponse,
    user?.id,
    missionResponse?.data?.answers,
    missionResponse?.data?.completedAt,
    navigateToNext,
    navigateToAction,
    navigateToDone,
    toastStorageKey,
    shuffleQuestions,
    shuffleRemainingCount,
    submittedActionIds,
    actions,
  ]);

  return {
    submit,
    isSubmitting,
    isActualLastStep,
  };
}
