"use server";

import { requireAuth } from "@/actions/common/auth";
import { actionService } from "@/server/services/action";
import type { UpdateActionRequest } from "@/types/dto/action";
import { revalidatePath } from "next/cache";

export async function updateAction(actionId: string, request: UpdateActionRequest) {
  try {
    const user = await requireAuth();
    const updatedQuestion = await actionService.updateAction(actionId, request, user.id);

    if (updatedQuestion.missionId) {
      revalidatePath(`/mission/${updatedQuestion.missionId}`);
      revalidatePath(`/mission/${updatedQuestion.missionId}/action/${actionId}`);
    }

    return { data: updatedQuestion };
  } catch (error) {
    console.error("updateAction error:", error);
    if (error instanceof Error && error.cause) {
      throw error;
    }
    const serverError = new Error("질문 수정 중 오류가 발생했습니다.");
    serverError.cause = 500;
    throw serverError;
  }
}
