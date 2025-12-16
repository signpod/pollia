"use server";

import { requireAuth } from "@/actions/common/auth";
import { missionService } from "@/server/services/mission";
import type { CreateMissionInput } from "@/server/services/mission/types";
import type { CreateMissionRequest, CreateMissionResponse } from "@/types/dto";

function toCreateMissionInput(dto: CreateMissionRequest): CreateMissionInput {
  return {
    title: dto.title,
    description: dto.description,
    target: dto.target,
    imageUrl: dto.imageUrl,
    imageFileUploadId: dto.imageFileUploadId,
    brandLogoUrl: dto.brandLogoUrl,
    brandLogoFileUploadId: dto.brandLogoFileUploadId,
    deadline: dto.deadline,
    estimatedMinutes: dto.estimatedMinutes,
    type: dto.type,
    actionIds: dto.actionIds ?? [],
  };
}

export async function createMission(request: CreateMissionRequest): Promise<CreateMissionResponse> {
  try {
    const user = await requireAuth();
    const input = toCreateMissionInput(request);
    const mission = await missionService.createMission(input, user.id);
    return { data: mission };
  } catch (error) {
    console.error("createMission error:", error);
    if (error instanceof Error && error.cause) {
      throw error;
    }
    const serverError = new Error("미션 생성 중 오류가 발생했습니다.");
    serverError.cause = 500;
    throw serverError;
  }
}
