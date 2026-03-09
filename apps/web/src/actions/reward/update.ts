"use server";

import { requireActiveUser } from "@/actions/common/auth";
import { handleActionError } from "@/actions/common/error";
import { rewardService } from "@/server/services/reward/rewardService";
import type { UpdateRewardRequest } from "@/types/dto";

export async function updateReward(rewardId: string, request: UpdateRewardRequest) {
  try {
    const user = await requireActiveUser();
    const reward = await rewardService.updateReward(rewardId, request, user.id);
    return { data: reward };
  } catch (error) {
    return handleActionError(error, "Reward 수정 중 오류가 발생했습니다.");
  }
}
