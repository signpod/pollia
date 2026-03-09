"use server";

import { requireActiveUser } from "@/actions/common/auth";
import { handleActionError } from "@/actions/common/error";
import { actionService } from "@/server/services/action";

export async function applyMissionActionSectionDraft(missionId: string) {
  try {
    const user = await requireActiveUser();
    const result = await actionService.applyActionSectionDraft(missionId, user.id);
    return { data: result };
  } catch (error) {
    return handleActionError(error, "draft 적용 중 오류가 발생했습니다.");
  }
}
