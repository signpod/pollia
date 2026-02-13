import type { ToggleMissionLikeInput } from "@/schemas/mission-like";

export type ToggleMissionLikeRequest = ToggleMissionLikeInput;

export interface ToggleMissionLikeResponse {
  data: {
    liked: boolean;
    likesCount: number;
  };
}
