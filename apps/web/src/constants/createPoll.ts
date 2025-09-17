import React from "react";
import { StepConfig } from "@repo/ui/components";
import { ChevronLeft, X } from "lucide-react";

export interface ExtendedStepConfig extends StepConfig {
  description?: string;
  header: {
    action: () => void;
    icon: React.ElementType;
  };
  content: () => React.ReactNode;
}

export const CREATE_POLL_STEPS: StepConfig[] = [
  {
    id: "type",
    title: "어떤 유형의 폴을 선택할까요?",
    canGoNext: true,
    canGoBack: false,
  },
  {
    id: "info",
    title: "폴 내용을 작성해주세요",
    canGoNext: true,
    canGoBack: true,
  },
  {
    id: "category",
    title: "카테고리를 선택해주세요",
    canGoNext: true,
    canGoBack: true,
  },
];

export const createStepConfigs = (
  router: { back: () => void },
  goBack: () => void,
  isBinaryPollType: boolean,
  isMultiplePollType: boolean,
  TypeStep: React.ComponentType,
  BinaryInfoStep: React.ComponentType,
  CategoryStep: React.ComponentType
): ExtendedStepConfig[] => [
  {
    ...CREATE_POLL_STEPS[0]!,
    description: "원하는 질문 방식을 골라주세요",
    header: {
      action: () => router.back(),
      icon: X,
    },
    content: () => React.createElement(TypeStep),
  },
  {
    ...CREATE_POLL_STEPS[1]!,
    description: undefined,
    header: {
      action: goBack,
      icon: ChevronLeft,
    },
    content: () => {
      if (isBinaryPollType) {
        return React.createElement(BinaryInfoStep);
      } else if (isMultiplePollType) {
        return React.createElement("div", null, "Multiple Info Step");
      }
      throw new Error("알 수 없는 폴 타입입니다.");
    },
  },
  {
    ...CREATE_POLL_STEPS[2]!,
    description: undefined,
    header: {
      action: goBack,
      icon: ChevronLeft,
    },
    content: () => React.createElement(CategoryStep),
  },
];
