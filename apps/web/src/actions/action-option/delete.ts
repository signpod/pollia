"use server";

import { requireActiveUser } from "@/actions/common/auth";
import { actionOptionService } from "@/server/services/action-option";

export async function deleteOption(optionId: string): Promise<{ message: string }> {
  try {
    const user = await requireActiveUser();

    await actionOptionService.deleteOption(optionId, user.id);

    return { message: "옵션이 삭제되었습니다." };
  } catch (error) {
    console.error("❌ 옵션 삭제 실패:", error);
    if (error instanceof Error && error.cause) {
      throw error;
    }
    const serverError = new Error("옵션 삭제 중 오류가 발생했습니다.");
    serverError.cause = 500;
    throw serverError;
  }
}

export async function deleteOptionsByQuestionId(questionId: string): Promise<{ message: string }> {
  try {
    const user = await requireActiveUser();

    await actionOptionService.deleteOptionsByActionId(questionId, user.id);

    return { message: "모든 옵션이 삭제되었습니다." };
  } catch (error) {
    console.error("❌ 옵션 목록 삭제 실패:", error);
    if (error instanceof Error && error.cause) {
      throw error;
    }
    const serverError = new Error("옵션 목록 삭제 중 오류가 발생했습니다.");
    serverError.cause = 500;
    throw serverError;
  }
}
