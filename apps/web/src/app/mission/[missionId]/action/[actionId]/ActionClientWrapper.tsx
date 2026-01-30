"use client";
import { toast } from "@/components/common/Toast";
import { ExtendedActionStepConfig, createActionSteps } from "@/constants/action";
import { MISSION_TOAST_MESSAGE } from "@/constants/missionMessages";
import { ROUTES } from "@/constants/routes";
import { useReadActionsDetail } from "@/hooks/action/useReadActionsDetail";
import {
  useCompleteMission,
  useReadMissionResponseForMission,
  useSubmitQuestionAnswer,
} from "@/hooks/mission-response";
import { useMissionSurveyToast } from "@/hooks/mission/useMissionSurveyToast";
import { useRecordActionResponse } from "@/hooks/tracking";
import { useAuth } from "@/hooks/user";
import { setActionNavCookie } from "@/lib/cookie";
import { formatDateToHHMM, formatDateToYYYYMMDD } from "@/lib/date";
import { removeSessionStorage } from "@/lib/sessionStorage";
import { clearActionSession, getOrCreateSessionId } from "@/lib/tracking";
import { submitAnswerItemSchema } from "@/schemas/action-answer";
import { ActionType } from "@/types/domain/action";
import type { ActionAnswerItem } from "@/types/dto";
import type { ActionAnswer } from "@/types/dto/action-answer";
import { StepProvider, useModal, useStep } from "@repo/ui/components";
import { DehydratedState, HydrationBoundary } from "@tanstack/react-query";
import { useParams, useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  ActionDate,
  ActionImage,
  ActionPdf,
  ActionTag,
  ActionTime,
  ActionVideo,
  Branch,
  MissionRatingScale,
  MissionStarScale,
  MultipleChoice,
  ShortText,
  Subjective,
} from "./ui";

const SURVEY_SUBMIT_MODAL = {
  title: "미션을 최종적으로 제출할까요?",
  description: "제출 이후에는 답변을 수정하거나\n다시 참여할 수 없어요",
  confirmText: "제출하기",
  cancelText: "취소",
} as const;

interface ActionClientWrapperProps {
  dehydratedState: DehydratedState;
}

const SCROLL_OFFSET = 30;

export function ActionClientWrapper({ dehydratedState }: ActionClientWrapperProps) {
  return (
    <HydrationBoundary state={dehydratedState}>
      <ActionContent />
    </HydrationBoundary>
  );
}

function ActionContent() {
  const { missionId, actionId } = useParams<{ missionId: string; actionId: string }>();
  const { data: actions } = useReadActionsDetail(missionId);

  useEffect(() => {
    window.scrollTo(0, -SCROLL_OFFSET);
    document.documentElement.scrollTop = -SCROLL_OFFSET;
    document.body.scrollTop = -SCROLL_OFFSET;

    setActionNavCookie(missionId, actionId);
  }, [actionId, missionId]);

  // 클라이언트 네비게이션 시 데이터가 아직 hydration 되지 않은 경우 대기
  if (!actions.data || actions.data.length === 0) {
    return null;
  }

  const steps = createActionSteps({
    actions: actions.data,
    stepComponents: {
      MultipleChoice: MultipleChoice,
      Scale: MissionRatingScale,
      Subjective: Subjective,
      ShortText: ShortText,
      Rating: MissionStarScale,
      Image: ActionImage,
      Video: ActionVideo,
      Tag: ActionTag,
      Pdf: ActionPdf,
      Date: ActionDate,
      Time: ActionTime,
      Branch: Branch,
    },
  });

  const initialStep = steps.findIndex(
    step => (step as ExtendedActionStepConfig).actionData.id === actionId,
  );

  return (
    <StepProvider syncWithUrl steps={steps} initialStep={initialStep >= 0 ? initialStep : 0}>
      <ActionRenderer actions={actions.data} />
    </StepProvider>
  );
}

interface ActionForProgress {
  id: string;
  order: number | null;
  nextActionId?: string | null;
  nextCompletionId?: string | null;
  options: Array<{ id: string; nextActionId?: string | null; nextCompletionId?: string | null }>;
}

interface ActionRendererProps {
  actions: ActionForProgress[];
}

