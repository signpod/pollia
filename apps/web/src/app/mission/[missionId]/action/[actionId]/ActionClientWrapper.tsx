"use client";

import { ExtendedActionStepConfig, createActionSteps } from "@/constants/action";
import { ROUTES } from "@/constants/routes";
import {
  type ActionForProgress,
  type SubmittedAnswerForProgress,
  useActionProgress,
} from "@/hooks/action";
import { useReadActionsDetail } from "@/hooks/action/useReadActionsDetail";
import { useReadMissionResponseForMission } from "@/hooks/mission-response";
import { useMissionSurveyToast } from "@/hooks/mission/useMissionSurveyToast";
import { setActionNavCookie } from "@/lib/cookie";
import type { ActionAnswerItem, ActionDetail } from "@/types/dto";
import { DehydratedState, HydrationBoundary } from "@tanstack/react-query";
import { useParams, useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useClientActionSubmit } from "./hooks/useClientActionSubmit";
import { ActionProvider } from "./providers/ActionContext";
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

const SCROLL_OFFSET = 30;

const STEP_COMPONENTS = {
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
} as const;

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

function ActionContent() {
  const { missionId, actionId } = useParams<{
    missionId: string;
    actionId: string;
  }>();
  const router = useRouter();
  const { data: actions } = useReadActionsDetail(missionId);

  useEffect(() => {
    window.scrollTo(0, -SCROLL_OFFSET);
    document.documentElement.scrollTop = -SCROLL_OFFSET;
    document.body.scrollTop = -SCROLL_OFFSET;

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

  if (!actions.data || actions.data.length === 0) {
    return null;
  }

  const steps = createActionSteps({
    actions: actions.data,
    stepComponents: STEP_COMPONENTS,
  });

  const currentStep = steps.find(
    step => (step as ExtendedActionStepConfig).actionData.id === actionId,
  ) as ExtendedActionStepConfig | undefined;

  if (!currentStep) {
    return null;
  }

  return (
    <ActionRenderer
      actions={actions.data}
      currentActionData={currentStep.actionData}
      steps={steps}
      missionId={missionId}
      navigateToAction={navigateToAction}
      navigateToDone={navigateToDone}
      navigateToMission={navigateToMission}
    />
  );
}

interface ActionRendererProps {
  actions: ActionForProgress[];
  currentActionData: ActionDetail;
  steps: ReturnType<typeof createActionSteps>;
  missionId: string;
  navigateToAction: (actionId: string) => void;
  navigateToDone: (completionId?: string) => void;
  navigateToMission: () => void;
}

function ActionRenderer({
  actions,
  currentActionData,
  steps,
  missionId,
  navigateToAction,
  navigateToDone,
  navigateToMission,
}: ActionRendererProps) {
  const [currentAnswer, setCurrentAnswer] = useState<ActionAnswerItem | null>(null);
  const [canGoNext, setCanGoNext] = useState(false);

  const { data: missionResponse } = useReadMissionResponseForMission({ missionId });

  const submittedAnswers: SubmittedAnswerForProgress[] | undefined = useMemo(() => {
    return missionResponse?.data?.answers?.map(answer => ({
      actionId: answer.actionId,
      options: answer.options,
    }));
  }, [missionResponse?.data?.answers]);

  const progressInfo = useActionProgress({
    actionId: currentActionData.id,
    actions,
    submittedAnswers,
  });

  const toastStorageKey = `mission-toast-${missionId}`;
  useMissionSurveyToast({
    currentOrder: progressInfo.currentOrder - 1,
    totalActionCount: progressInfo.totalCount,
    toastStorageKey,
  });

  // 첫 번째 액션인지 확인
  const isFirstStep = actions[0]?.id === currentActionData.id;

  const { submit, isSubmitting, isActualLastStep } = useClientActionSubmit({
    missionId,
    actionData: currentActionData,
    progressInfo,
    currentAnswer,
    navigateToAction,
    navigateToDone,
    navigateToMission,
  });

  const updateCanGoNext = useCallback((value: boolean) => {
    setCanGoNext(value);
  }, []);

  const handleAnswerChange = useCallback((answer: ActionAnswerItem) => {
    setCurrentAnswer(answer);
  }, []);

  // 이전 버튼 핸들러
  const handlePrevious = useCallback(() => {
    if (isFirstStep) {
      navigateToMission();
      return;
    }

    // 현재 액션을 가리키는 이전 액션 찾기
    const sourceAction = actions.find(
      action =>
        action.options.some(option => option.nextActionId === currentActionData.id) ||
        action.nextActionId === currentActionData.id,
    );

    if (sourceAction) {
      navigateToAction(sourceAction.id);
    }
  }, [isFirstStep, actions, currentActionData.id, navigateToAction, navigateToMission]);

  // 현재 스텝의 컴포넌트 찾기
  const currentStep = steps.find(
    step => (step as ExtendedActionStepConfig).actionData.id === currentActionData.id,
  ) as ExtendedActionStepConfig;
  const ContentComponent = currentStep.content;

  const contextValue = useMemo(
    () => ({
      currentOrder: progressInfo.currentOrder - 1,
      totalActionCount: progressInfo.totalCount,
      isFirstAction: isFirstStep,
      onPrevious: handlePrevious,
      onNext: submit,
      onPrefetchNext: () => {}, // 클라이언트 네비게이션이므로 prefetch 불필요
      nextButtonText: isActualLastStep ? "제출하기" : "다음",
      isLoading: isSubmitting,
      isNextDisabled: !canGoNext || isSubmitting,
      updateCanGoNext,
      onAnswerChange: handleAnswerChange,
      missionResponse: missionResponse?.data ? missionResponse : undefined,
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
    ],
  );

  return (
    <ActionProvider value={contextValue}>
      <ContentComponent key={currentActionData.id} actionData={currentActionData} />
    </ActionProvider>
  );
}
