"use server";

import { requireAuth } from "@/actions/common/auth";
import { actionService } from "@/server/services/action";

export async function deleteAction(actionId: string) {
  try {
    const user = await requireAuth();

    await actionService.deleteAction(actionId, user.id);

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
