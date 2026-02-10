"use server";

import { requireAuth } from "@/actions/common/auth";
import { updateMission } from "@/actions/mission/update";
import type { CreateRewardInput } from "@/schemas/reward";
import { rewardService } from "@/server/services/reward/rewardService";
import type { CreateRewardRequest, CreateRewardResponse } from "@/types/dto";

function toCreateRewardInput(dto: CreateRewardRequest): CreateRewardInput {
  return {
    name: dto.name,
    description: dto.description,
    imageUrl: dto.imageUrl,
    imageFileUploadId: dto.imageFileUploadId,
    paymentType: dto.paymentType,
    scheduledDate: dto.scheduledDate,
  };
}

export async function createReward(request: CreateRewardRequest): Promise<CreateRewardResponse> {
  try {
    const user = await requireAuth();
    const input = toCreateRewardInput(request);
    const reward = await rewardService.createReward(input, user.id);

    await updateMission(request.missionId, { rewardId: reward.id });

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
