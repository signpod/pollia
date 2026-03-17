"use server";

import { resolveMissionActor } from "@/actions/common/auth";
import { handleActionError } from "@/actions/common/error";
import { missionResponseService } from "@/server/services/mission-response";
import { userService } from "@/server/services/user/userService";
import type { DeleteMissionResponseResponse } from "@/types/dto";
import { UserRole } from "@prisma/client";

export async function deleteMissionResponse(
  responseId: string,
): Promise<DeleteMissionResponseResponse> {
  try {
    const actor = await resolveMissionActor();
    const isAdmin = actor.userId
      ? (await userService.getUserById(actor.userId)).role === UserRole.ADMIN
      : false;
    await missionResponseService.deleteResponse(responseId, actor, isAdmin);
    return { message: "응답이 삭제되었습니다." };
  } catch (error) {
    return handleActionError(error, "응답 삭제 중 오류가 발생했습니다.");
  }
}