function calculateRemainingPath(
  currentActionId: string,
  actions: ActionForProgress[],
  submittedAnswerMap: Map<string, string[]>,
  visited: Set<string> = new Set(),
): number {
  if (visited.has(currentActionId)) return 0;
  visited.add(currentActionId);

  const currentAction = actions.find(a => a.id === currentActionId);
  if (!currentAction) return 0;

  let nextActionId: string | null | undefined = null;
  let hasCompletionId = false;

  // 1. 제출된 답변에서 선택된 옵션의 nextActionId/nextCompletionId 확인
  const submittedOptionIds = submittedAnswerMap.get(currentActionId);
  if (submittedOptionIds?.length) {
    const selectedOptionId = submittedOptionIds[0];
    const selectedOption = currentAction.options.find(o => o.id === selectedOptionId);
    if (selectedOption?.nextCompletionId) {
      hasCompletionId = true;
    } else if (selectedOption?.nextActionId) {
      nextActionId = selectedOption.nextActionId;
    }
  }

  // 2. action 레벨 nextCompletionId 확인
  if (!nextActionId && !hasCompletionId && currentAction.nextCompletionId) {
    hasCompletionId = true;
  }

  // 3. action 레벨 nextActionId 확인
  if (!nextActionId && !hasCompletionId && currentAction.nextActionId) {
    nextActionId = currentAction.nextActionId;
  }

  // 4. 순차적으로 다음 액션 (order 기반)
  if (!nextActionId && !hasCompletionId) {
    const currentOrder = currentAction.order ?? 0;
    const nextAction = actions.find(a => (a.order ?? 0) === currentOrder + 1);
    if (nextAction) {
      nextActionId = nextAction.id;
    }
  }

  // 다음 액션이 없거나 완료 화면으로 가면 현재가 마지막
  if (!nextActionId || hasCompletionId) return 1;

  // 재귀적으로 남은 경로 계산
  return 1 + calculateRemainingPath(nextActionId, actions, submittedAnswerMap, visited);
}

interface ProgressInfo {
  currentOrder: number;
  totalCount: number;
}

function calculateProgressInfo(
  currentActionId: string,
  actions: ActionForProgress[],
  answeredActionIds: string[],
  submittedAnswerMap: Map<string, string[]>,
): ProgressInfo {
  // 현재 액션이 이미 응답된 것인지 확인
  const isCurrentAnswered = answeredActionIds.includes(currentActionId);

  // 응답한 액션 수 (현재 액션 제외)
  const answeredCount = isCurrentAnswered
    ? answeredActionIds.indexOf(currentActionId)
    : answeredActionIds.length;

  // 현재 액션에서 끝까지의 남은 경로
  const remainingPath = calculateRemainingPath(currentActionId, actions, submittedAnswerMap);

  // 현재 순서 = 응답한 액션 수 + 1
  const currentOrder = answeredCount + 1;

  // 전체 = 응답한 액션 수 + 남은 경로
  const totalCount = answeredCount + remainingPath;

  return { currentOrder, totalCount };
}

