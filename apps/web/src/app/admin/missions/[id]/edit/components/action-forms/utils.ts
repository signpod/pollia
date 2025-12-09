export function getActionTypeLabel(type: string): string {
  const labels: Record<string, string> = {
    MULTIPLE_CHOICE: "객관식",
    SUBJECTIVE: "주관식",
    SCALE: "척도",
    RATING: "평가",
    TAG: "태그",
    IMAGE: "이미지 업로드",
  };
  return labels[type] || type;
}
