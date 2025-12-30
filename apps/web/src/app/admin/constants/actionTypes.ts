export const ACTION_TYPE_LABELS = {
  MULTIPLE_CHOICE: "객관식",
  SCALE: "척도형",
  SUBJECTIVE: "주관식",
  TAG: "태그",
  RATING: "별점",
  IMAGE: "이미지",
  EITHER_OR: "양자택일",
  PRIVACY_CONSENT: "개인정보 동의",
} as const;

export function getActionTypeLabel(type: string): string {
  return ACTION_TYPE_LABELS[type as keyof typeof ACTION_TYPE_LABELS] || type;
}
