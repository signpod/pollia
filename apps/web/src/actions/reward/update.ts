"use server";

import { requireAuth } from "@/actions/common/auth";
import { rewardService } from "@/server/services/reward/rewardService";
import type { UpdateRewardInput } from "@/server/services/reward/types";
import type { UpdateRewardRequest, UpdateRewardResponse } from "@/types/dto";

function toUpdateRewardInput(dto: UpdateRewardRequest): UpdateRewardInput {
  return {
    name: dto.name,
    description: dto.description,
    imageUrl: dto.imageUrl,
    imageFileUploadId: dto.imageFileUploadId,
    paymentType: dto.paymentType,
    scheduledDate: dto.scheduledDate,
  };
}

export async function updateReward(
  rewardId: string,
  request: UpdateRewardRequest,
): Promise<UpdateRewardResponse> {
  try {
    const user = await requireAuth();
    const input = toUpdateRewardInput(request);
    const reward = await rewardService.updateReward(rewardId, input, user.id);
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
