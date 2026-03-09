"use server";

import { requireActiveUser } from "@/actions/common/auth";
import { handleActionError } from "@/actions/common/error";
import { actionAnswerService } from "@/server/services/action-answer";

export async function deleteAnswer(answerId: string): Promise<{ message: string }> {
  try {
    const user = await requireActiveUser();
    await actionAnswerService.deleteAnswer(answerId, user.id);
    return { message: "답변이 삭제되었습니다." };
  } catch (error) {
    return handleActionError(error, "답변 삭제 중 오류가 발생했습니다.");
  }
}

export async function deleteAnswersByResponse(responseId: string): Promise<{ message: string }> {
  try {
    const user = await requireActiveUser();
    await actionAnswerService.deleteAnswersByResponseId(responseId, user.id);
    return { message: "답변들이 삭제되었습니다." };
  } catch (error) {
    return handleActionError(error, "답변 삭제 중 오류가 발생했습니다.");
  }
}
