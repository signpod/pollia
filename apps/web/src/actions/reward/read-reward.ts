"use server";

import { rewardService } from "@/server/services/reward/rewardService";
import type { GetRewardResponse, GetRewardsResponse } from "@/types/dto";

/**
 * Reward 단일 조회 Server Action
 * @param rewardId - Reward ID
 * @returns Reward 정보
 */
export async function getReward(rewardId: string): Promise<GetRewardResponse> {
  try {
    const reward = await rewardService.getReward(rewardId);
    return { data: reward };
  } catch (error) {
    console.error("❌ Reward 조회 실패:", error);
    if (error instanceof Error && error.cause) {
      throw error;
    }
    const serverError = new Error("Reward를 불러올 수 없습니다.");
    serverError.cause = 500;
    throw serverError;
  }
}

/**
 * Reward 목록 조회 Server Action
 * @returns Reward 목록
 */
export async function getRewards(): Promise<GetRewardsResponse> {
  try {
    const rewards = await rewardService.getRewards();
    return { data: rewards };
  } catch (error) {
    console.error("❌ Reward 목록 조회 실패:", error);
    if (error instanceof Error && error.cause) {
      throw error;
    }
    const serverError = new Error("Reward 목록을 불러올 수 없습니다.");
    serverError.cause = 500;
    throw serverError;
  }
}
