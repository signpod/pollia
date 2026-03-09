"use server";

import { requireActiveUser } from "@/actions/common/auth";
import { handleActionError } from "@/actions/common/error";
import UBIQUITOUS_CONSTANTS from "@/constants/ubiquitous";
import { missionService } from "@/server/services/mission";
import type { UpdateMissionInput } from "@/server/services/mission/types";
import type { UpdateMissionRequest } from "@/types/dto/mission";
import { revalidatePath } from "next/cache";

function toUpdateMissionInput(dto: UpdateMissionRequest): UpdateMissionInput {
  return { ...dto };
}

export async function updateMission(missionId: string, request: UpdateMissionRequest) {
  try {
    const user = await requireActiveUser();
    const input = toUpdateMissionInput(request);
    const updatedMission = await missionService.updateMission(missionId, input, user.id);

    revalidatePath(`/mission/${missionId}`);

    return { data: updatedMission };
  } catch (error) {
    return handleActionError(error, `${UBIQUITOUS_CONSTANTS.MISSION} 수정 중 오류가 발생했습니다.`);
  }
}

export async function setMissionPassword(missionId: string, password: string) {
  try {
    const user = await requireActiveUser();
    await missionService.setPassword(missionId, password, user.id);
    revalidatePath(`/mission/${missionId}`);
    return { success: true };
  } catch (error) {
    return handleActionError(error, "비밀번호 설정 중 오류가 발생했습니다.");
  }
}

export async function removeMissionPassword(missionId: string) {
  try {
    const user = await requireActiveUser();
    await missionService.removePassword(missionId, user.id);
    revalidatePath(`/mission/${missionId}`);
    return { success: true };
  } catch (error) {
    return handleActionError(error, "비밀번호 제거 중 오류가 발생했습니다.");
  }
}
