"use server";

import { requireActiveUser } from "@/actions/common/auth";
import { actionService } from "@/server/services/action";
import { revalidatePath } from "next/cache";

export async function deleteAction(actionId: string) {
  try {
    const user = await requireActiveUser();

    const action = await actionService.getActionById(actionId);
    if (!action) {
      const error = new Error("액션을 찾을 수 없습니다.");
      error.cause = 404;
      throw error;
    }

    const missionId = action.missionId;

    await actionService.deleteAction(actionId, user.id);

    if (missionId) {
      revalidatePath(`/mission/${missionId}`);
      revalidatePath(`/mission/${missionId}/action/${actionId}`);
    }

    return { message: "질문이 삭제되었습니다." };
  } catch (error) {
    console.error("❌ 질문 삭제 실패:", error);
    if (error instanceof Error && error.cause) {
      throw error;
    }
    const serverError = new Error("질문 삭제 중 오류가 발생했습니다.");
    serverError.cause = 500;
    throw serverError;
  }
}
