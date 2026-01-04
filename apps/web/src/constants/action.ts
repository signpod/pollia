import { ActionType } from "@/types/domain/action";
import type { ActionAnswerItem, ActionDetail } from "@/types/dto";
import type { GetMissionResponseResponse } from "@/types/dto/mission-response";
import { MissionType } from "@prisma/client";
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
  missionResponse?: GetMissionResponseResponse;
  isLoading?: boolean;
}

interface CreateActionStepsProps {
  actions: ActionDetail[];
  stepComponents: {
    MultipleChoice: React.ComponentType<ActionStepContentProps>;
    Scale: React.ComponentType<ActionStepContentProps>;
    Subjective: React.ComponentType<ActionStepContentProps>;
    ShortText: React.ComponentType<ActionStepContentProps>;
    Rating: React.ComponentType<ActionStepContentProps>;
    Image: React.ComponentType<ActionStepContentProps>;
    Video: React.ComponentType<ActionStepContentProps>;
    Tag: React.ComponentType<ActionStepContentProps>;
    Pdf: React.ComponentType<ActionStepContentProps>;
    Date: React.ComponentType<ActionStepContentProps>;
    Time: React.ComponentType<ActionStepContentProps>;
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
      canGoNext: false,
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
    case ActionType.RATING:
      return stepComponents.Rating;
    case ActionType.SUBJECTIVE:
      return stepComponents.Subjective;
    case ActionType.SHORT_TEXT:
      return stepComponents.ShortText;
    case ActionType.PDF:
      return stepComponents.Pdf;
    case ActionType.IMAGE:
      return stepComponents.Image;
    case ActionType.VIDEO:
      return stepComponents.Video;
    case ActionType.TAG:
      return stepComponents.Tag;
    case ActionType.DATE:
      return stepComponents.Date;
    case ActionType.TIME:
      return stepComponents.Time;
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
  [ActionType.SHORT_TEXT]: "짧은 텍스트",
  [ActionType.RATING]: "평점",
  [ActionType.TAG]: "태그",
  [ActionType.IMAGE]: "이미지",
  [ActionType.VIDEO]: "동영상",
  [ActionType.PDF]: "PDF",
  [ActionType.DATE]: "날짜",
  [ActionType.TIME]: "시간",
  [ActionType.PRIVACY_CONSENT]: "개인정보 동의",
};

export const MISSION_TYPE_LABELS: Record<MissionType, string> = {
  [MissionType.GENERAL]: "일반 미션",
  [MissionType.EXPERIENCE_GROUP]: "체험단 미션",
};

export const ACTION_PLACEHOLDER = "답변을 입력해주세요";
