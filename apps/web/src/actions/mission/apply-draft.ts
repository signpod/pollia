"use server";

import { requireActiveUser } from "@/actions/common/auth";
import { actionService } from "@/server/services/action";

export async function applyMissionActionSectionDraft(missionId: string) {
  try {
    const user = await requireActiveUser();
    const result = await actionService.applyActionSectionDraft(missionId, user.id);
    return { data: result };
  } catch (error) {
    console.error("action section draft 적용 실패:", error);
    if (error instanceof Error && error.cause) {
      throw error;
    }
    const serverError = new Error("draft 적용 중 오류가 발생했습니다.");
    serverError.cause = 500;
    throw serverError;
  }
}
