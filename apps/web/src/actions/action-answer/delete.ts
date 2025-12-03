"use server";

import { requireAuth } from "@/actions/common/auth";
import { actionAnswerService } from "@/server/services/action-answer";

export async function deleteAnswer(answerId: string): Promise<{ message: string }> {
  try {
    const user = await requireAuth();
    await actionAnswerService.deleteAnswer(answerId, user.id);
    return { message: "답변이 삭제되었습니다." };
  } catch (error) {
    console.error("deleteAnswer error:", error);
    if (error instanceof Error && error.cause) {
      throw error;
    }
    const serverError = new Error("답변 삭제 중 오류가 발생했습니다.");
    serverError.cause = 500;
    throw serverError;
  }
}

export async function deleteAnswersByResponse(responseId: string): Promise<{ message: string }> {
  try {
    const user = await requireAuth();
    await actionAnswerService.deleteAnswersByResponseId(responseId, user.id);
    return { message: "답변들이 삭제되었습니다." };
  } catch (error) {
    console.error("deleteAnswersByResponse error:", error);
    if (error instanceof Error && error.cause) {
      throw error;
    }
    const serverError = new Error("답변 삭제 중 오류가 발생했습니다.");
    serverError.cause = 500;
    throw serverError;
  }
}
