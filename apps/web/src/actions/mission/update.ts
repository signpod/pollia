"use server";

import { requireAuth } from "@/actions/common/auth";
import { missionService } from "@/server/services/mission";
import type { UpdateMissionInput } from "@/server/services/mission/types";

export interface UpdateMissionRequest {
  title?: string;
  description?: string;
  target?: string;
  imageUrl?: string;
  brandLogoUrl?: string;
  deadline?: Date;
  estimatedMinutes?: number;
  isActive?: boolean;
}

function toUpdateMissionInput(dto: UpdateMissionRequest): UpdateMissionInput {
  return {
    title: dto.title,
    description: dto.description,
    target: dto.target,
    imageUrl: dto.imageUrl,
    brandLogoUrl: dto.brandLogoUrl,
    deadline: dto.deadline,
    estimatedMinutes: dto.estimatedMinutes,
    isActive: dto.isActive,
  };
}

export async function updateMission(missionId: string, request: UpdateMissionRequest) {
  try {
    const user = await requireAuth();
    const input = toUpdateMissionInput(request);
    const updatedMission = await missionService.updateMission(missionId, input, user.id);
    return { data: updatedMission };
  } catch (error) {
    console.error("updateMission error:", error);
    if (error instanceof Error && error.cause) {
      throw error;
    }
    const serverError = new Error("미션 수정 중 오류가 발생했습니다.");
    serverError.cause = 500;
    throw serverError;
  }
}
