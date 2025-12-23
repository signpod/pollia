"use server";

import { requireAuth } from "@/actions/common/auth";
import { missionService } from "@/server/services/mission";
import type { UpdateMissionInput } from "@/server/services/mission/types";
import type { MissionType } from "@prisma/client";

export interface UpdateMissionRequest {
  title?: string;
  description?: string;
  target?: string;
  imageUrl?: string;
  imageFileUploadId?: string;
  brandLogoUrl?: string;
  brandLogoFileUploadId?: string;
  deadline?: Date;
  estimatedMinutes?: number;
  maxParticipants?: number | null;
  type?: MissionType;
  isActive?: boolean;
  rewardId?: string | null;
}

function toUpdateMissionInput(dto: UpdateMissionRequest): UpdateMissionInput {
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
    maxParticipants: dto.maxParticipants,
    type: dto.type,
    isActive: dto.isActive,
    rewardId: dto.rewardId,
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

export async function setMissionPassword(missionId: string, password: string) {
  try {
    const user = await requireAuth();
    await missionService.setPassword(missionId, password, user.id);
    return { success: true };
  } catch (error) {
    console.error("setMissionPassword error:", error);
    if (error instanceof Error && error.cause) {
      throw error;
    }
    const serverError = new Error("비밀번호 설정 중 오류가 발생했습니다.");
    serverError.cause = 500;
    throw serverError;
  }
}

export async function removeMissionPassword(missionId: string) {
  try {
    const user = await requireAuth();
    await missionService.removePassword(missionId, user.id);
    return { success: true };
  } catch (error) {
    console.error("removeMissionPassword error:", error);
    if (error instanceof Error && error.cause) {
      throw error;
    }
    const serverError = new Error("비밀번호 제거 중 오류가 발생했습니다.");
    serverError.cause = 500;
    throw serverError;
  }
}
