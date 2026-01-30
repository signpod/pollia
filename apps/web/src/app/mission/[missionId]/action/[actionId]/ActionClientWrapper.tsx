"use client";

import { ExtendedActionStepConfig, createActionSteps } from "@/constants/action";
import {
  useActionNavigation,
  useActionProgress,
  useActionSubmit,
  type ActionForProgress,
} from "@/hooks/action";
import { useReadActionsDetail } from "@/hooks/action/useReadActionsDetail";
import { useReadMissionResponseForMission } from "@/hooks/mission-response";
import { useMissionSurveyToast } from "@/hooks/mission/useMissionSurveyToast";
import { setActionNavCookie } from "@/lib/cookie";
import type { ActionAnswerItem } from "@/types/dto";
import { StepProvider } from "@repo/ui/components";
import { DehydratedState, HydrationBoundary } from "@tanstack/react-query";
import { useParams } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";
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
  const { missionId, actionId } = useParams<{ missionId: string; actionId: string }>();
  const { data: actions } = useReadActionsDetail(missionId);

  useEffect(() => {
    window.scrollTo(0, -SCROLL_OFFSET);
    document.documentElement.scrollTop = -SCROLL_OFFSET;
    document.body.scrollTop = -SCROLL_OFFSET;

    setActionNavCookie(missionId, actionId);
  }, [actionId, missionId]);

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

interface ActionRendererProps {
  actions: ActionForProgress[];
}

function ActionRenderer({ actions }: ActionRendererProps) {
  const { missionId } = useParams<{ missionId: string }>();
  const [currentAnswer, setCurrentAnswer] = useState<ActionAnswerItem | null>(null);

  const {
    currentStep,
    currentStepConfig,
    goNext,
    canGoNext,
    updateStepConfig,
    isFirstStep,
    actionData,
    handlePrevious,
  } = useActionNavigation({ missionId, actions });

  const { data: missionResponse } = useReadMissionResponseForMission({ missionId });
  const progressInfo = useActionProgress({ actionId: actionData.id, actions });

  const toastStorageKey = `mission-toast-${missionId}`;
  useMissionSurveyToast({
    currentOrder: progressInfo.currentOrder - 1,
    totalActionCount: progressInfo.totalCount,
    toastStorageKey,
  });

  const { submit, isSubmitting, isCompleting, isActualLastStep } = useActionSubmit({
    missionId,
    actionData,
    progressInfo,
    currentAnswer,
    goNext,
  });

  const updateCanGoNext = useCallback(
    (canGoNextValue: boolean) => {
      updateStepConfig(currentStep, { canGoNext: canGoNextValue });
    },
    [currentStep, updateStepConfig],
  );

  const handleAnswerChange = useCallback((answer: ActionAnswerItem) => {
    setCurrentAnswer(answer);
  }, []);

  const stepConfig = currentStepConfig as unknown as ExtendedActionStepConfig;
  const ContentComponent = stepConfig.content;

  const contextValue = useMemo(
    () => ({
      currentOrder: progressInfo.currentOrder - 1,
      totalActionCount: progressInfo.totalCount,
      isFirstAction: isFirstStep,
      onPrevious: handlePrevious,
      onNext: submit,
      nextButtonText: isActualLastStep ? "제출하기" : "다음",
      isLoading: isSubmitting || isCompleting,
      isNextDisabled: !canGoNext || isSubmitting || isCompleting,
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
      isCompleting,
      canGoNext,
      updateCanGoNext,
      handleAnswerChange,
      missionResponse,
    ],
  );

  return (
    <ActionProvider value={contextValue}>
      <ContentComponent key={actionData.id} actionData={actionData} />
    </ActionProvider>
  );
}
