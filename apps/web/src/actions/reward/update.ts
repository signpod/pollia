"use server";

import { requireAuth } from "@/actions/common/auth";
import { rewardService } from "@/server/services/reward/rewardService";
import type { UpdateRewardRequest, UpdateRewardResponse } from "@/types/dto";

/**
 * Reward 수정 Server Action
 * @param rewardId - Reward ID
 * @param request - Reward 수정 요청 데이터
 * @returns 수정된 Reward 정보
 */
export async function updateReward(
  rewardId: string,
  request: UpdateRewardRequest,
): Promise<UpdateRewardResponse> {
  try {
    await requireAuth();

    const reward = await rewardService.updateReward(rewardId, {
      name: request.name,
      description: request.description,
      imageUrl: request.imageUrl,
      paymentType: request.paymentType,
      scheduledDate: request.scheduledDate,
    });

    return { data: reward };
  } catch (error) {
    console.error("❌ Reward 수정 실패:", error);
    if (error instanceof Error && error.cause) {
      throw error;
    }
    const serverError = new Error("Reward 수정 중 오류가 발생했습니다.");
    serverError.cause = 500;
    throw serverError;
  }
}

