"use client";

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
import { useMissionSurveyToast } from "@/hooks/mission/useMissionSurveyToast";
import { setActionNavCookie } from "@/lib/cookie";
import type { ActionAnswerItem, ActionDetail } from "@/types/dto";
import { DehydratedState, HydrationBoundary } from "@tanstack/react-query";
import { useParams, useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useClientActionSubmit } from "./hooks/useClientActionSubmit";

const SCROLL_OFFSET = 30;

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
  const { data: missionData } = useReadMission(missionId);

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
  });

  const currentStep = steps.find(
    step => (step as ExtendedActionStepConfig).actionData.id === actionId,
  ) as ExtendedActionStepConfig | undefined;

  if (!currentStep) {
    return null;
  }

  return (
    <ActionStepWrapper
      actions={actions.data}
      currentActionData={currentStep.actionData}
      steps={steps}
      missionId={missionId}
      entryActionId={missionData?.data?.entryActionId}
      navigateToAction={navigateToAction}
      navigateToDone={navigateToDone}
      navigateToMission={navigateToMission}
    />
  );
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

  const { data: missionResponse } = useReadMissionResponseForMission({ missionId });

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
  } satisfies UseActionProgressParams);

  const toastStorageKey = `mission-toast-${missionId}`;
  useMissionSurveyToast({
    currentOrder: progressInfo.currentOrder - 1,
    totalActionCount: progressInfo.totalCount,
    toastStorageKey,
  });

  const isFirstStep = currentActionData.id === (entryActionId ?? actions[0]?.id);

  const { submit, isSubmitting, isActualLastStep } = useClientActionSubmit({
    missionId,
    actionData: currentActionData,
    actions,
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

  const handlePrevious = useCallback(() => {
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
      missionResponse:
        missionResponse?.data && !missionResponse.data.completedAt ? missionResponse : undefined,
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

  if (!ContentComponent) {
    //TODO: 예외처리
    return <div>ContentComponent not found</div>;
  }

  return (
    <ActionProvider value={contextValue}>
      <ContentComponent key={currentActionData.id} actionData={currentActionData} />
    </ActionProvider>
  );
}
