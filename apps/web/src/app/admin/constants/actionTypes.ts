import { ActionType } from "@prisma/client";

export const ACTION_TYPE_LABELS: Record<ActionType, string> = {
  MULTIPLE_CHOICE: "여러 선택지",
  SCALE: "척도형",
  RATING: "평점",
  TAG: "태그",
  SUBJECTIVE: "주관식",
  SHORT_TEXT: "짧은 텍스트",
  IMAGE: "이미지",
  PDF: "PDF",
  VIDEO: "동영상",
  DATE: "날짜",
  TIME: "시간",
  BRANCH: "분기",
  OX: "OX",
};

export function getActionTypeLabel(type: ActionType): string {
  return ACTION_TYPE_LABELS[type];
}
