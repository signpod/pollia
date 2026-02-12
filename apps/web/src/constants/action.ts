import { ActionType } from "@/types/domain/action";
import type { ActionDetail } from "@/types/dto";
import { StepConfig } from "@repo/ui/components";

export interface ExtendedActionStepConfig extends StepConfig {
  actionData: ActionDetail;
  content: React.ComponentType<ActionStepContentProps>;
}

export interface ActionStepContentProps {
  actionData: ActionDetail;
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
  [ActionType.BRANCH]: "분기",
};

export const ACTION_PLACEHOLDER = "답변을 입력해주세요";

export const CLIENT_OTHER_OPTION_ID = "CLIENT_OTHER_OPTION";
