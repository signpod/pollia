"use server";

import { requireContentManager } from "@/actions/common/auth";
import { handleActionError } from "@/actions/common/error";
import { actionService } from "@/server/services/action";

export async function applyMissionActionSectionDraft(missionId: string) {
  try {
    const { user, isAdmin } = await requireContentManager();
    const result = await actionService.applyActionSectionDraft(missionId, user.id, isAdmin);
    return { data: result };
  } catch (error) {
    return handleActionError(error, "draft 적용 중 오류가 발생했습니다.");
  }
}
