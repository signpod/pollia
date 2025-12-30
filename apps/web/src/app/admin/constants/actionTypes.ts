import { ActionType } from "@prisma/client";

export const ACTION_TYPE_LABELS: Record<ActionType, string> = {
  MULTIPLE_CHOICE: "여러 선택지",
  SCALE: "척도형",
  RATING: "평점",
  TAG: "태그",
  SUBJECTIVE: "주관식",
  IMAGE: "이미지",
  PDF: "PDF",
  VIDEO: "동영상",
  URL: "URL",
  DATE: "날짜",
  TIME: "시간",
  PRIVACY_CONSENT: "개인정보 동의",
  NAME: "이름",
  ADDRESS: "주소",
  PHONE: "전화번호",
  EMAIL: "이메일",
};

export function getActionTypeLabel(type: ActionType): string {
  return ACTION_TYPE_LABELS[type];
}
