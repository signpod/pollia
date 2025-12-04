import React from "react";

import { ActionType } from "@/types/domain/action";
import { StepConfig } from "@repo/ui/components";
import { ChevronLeft, LucideIcon, X } from "lucide-react";
import { ACTION_TYPE_LABELS } from "./action";

export interface ExtendedStepConfig extends StepConfig {
  description?: string;
  header: {
    action: () => void;
    icon: LucideIcon | React.ComponentType<React.SVGProps<SVGSVGElement>>;
  };
  content: () => React.ReactNode;
}

type CreateMissionStep = [StepConfig, StepConfig];

export const CREATE_MISSION_STEPS: CreateMissionStep = [
  {
    id: "type",
    title: "질문의 유형을 선택해주세요!",
    canGoNext: true,
    canGoBack: false,
  },
  {
    id: "content",
    title: "질문의 내용을 작성해주세요!",
    canGoNext: true,
    canGoBack: true,
  },
];

interface StepComponents {
  TypeStep: React.ComponentType;
  MultipleChoiceInfoStep: React.ComponentType;
  ScaleInfoStep: React.ComponentType;
  SubjectiveInfoStep: React.ComponentType;
}

type StepType = ActionType | "ChoiceType";

interface CreateStepConfigsProps {
  router: { back: () => void };
  goBack: () => void;
  stepType: StepType;
  stepComponents: StepComponents;
}

export const createStepConfigs = ({
  router,
  goBack,
  stepType,
  stepComponents,
}: CreateStepConfigsProps): ExtendedStepConfig[] => [
  {
    ...CREATE_MISSION_STEPS[0],
    description: "원하는 질문 방식을 골라주세요",
    header: {
      action: () => router.back(),
      icon: X,
    },
    content: () => React.createElement(stepComponents.TypeStep),
  },
  {
    ...CREATE_MISSION_STEPS[1],
    description:
      stepType !== "ChoiceType"
        ? `${ACTION_TYPE_LABELS[stepType]} 질문의 내용을 작성해주세요`
        : undefined,
    header: {
      action: goBack,
      icon: ChevronLeft,
    },
    content: () => {
      switch (stepType) {
        case ActionType.MULTIPLE_CHOICE:
          return React.createElement(stepComponents.MultipleChoiceInfoStep);
        case ActionType.SCALE:
          return React.createElement(stepComponents.ScaleInfoStep);
        case ActionType.SUBJECTIVE:
          return React.createElement(stepComponents.SubjectiveInfoStep);
        case "ChoiceType":
          return undefined;
      }
    },
  },
];
