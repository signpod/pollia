import type { RewardInput, UpdateRewardInput } from "@/schemas/reward";

export type CreateRewardRequest = RewardInput & { missionId: string };

export type UpdateRewardRequest = UpdateRewardInput;
