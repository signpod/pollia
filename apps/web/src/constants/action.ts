import React from "react";

import { ActionType } from "@/types/domain/action";
import type { ActionAnswerItem, ActionDetail } from "@/types/dto";
import type { GetSurveyResponseResponse } from "@/types/dto/mission-response";
import { StepConfig } from "@repo/ui/components";

export interface ExtendedActionStepConfig extends StepConfig {
  actionData: ActionDetail;
  content: React.ComponentType<ActionStepContentProps>;
}

export interface ActionStepContentProps {
  actionData: ActionDetail;
  currentOrder: number;
  totalActionCount: number;
  isFirstAction: boolean;
  isNextDisabled: boolean;
  onPrevious?: () => void;
  onNext?: () => void;
  nextButtonText?: string;
  updateCanGoNext?: (canGoNext: boolean) => void;
  onAnswerChange?: (answer: ActionAnswerItem) => void;
  missionResponse?: GetSurveyResponseResponse;
}

interface CreateActionStepsProps {
  actions: ActionDetail[];
  stepComponents: {
    MultipleChoice: React.ComponentType<ActionStepContentProps>;
    Scale: React.ComponentType<ActionStepContentProps>;
    Subjective: React.ComponentType<ActionStepContentProps>;
  };
}

export const createActionSteps = ({
  actions,
  stepComponents,
}: CreateActionStepsProps): ExtendedActionStepConfig[] => {
  return actions.map(action => {
    const ContentComponent = getContentComponent(action.type, stepComponents);

    return {
      id: action.id,
      title: action.title,
      canGoNext: false, // 기본값, 각 컴포넌트에서 동적으로 업데이트
      canGoBack: true,
      actionData: action,
      content: ContentComponent,
    };
  });
};

function getContentComponent(
  type: ActionType,
  stepComponents: CreateActionStepsProps["stepComponents"],
): React.ComponentType<ActionStepContentProps> {
  switch (type) {
    case ActionType.MULTIPLE_CHOICE:
      return stepComponents.MultipleChoice;
    case ActionType.SCALE:
      return stepComponents.Scale;
    case ActionType.SUBJECTIVE:
      return stepComponents.Subjective;
    default:
      throw new Error(`Unsupported question type: ${type}`);
  }
}

export const ACTION_TYPES: ActionType[] = [
  ActionType.MULTIPLE_CHOICE,
  ActionType.SCALE,
  ActionType.SUBJECTIVE,
  ActionType.IMAGE,
  ActionType.TAG,
];

export const ACTION_TYPE_LABELS: Record<ActionType, string> = {
  [ActionType.MULTIPLE_CHOICE]: "여러 선택지",
  [ActionType.SCALE]: "척도형",
  [ActionType.SUBJECTIVE]: "주관식",
  [ActionType.RATING]: "평점",
  [ActionType.TAG]: "태그",
  [ActionType.IMAGE]: "이미지",
};
