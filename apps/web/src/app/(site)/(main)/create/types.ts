export type Step = "basic" | "image" | "completion";

export const STEPS: Step[] = ["basic", "image", "completion"];

export const STEP_LABELS: Record<Step, string> = {
  basic: "기본 정보",
  image: "이미지",
  completion: "완료 화면",
};
