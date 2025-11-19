"use server";

import { requireAuth } from "@/actions/common/auth";
import { rewardService } from "@/server/services/reward/rewardService";
import type { CreateRewardRequest, CreateRewardResponse } from "@/types/dto";

/**
 * Reward 생성 Server Action
 * @param request - Reward 생성 요청 데이터
 * @returns 생성된 Reward 정보
 */
export async function createReward(request: CreateRewardRequest): Promise<CreateRewardResponse> {
  try {
    await requireAuth();

    const reward = await rewardService.createReward({
      name: request.name,
      description: request.description,
      imageUrl: request.imageUrl,
      paymentType: request.paymentType,
      scheduledDate: request.scheduledDate,
    });

    return { data: reward };
  } catch (error) {
    console.error("❌ Reward 생성 실패:", error);
    if (error instanceof Error && error.cause) {
      throw error;
    }
    const serverError = new Error("Reward 생성 중 오류가 발생했습니다.");
    serverError.cause = 500;
    throw serverError;
  }
}
