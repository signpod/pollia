import type { CreateMissionRequest } from "@/types/dto/mission";
import type { CreateMissionCompletionRequest } from "@/types/dto/mission-completion";

export interface CreateMissionFunnelFormData extends CreateMissionRequest {
  completion?: Omit<CreateMissionCompletionRequest, "missionId">;
}

export type Step = "basic" | "image" | "completion";

export const STEPS: Step[] = ["basic", "image", "completion"];

export const STEP_LABELS: Record<Step, string> = {
  basic: "기본 정보",
  image: "이미지",
  completion: "완료 화면",
};
