"use server";

import { rewardService } from "@/server/services/reward/rewardService";
import type { GetRewardResponse, GetRewardsResponse } from "@/types/dto";

export async function getReward(rewardId: string): Promise<GetRewardResponse> {
  try {
    const reward = await rewardService.getReward(rewardId);
    return { data: reward };
  } catch (error) {
    console.error("getReward error:", error);
    if (error instanceof Error && error.cause) {
      throw error;
    }
    const serverError = new Error("Reward를 불러올 수 없습니다.");
    serverError.cause = 500;
    throw serverError;
  }
}

export async function getRewards(): Promise<GetRewardsResponse> {
  try {
    const rewards = await rewardService.getRewards();
    return { data: rewards };
  } catch (error) {
    console.error("getRewards error:", error);
    if (error instanceof Error && error.cause) {
      throw error;
    }
    const serverError = new Error("Reward 목록을 불러올 수 없습니다.");
    serverError.cause = 500;
    throw serverError;
  }
}
