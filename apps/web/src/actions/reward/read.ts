"use server";

import { handleActionError } from "@/actions/common/error";
import { rewardService } from "@/server/services/reward/rewardService";

export async function getReward(rewardId: string) {
  try {
    const reward = await rewardService.getReward(rewardId);
    return { data: reward };
  } catch (error) {
    return handleActionError(error, "Reward를 불러올 수 없습니다.");
  }
}

export async function getRewards() {
  try {
    const rewards = await rewardService.getRewards();
    return { data: rewards };
  } catch (error) {
    return handleActionError(error, "Reward 목록을 불러올 수 없습니다.");
  }
}
