"use client";

import { submitAnswerOnly } from "@/actions/action-answer";
import { createActionSteps } from "@/components/common/templates/action";
import { ActionProvider } from "@/components/common/templates/action/common/ActionContext";
import type { ExtendedActionStepConfig } from "@/constants/action";
import { ROUTES } from "@/constants/routes";
import {
  type ActionForProgress,
  type SubmittedAnswerForProgress,
  type UseActionProgressParams,
  useActionProgress,
} from "@/hooks/action";
import { useReadActionsDetail } from "@/hooks/action/useReadActionsDetail";
import { useReadMission } from "@/hooks/mission";
import { useReadMissionResponseForMission } from "@/hooks/mission-response";
import { setActionNavCookie } from "@/lib/cookie";
import { type QuizConfig, quizConfigSchema } from "@/schemas/mission/quizConfigSchema";
import type { ActionAnswerItem, ActionDetail } from "@/types/dto";
import { ActionType, MatchMode, MissionCategory } from "@prisma/client";
import { useModal } from "@repo/ui/components";
import { DehydratedState, HydrationBoundary } from "@tanstack/react-query";
import { useParams, useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useClientActionSubmit } from "./hooks/useClientActionSubmit";
import { QuizProvider, useQuizContext } from "./quiz/QuizProvider";

let navigationDirection: "forward" | "backward" = "forward";

interface ActionClientWrapperProps {
  dehydratedState: DehydratedState;
}

export function ActionClientWrapper({ dehydratedState }: ActionClientWrapperProps) {
  return (
    <HydrationBoundary state={dehydratedState}>
      <ActionContent />
    </HydrationBoundary>
  );
}

function parseQuizConfig(mission: {
  category: MissionCategory;
  quizConfig?: unknown;
}): QuizConfig | null {
  if (mission.category !== MissionCategory.QUIZ) return null;
  const result = quizConfigSchema.safeParse(mission.quizConfig ?? {});
  return result.success ? result.data : null;
}

function ActionContent() {
  const { missionId, actionId } = useParams<{
    missionId: string;
    actionId: string;
  }>();
  const router = useRouter();
  const { data: actionsData } = useReadActionsDetail(missionId);
  const { data: missionData } = useReadMission(missionId);
  const actions = actionsData?.data ?? [];

  const quizConfig = useMemo(
    () => (missionData?.data ? parseQuizConfig(missionData.data) : null),
    [missionData?.data],
  );

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "instant" });

    setActionNavCookie(missionId, actionId);
  }, [actionId, missionId]);

  const navigateToAction = useCallback(
    (nextActionId: string) => {
      router.push(ROUTES.ACTION({ missionId, actionId: nextActionId }));
    },
    [missionId, router],
  );

  const navigateToDone = useCallback(
    (completionId?: string) => {
      // done 페이지는 서버 렌더링 필요
      router.push(ROUTES.MISSION_DONE(missionId, completionId));
    },
    [missionId, router],
  );

  const navigateToMission = useCallback(() => {
    router.push(ROUTES.MISSION(missionId));
  }, [missionId, router]);

  if (actions.length === 0) {
    return null;
  }

  const steps = createActionSteps({
    actions,
  });

  const currentStep = steps.find(
    step => (step as ExtendedActionStepConfig).actionData.id === actionId,
  ) as ExtendedActionStepConfig | undefined;

  if (!currentStep) {
    return null;
  }

  const content = (
    <ActionStepWrapper
      actions={actions}
      currentActionData={currentStep.actionData}
      steps={steps}
      missionId={missionId}
      entryActionId={missionData?.data?.entryActionId}
      navigateToAction={navigateToAction}
      navigateToDone={navigateToDone}
      navigateToMission={navigateToMission}
    />
  );

  if (quizConfig) {
    return <QuizProvider quizConfig={quizConfig}>{content}</QuizProvider>;
  }

  return content;
}

interface ActionStepWrapperProps {
  actions: ActionForProgress[];
  currentActionData: ActionDetail;
  steps: ReturnType<typeof createActionSteps>;
  missionId: string;
  entryActionId?: string | null;
  navigateToAction: (actionId: string) => void;
  navigateToDone: (completionId?: string) => void;
  navigateToMission: () => void;
}

