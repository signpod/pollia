"use server";

import { requireContentManager } from "@/actions/common/auth";
import { handleActionError } from "@/actions/common/error";
import { actionOptionService } from "@/server/services/action-option";

export async function deleteOption(optionId: string): Promise<{ message: string }> {
  try {
    const { user, isAdmin } = await requireContentManager();

    await actionOptionService.deleteOption(optionId, user.id, isAdmin);

    return { message: "옵션이 삭제되었습니다." };
  } catch (error) {
    return handleActionError(error, "옵션 삭제 중 오류가 발생했습니다.");
  }
}

export async function deleteOptionsByQuestionId(questionId: string): Promise<{ message: string }> {
  try {
    const { user, isAdmin } = await requireContentManager();

    await actionOptionService.deleteOptionsByActionId(questionId, user.id, isAdmin);

    return { message: "모든 옵션이 삭제되었습니다." };
  } catch (error) {
    return handleActionError(error, "옵션 목록 삭제 중 오류가 발생했습니다.");
  }
}
