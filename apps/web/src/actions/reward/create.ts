"use server";

import { requireContentManager } from "@/actions/common/auth";
import { handleActionError } from "@/actions/common/error";
import { updateMission } from "@/actions/mission/update";
import { rewardService } from "@/server/services/reward/rewardService";
import type { CreateRewardRequest } from "@/types/dto";

export async function createReward(request: CreateRewardRequest) {
  try {
    const { user } = await requireContentManager();
    const { missionId, ...input } = request;
    const reward = await rewardService.createReward(input, user.id);

    await updateMission(missionId, { rewardId: reward.id });

    return { data: reward };
  } catch (error) {
    return handleActionError(error, "Reward 생성 중 오류가 발생했습니다.");
  }
}
