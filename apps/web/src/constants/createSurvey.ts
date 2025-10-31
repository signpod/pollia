import { SurveyType } from "@/types/domain/survey";
import { StepConfig } from "@repo/ui/components";
import { ChevronLeft, LucideIcon, X } from "lucide-react";
import React from "react";
import { TYPE_LABELS } from "./survey";

export interface ExtendedStepConfig extends StepConfig {
  description?: string;
  header: {
    action: () => void;
    icon: LucideIcon | React.ComponentType<React.SVGProps<SVGSVGElement>>;
  };
  content: () => React.ReactNode;
}

type CreateSurveyStep = [StepConfig, StepConfig];

export const CREATE_SURVEY_STEPS: CreateSurveyStep = [
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
  EitherOrInfoStep: React.ComponentType;
  MultipleChoiceInfoStep: React.ComponentType;
  ScaleInfoStep: React.ComponentType;
  SubjectiveInfoStep: React.ComponentType;
}

type StepType = SurveyType | "ChoiceType";

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
    ...CREATE_SURVEY_STEPS[0],
    description: "원하는 질문 방식을 골라주세요",
    header: {
      action: () => router.back(),
      icon: X,
    },
    content: () => React.createElement(stepComponents.TypeStep),
  },
  {
    ...CREATE_SURVEY_STEPS[1],
    description:
      stepType !== "ChoiceType" ? `${TYPE_LABELS[stepType]} 질문의 내용을 작성해주세요` : undefined,
    header: {
      action: goBack,
      icon: ChevronLeft,
    },
    content: () => {
      switch (stepType) {
        case SurveyType.EITHER_OR:
          return React.createElement(stepComponents.EitherOrInfoStep);
        case SurveyType.MULTIPLE_CHOICE:
          return React.createElement(stepComponents.MultipleChoiceInfoStep);
        case SurveyType.SCALE:
          return React.createElement(stepComponents.ScaleInfoStep);
        case SurveyType.SUBJECTIVE:
          return React.createElement(stepComponents.SubjectiveInfoStep);
        case "ChoiceType":
          return undefined;
      }
    },
  },
];
