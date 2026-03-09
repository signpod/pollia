"use server";

import { handleActionError } from "@/actions/common/error";
import { actionOptionService } from "@/server/services/action-option";
import type { ActionOption } from "@prisma/client";

export async function getOptionById(optionId: string): Promise<{ data: ActionOption }> {
  try {
    const option = await actionOptionService.getOptionById(optionId);
    return { data: option };
  } catch (error) {
    return handleActionError(error, "옵션을 불러올 수 없습니다.");
  }
}

export async function getOptionsByQuestionId(
  questionId: string,
): Promise<{ data: ActionOption[] }> {
  try {
    const options = await actionOptionService.getOptionsByActionId(questionId);
    return { data: options };
  } catch (error) {
    return handleActionError(error, "옵션 목록을 불러올 수 없습니다.");
  }
}
