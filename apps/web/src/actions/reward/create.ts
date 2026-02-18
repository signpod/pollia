"use server";

import { requireActiveUser } from "@/actions/common/auth";
import { updateMission } from "@/actions/mission/update";
import { rewardService } from "@/server/services/reward/rewardService";
import type { CreateRewardRequest } from "@/types/dto";

export async function createReward(request: CreateRewardRequest) {
  try {
    const user = await requireActiveUser();
    const { missionId, ...input } = request;
    const reward = await rewardService.createReward(input, user.id);

    await updateMission(missionId, { rewardId: reward.id });

    return { data: reward };
  } catch (error) {
    console.error("createReward error:", error);
    if (error instanceof Error && error.cause) {
      throw error;
    }
    const serverError = new Error("Reward 생성 중 오류가 발생했습니다.");
    serverError.cause = 500;
    throw serverError;
  }
}