function ActionStepWrapper({
  actions,
  currentActionData,
  steps,
  missionId,
  entryActionId,
  navigateToAction,
  navigateToDone,
  navigateToMission,
}: ActionStepWrapperProps) {
  const [currentAnswer, setCurrentAnswer] = useState<ActionAnswerItem | null>(null);
  const [canGoNext, setCanGoNext] = useState(false);
  const quiz = useQuizContext();
  const { showModal } = useModal();

  const { data: missionResponse } = useReadMissionResponseForMission({ missionId });

  const isInstantQuiz = quiz?.quizConfig.gradingMode === "instant";

  const checkAnswer = useCallback(
    (answer: ActionAnswerItem): boolean | null => {
      const options = currentActionData.options ?? [];
      const actionType = currentActionData.type;

      if (actionType === ActionType.OX || actionType === ActionType.MULTIPLE_CHOICE) {
        const correctOpt = options.find(opt => opt.isCorrect);
        if (!correctOpt) return null;
        const selectedId =
          "selectedOptionIds" in answer ? answer.selectedOptionIds?.[0] : undefined;
        return selectedId === correctOpt.id;
      }

      if (actionType === ActionType.SHORT_TEXT || actionType === ActionType.SUBJECTIVE) {
        if (options.length === 0) return null;
        const userText = ("textAnswer" in answer ? answer.textAnswer : "")?.trim() ?? "";
        if (!userText) return false;
        const matchMode = currentActionData.matchMode ?? MatchMode.EXACT;
        return options.some(opt => {
          const correctText = opt.title.trim();
          if (matchMode === MatchMode.CONTAINS) {
            return userText.toLowerCase().includes(correctText.toLowerCase());
          }
          return userText.toLowerCase() === correctText.toLowerCase();
        });
      }

      return null;
    },
    [currentActionData],
  );

  const showQuizFeedbackModal = useCallback(
    (isCorrect: boolean, onNext: () => void, isLastStep = false) => {
      showModal({
        title: isCorrect ? "정답이에요!" : "오답이에요",
        description: isCorrect ? "잘 맞혔어요 👏" : "아쉽지만 틀렸어요",
        confirmText: isLastStep ? "제출하기" : "다음",
        onConfirm: onNext,
      });
    },
    [showModal],
  );

  const quizNavigateToAction = useCallback(
    (nextActionId: string) => {
      if (isInstantQuiz && currentAnswer) {
        const result = checkAnswer(currentAnswer);
        if (result !== null) {
          showQuizFeedbackModal(result, () => navigateToAction(nextActionId));
          return;
        }
      }
      navigateToAction(nextActionId);
    },
    [isInstantQuiz, currentAnswer, checkAnswer, showQuizFeedbackModal, navigateToAction],
  );

  const quizNavigateToDone = useCallback(
    (completionId?: string) => {
      if (isInstantQuiz && currentAnswer) {
        const result = checkAnswer(currentAnswer);
        if (result !== null) {
          showQuizFeedbackModal(result, () => navigateToDone(completionId));
          return;
        }
      }
      navigateToDone(completionId);
    },
    [isInstantQuiz, currentAnswer, checkAnswer, showQuizFeedbackModal, navigateToDone],
  );

  const submittedAnswers: SubmittedAnswerForProgress[] | undefined = useMemo(() => {
    if (missionResponse?.data?.completedAt) return undefined;
    return missionResponse?.data?.answers?.map(answer => ({
      actionId: answer.actionId,
      options: answer.options,
    }));
  }, [missionResponse?.data?.answers, missionResponse?.data?.completedAt]);

  const progressInfo = useActionProgress({
    actionId: currentActionData.id,
    actions,
    submittedAnswers,
    entryActionId,
    shuffleQuestions: quiz?.quizConfig.shuffleQuestions,
  } satisfies UseActionProgressParams);

  const isFirstStep = currentActionData.id === (entryActionId ?? actions[0]?.id);

  const { submit, isSubmitting, isActualLastStep } = useClientActionSubmit({
    missionId,
    actionData: currentActionData,
    actions,
    progressInfo,
    currentAnswer,
    navigateToAction: isInstantQuiz ? quizNavigateToAction : navigateToAction,
    navigateToDone: isInstantQuiz ? quizNavigateToDone : navigateToDone,
    navigateToMission,
    shuffleQuestions: quiz?.quizConfig.shuffleQuestions,
  });

  const updateCanGoNext = useCallback((value: boolean) => {
    setCanGoNext(value);
  }, []);

  const handleAnswerChange = useCallback((answer: ActionAnswerItem) => {
    setCurrentAnswer(answer);
  }, []);

  const handlePrevious = useCallback(() => {
    navigationDirection = "backward";

    if (isFirstStep) {
      navigateToMission();
      return;
    }

    const sourceAction = actions.find(
      action =>
        action.options.some(option => option.nextActionId === currentActionData.id) ||
        action.nextActionId === currentActionData.id,
    );

    if (sourceAction) {
      navigateToAction(sourceAction.id);
    } else {
      const currentOrder = currentActionData.order ?? 0;
      const prevAction = actions.find(a => (a.order ?? 0) === currentOrder - 1);
      if (prevAction) {
        navigateToAction(prevAction.id);
      }
    }
  }, [isFirstStep, actions, currentActionData, navigateToAction, navigateToMission]);

  const currentStep = steps.find(
    (step): step is ExtendedActionStepConfig => step.actionData.id === currentActionData.id,
  );
  const ContentComponent = currentStep?.content;

  const animationName =
    navigationDirection === "forward" ? "slide-in-from-right" : "slide-in-from-left";

  const contextValue = useMemo(
    () => ({
      currentOrder: progressInfo.currentOrder - 1,
      totalActionCount: progressInfo.totalCount,
      isFirstAction: isFirstStep,
      onPrevious: handlePrevious,
      onNext: () => {
        if (!isInstantQuiz) {
          navigationDirection = "forward";
        }
        if (isInstantQuiz && isActualLastStep && currentAnswer) {
          const result = checkAnswer(currentAnswer);
          if (result !== null) {
            const responseId = missionResponse?.data?.id;
            showQuizFeedbackModal(
              result,
              () => {
                queueMicrotask(() => {
                  showModal({
                    title: "완료할까요?",
                    description: "완료 후에는 답변을 수정할 수 없어요",
                    confirmText: "완료",
                    cancelText: "취소",
                    showCancelButton: true,
                    onConfirm: async () => {
                      if (!responseId) return;
                      const submitResult = await submitAnswerOnly({
                        missionId,
                        responseId,
                        answer: currentAnswer,
                        isLastAction: true,
                      });
                      if (submitResult.success) {
                        navigateToDone(submitResult.selectedCompletionId);
                      }
                    },
                  });
                });
              },
              true,
            );
            return;
          }
        }
        return submit();
      },
      onPrefetchNext: () => {}, // 클라이언트 네비게이션이므로 prefetch 불필요
      nextButtonText: isActualLastStep ? "제출하기" : "다음",
      isLoading: isSubmitting,
      isNextDisabled: !canGoNext || isSubmitting,
      updateCanGoNext,
      onAnswerChange: handleAnswerChange,
      missionResponse:
        missionResponse?.data && !missionResponse.data.completedAt ? missionResponse : undefined,
      animationName,
      shuffleChoices: quiz?.quizConfig.shuffleChoices,
    }),
    [
      progressInfo.currentOrder,
      progressInfo.totalCount,
      isFirstStep,
      handlePrevious,
      submit,
      isActualLastStep,
      isSubmitting,
      canGoNext,
      updateCanGoNext,
      handleAnswerChange,
      missionResponse,
      animationName,
      isInstantQuiz,
      currentAnswer,
      checkAnswer,
      showQuizFeedbackModal,
    ],
  );

  if (!ContentComponent) {
    //TODO: 예외처리
    return <div>ContentComponent not found</div>;
  }

  return (
    <ActionProvider value={contextValue}>
      <ContentComponent actionData={currentActionData} />
    </ActionProvider>
  );
}
