"use server";

import { actionOptionService } from "@/server/services/action-option";
import type { ActionOption } from "@prisma/client";

export async function getOptionById(optionId: string): Promise<{ data: ActionOption }> {
  try {
    const option = await actionOptionService.getOptionById(optionId);
    return { data: option };
  } catch (error) {
    console.error("❌ 옵션 조회 실패:", error);
    if (error instanceof Error && error.cause) {
      throw error;
    }
    const serverError = new Error("옵션을 불러올 수 없습니다.");
    serverError.cause = 500;
    throw serverError;
  }
}

export async function getOptionsByQuestionId(
  questionId: string,
): Promise<{ data: ActionOption[] }> {
  try {
    const options = await actionOptionService.getOptionsByActionId(questionId);
    return { data: options };
  } catch (error) {
    console.error("❌ 질문 옵션 조회 실패:", error);
    if (error instanceof Error && error.cause) {
      throw error;
    }
    const serverError = new Error("옵션 목록을 불러올 수 없습니다.");
    serverError.cause = 500;
    throw serverError;
  }
}
