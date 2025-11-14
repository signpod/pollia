import React from "react";

import { SurveyQuestionType } from "@/types/domain/survey";
import type { SurveyAnswerItem } from "@/types/dto";
import { StepConfig } from "@repo/ui/components";

export interface QuestionData {
  id: string;
  order: number;
  type: SurveyQuestionType;
  title: string;
  description?: string;
  imageUrl?: string;
  options?: Array<{ id: string; label: string; description: string; imageUrl: string }>;
  scaleConfig?: {
    min: number;
    max: number;
    labels: string[];
  };
  maxSelections?: number;
}

export interface ExtendedQuestionStepConfig extends StepConfig {
  questionData: QuestionData;
  content: React.ComponentType<QuestionStepContentProps>;
}

export interface QuestionStepContentProps {
  questionData: QuestionData;
  currentOrder: number;
  totalQuestionCount: number;
  isFirstQuestion: boolean;
  isNextDisabled: boolean;
  onPrevious?: () => void;
  onNext?: () => void;
  nextButtonText?: string;
  updateCanGoNext?: (canGoNext: boolean) => void;
  onAnswerChange?: (answer: SurveyAnswerItem) => void;
}

interface CreateQuestionStepsProps {
  questions: QuestionData[];
  stepComponents: {
    MultipleChoice: React.ComponentType<QuestionStepContentProps>;
    Scale: React.ComponentType<QuestionStepContentProps>;
    Subjective: React.ComponentType<QuestionStepContentProps>;
  };
}

export const createQuestionSteps = ({
  questions,
  stepComponents,
}: CreateQuestionStepsProps): ExtendedQuestionStepConfig[] => {
  return questions.map(question => {
    const ContentComponent = getContentComponent(question.type, stepComponents);

    return {
      id: question.id,
      title: question.title,
      canGoNext: false, // 기본값, 각 컴포넌트에서 동적으로 업데이트
      canGoBack: true,
      questionData: question,
      content: ContentComponent,
    };
  });
};

function getContentComponent(
  type: SurveyQuestionType,
  stepComponents: CreateQuestionStepsProps["stepComponents"],
): React.ComponentType<QuestionStepContentProps> {
  switch (type) {
    case SurveyQuestionType.MULTIPLE_CHOICE:
      return stepComponents.MultipleChoice;
    case SurveyQuestionType.SCALE:
      return stepComponents.Scale;
    case SurveyQuestionType.SUBJECTIVE:
      return stepComponents.Subjective;
    default:
      throw new Error(`Unsupported question type: ${type}`);
  }
}
