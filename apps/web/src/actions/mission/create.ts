"use server";

import { requireActiveUser } from "@/actions/common/auth";
import { handleActionError } from "@/actions/common/error";
import UBIQUITOUS_CONSTANTS from "@/constants/ubiquitous";
import { missionService } from "@/server/services/mission";
import type { CreateMissionInput } from "@/server/services/mission/types";
import type { CreateMissionRequest, CreateMissionResponse } from "@/types/dto";

function toCreateMissionInput(dto: CreateMissionRequest): CreateMissionInput {
  return {
    ...dto,
    actionIds: dto.actionIds ?? [],
  };
}

export async function createMission(request: CreateMissionRequest): Promise<CreateMissionResponse> {
  try {
    const user = await requireActiveUser();
    const input = toCreateMissionInput(request);
    const mission = await missionService.createMission(input, user.id);
    return { data: mission };
  } catch (error) {
    return handleActionError(error, `${UBIQUITOUS_CONSTANTS.MISSION} 생성 중 오류가 발생했습니다.`);
  }
}