function ActionRenderer({ actions }: ActionRendererProps) {
  const router = useRouter();
  const { missionId } = useParams<{ missionId: string }>();

  const [currentAnswer, setCurrentAnswer] = useState<ActionAnswerItem | null>(null);
  const { showModal } = useModal();
  const { user } = useAuth();
  const isFinalSubmitRef = useRef(false);

  const {
    currentStep,
    currentStepConfig,
    goNext,
    goBack,
    goToStep,
    steps,
    isFirstStep,
    canGoNext,
    updateStepConfig,
  } = useStep();

  const { data: missionResponse } = useReadMissionResponseForMission({ missionId });
  const recordResponse = useRecordActionResponse();

  const toastStorageKey = `mission-toast-${missionId}`;

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

      // 모달을 통한 최종 제출일 경우, 라우팅은 handleNext에서 처리
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
    async (responseId: string, completionId?: string) => {
      await completeMissionAsync({ responseId });
      removeSessionStorage(toastStorageKey);
      router.push(ROUTES.MISSION_DONE(missionId, completionId));
    },
    [completeMissionAsync, missionId, router, toastStorageKey],
  );

  const stepConfig = currentStepConfig as unknown as ExtendedActionStepConfig;
  const ContentComponent = stepConfig.content;
  const actionData = stepConfig.actionData;

  // 응답한 액션 ID 목록 및 선택된 옵션 맵 (순서 유지, 제출된 답변 기반)
  const { answeredActionIds, submittedAnswerMap } = useMemo(() => {
    const answers = missionResponse?.data?.answers ?? [];
    const seen = new Set<string>();
    const ordered: string[] = [];
    const answerMap = new Map<string, string[]>();

    for (const answer of answers) {
      if (!seen.has(answer.actionId)) {
        seen.add(answer.actionId);
        ordered.push(answer.actionId);
      }
      // 옵션 ID 수집 (MULTIPLE_CHOICE, TAG 등)
      if (answer.options?.length) {
        const optionIds = answer.options.map(opt => opt.id);
        answerMap.set(answer.actionId, optionIds);
      }
    }
    return { answeredActionIds: ordered, submittedAnswerMap: answerMap };
  }, [missionResponse?.data?.answers]);

  // 동적 progress 계산 (제출된 답변 기반으로만 계산)
  const progressInfo = useMemo(() => {
    return calculateProgressInfo(actionData.id, actions, answeredActionIds, submittedAnswerMap);
  }, [actionData.id, actions, answeredActionIds, submittedAnswerMap]);

  useMissionSurveyToast({
    currentOrder: progressInfo.currentOrder - 1,
    totalActionCount: progressInfo.totalCount,
    toastStorageKey,
  });

  const updateCanGoNext = useCallback(
    (canGoNext: boolean) => {
      updateStepConfig(currentStep, { canGoNext });
    },
    [currentStep, updateStepConfig],
  );

  const handleAnswerChange = useCallback((answer: ActionAnswerItem) => {
    setCurrentAnswer(answer);
  }, []);

  const responseId = missionResponse?.data?.id ?? "";

  const isAnswerSameAsSubmitted = useCallback(
    (answer: ActionAnswerItem, submittedAnswers: ActionAnswer[]): boolean => {
      const answersForAction = submittedAnswers.filter(
        submitted => submitted.actionId === answer.actionId,
      );

      if (answersForAction.length === 0) {
        return false;
      }

      if (answer.type === ActionType.MULTIPLE_CHOICE || answer.type === ActionType.TAG) {
        const submittedOptionIds = answersForAction
          .flatMap(a => a.options.map(opt => opt.id))
          .sort();
        const currentOptionIds = answer.selectedOptionIds
          ? [...answer.selectedOptionIds].sort()
          : [];

        const submittedTextAnswer = answersForAction.find(a => a.textAnswer)?.textAnswer ?? "";
        const currentTextAnswer = answer.textAnswer ?? "";

        const optionsMatch =
          submittedOptionIds.length === currentOptionIds.length &&
          submittedOptionIds.every((id, index) => id === currentOptionIds[index]);

        const textAnswerMatch = submittedTextAnswer === currentTextAnswer;

        return optionsMatch && textAnswerMatch;
      }

      if (answer.type === ActionType.SCALE || answer.type === ActionType.RATING) {
        const submittedScaleValue = answersForAction[0]?.scaleAnswer;
        return submittedScaleValue !== null && submittedScaleValue === answer.scaleValue;
      }

      if (answer.type === ActionType.SUBJECTIVE || answer.type === ActionType.SHORT_TEXT) {
        const submittedTextAnswer = answersForAction[0]?.textAnswer;
        return submittedTextAnswer !== null && submittedTextAnswer === answer.textAnswer;
      }

      if (
        answer.type === ActionType.IMAGE ||
        answer.type === ActionType.VIDEO ||
        answer.type === ActionType.PDF
      ) {
        const submittedAnswer = answersForAction[0];
        if (!submittedAnswer) {
          return false;
        }

        const submittedFileUploads = (
          submittedAnswer as typeof submittedAnswer & {
            fileUploads?: Array<{ id: string }>;
          }
        ).fileUploads;

        const submittedFileUploadIds = submittedFileUploads?.map(f => f.id).sort() ?? [];
        const currentFileUploadIds = (answer.fileUploadIds ?? []).sort();

        // 둘 다 빈 배열이면 동일하지 않음 (기존 답변 없음)
        if (submittedFileUploadIds.length === 0 && currentFileUploadIds.length === 0) {
          return false;
        }

        return (
          submittedFileUploadIds.length === currentFileUploadIds.length &&
          submittedFileUploadIds.length > 0 &&
          submittedFileUploadIds.every((id, index) => id === currentFileUploadIds[index])
        );
      }

      if (answer.type === ActionType.DATE) {
        const submittedDates = answersForAction
          .flatMap(a => {
            if (!a.dateAnswers) return [];
            return a.dateAnswers.map(d => formatDateToYYYYMMDD(d));
          })
          .sort();
        const currentDates = (answer.dateAnswers || []).map(d => formatDateToYYYYMMDD(d)).sort();
        return (
          submittedDates.length === currentDates.length &&
          submittedDates.every((date, index) => date === currentDates[index])
        );
      }

      if (answer.type === ActionType.TIME) {
        const submittedTimes = answersForAction
          .flatMap(a => {
            if (!a.dateAnswers) return [];
            return a.dateAnswers.map(d => formatDateToHHMM(d));
          })
          .sort();
        const currentTimes = (answer.dateAnswers || []).map(d => formatDateToHHMM(d)).sort();
        return (
          submittedTimes.length === currentTimes.length &&
          submittedTimes.every((time, index) => time === currentTimes[index])
        );
      }

      return false;
    },
    [],
  );

  const handleNext = useCallback(async () => {
    if (!currentAnswer) return;

    // 현재 답변이 현재 질문의 것인지 확인
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

    // 실제 마지막 스텝인지 계산 (분기 고려)
    const isActualLast =
      !!currentAnswer?.nextCompletionId || progressInfo.currentOrder === progressInfo.totalCount;

    if (isSame) {
      if (currentAnswer) {
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
      }

      if (currentAnswer?.nextCompletionId) {
        handleCompleteMission(responseId, currentAnswer.nextCompletionId);
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
            await handleCompleteMission(responseId, nextCompletionIdForSubmit);
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
    isAnswerSameAsSubmitted,
    goNext,
    actionData.id,
    missionId,
    recordResponse,
    user?.id,
    missionResponse?.data?.answers,
  ]);

  const handlePrevious = useCallback(() => {
    if (isFirstStep) {
      router.push(ROUTES.MISSION(missionId));
      return;
    }

    // 현재 액션을 nextActionId로 가리키고 있는 source 액션 찾기
    const currentActionId = actionData.id;

    // 1. option 레벨 nextActionId 확인 (MULTIPLE_CHOICE)
    // 2. action 레벨 nextActionId 확인 (모든 타입)
    const sourceAction = actions.find(
      action =>
        action.options.some(option => option.nextActionId === currentActionId) ||
        action.nextActionId === currentActionId,
    );

    if (sourceAction) {
      // nextActionId로 연결된 source 액션이 있으면 그 액션으로 이동
      const sourceIndex = steps.findIndex(
        step => (step as unknown as ExtendedActionStepConfig).actionData.id === sourceAction.id,
      );
      if (sourceIndex !== -1) {
        goToStep(sourceIndex);
        return;
      }
    }

    // 없으면 order상 이전 액션으로 이동
    goBack();
  }, [isFirstStep, goBack, goToStep, missionId, router, actionData.id, actions, steps]);

  // 실제 마지막 스텝인지 확인 (분기 고려, UI용)
  const isActualLastStep = useMemo(() => {
    if (currentAnswer?.nextCompletionId) return true;
    return progressInfo.currentOrder === progressInfo.totalCount;
  }, [currentAnswer?.nextCompletionId, progressInfo]);

  return (
    <ContentComponent
      key={actionData.id}
      actionData={actionData}
      currentOrder={progressInfo.currentOrder - 1}
      totalActionCount={progressInfo.totalCount}
      isFirstAction={isFirstStep}
      isNextDisabled={!canGoNext || isSubmittingAnswer || isCompletingMission}
      isLoading={isSubmittingAnswer || isCompletingMission}
      onPrevious={handlePrevious}
      onNext={handleNext}
      nextButtonText={isActualLastStep ? "제출하기" : "다음"}
      updateCanGoNext={updateCanGoNext}
      onAnswerChange={handleAnswerChange}
      missionResponse={missionResponse?.data ? missionResponse : undefined}
    />
  );
}
