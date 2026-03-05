"use server";

import { requireActiveUser } from "@/actions/common/auth";
import { rewardService } from "@/server/services/reward/rewardService";
import type { UpdateRewardRequest } from "@/types/dto";

export async function updateReward(rewardId: string, request: UpdateRewardRequest) {
  try {
    const user = await requireActiveUser();
    const reward = await rewardService.updateReward(rewardId, request, user.id);
    return { data: reward };
  } catch (error) {
    console.error("updateReward error:", error);
    if (error instanceof Error && error.cause) {
      throw error;
    }
    const serverError = new Error("Reward 수정 중 오류가 발생했습니다.");
    serverError.cause = 500;
    throw serverError;
  }
}
