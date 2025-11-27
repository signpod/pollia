import React from "react";

import { SurveyQuestionType } from "@/types/domain/survey";
import { StepConfig } from "@repo/ui/components";
import { ChevronLeft, LucideIcon, X } from "lucide-react";
import { SURVEY_QUESTION_TYPE_LABELS } from "./survey";

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
  MultipleChoiceInfoStep: React.ComponentType;
  ScaleInfoStep: React.ComponentType;
  SubjectiveInfoStep: React.ComponentType;
}

type StepType = SurveyQuestionType | "ChoiceType";

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
      stepType !== "ChoiceType"
        ? `${SURVEY_QUESTION_TYPE_LABELS[stepType]} 질문의 내용을 작성해주세요`
        : undefined,
    header: {
      action: goBack,
      icon: ChevronLeft,
    },
    content: () => {
      switch (stepType) {
        case SurveyQuestionType.MULTIPLE_CHOICE:
          return React.createElement(stepComponents.MultipleChoiceInfoStep);
        case SurveyQuestionType.SCALE:
          return React.createElement(stepComponents.ScaleInfoStep);
        case SurveyQuestionType.SUBJECTIVE:
          return React.createElement(stepComponents.SubjectiveInfoStep);
        case "ChoiceType":
          return undefined;
      }
    },
  },
];
