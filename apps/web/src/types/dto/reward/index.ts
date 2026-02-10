import type { RewardInput, RewardUpdate } from "@/schemas/reward";

export type CreateRewardRequest = RewardInput & { missionId: string };

export type UpdateRewardRequest = RewardUpdate;
