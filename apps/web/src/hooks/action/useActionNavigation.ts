"use client";

import { ExtendedActionStepConfig } from "@/constants/action";
import { ROUTES } from "@/constants/routes";
import type { ActionForProgress } from "@/hooks/action";
import { useStep } from "@repo/ui/components";
import { useRouter } from "next/navigation";
import { useCallback } from "react";

interface UseActionNavigationParams {
  missionId: string;
  actions: ActionForProgress[];
}

export function useActionNavigation({ missionId, actions }: UseActionNavigationParams) {
  const router = useRouter();
  const stepHook = useStep();
  const { currentStepConfig, goBack, goToStep, steps, isFirstStep } = stepHook;

  const stepConfig = currentStepConfig as unknown as ExtendedActionStepConfig;
  const actionData = stepConfig.actionData;

  const handlePrevious = useCallback(() => {
    if (isFirstStep) {
      router.push(ROUTES.MISSION(missionId));
      return;
    }

    const currentActionId = actionData.id;

    const sourceAction = actions.find(
      action =>
        action.options.some(option => option.nextActionId === currentActionId) ||
        action.nextActionId === currentActionId,
    );

    if (sourceAction) {
      const sourceIndex = steps.findIndex(
        step => (step as unknown as ExtendedActionStepConfig).actionData.id === sourceAction.id,
      );
      if (sourceIndex !== -1) {
        goToStep(sourceIndex);
        return;
      }
    }

    goBack();
  }, [isFirstStep, goBack, goToStep, missionId, router, actionData.id, actions, steps]);

  return {
    ...stepHook,
    actionData,
    handlePrevious,
  };
}

export type UseActionNavigationReturn = ReturnType<typeof useActionNavigation>;
