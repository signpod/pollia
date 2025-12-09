"use server";

import { requireAuth } from "@/actions/common/auth";
import { actionService } from "@/server/services/action";
import type { UpdateActionInput } from "@/server/services/action/types";

export interface UpdateQuestionOptionRequest {
  title: string;
  description?: string;
  imageUrl?: string;
  order: number;
  imageFileUploadId?: string;
}

export interface UpdateQuestionRequest {
  title?: string;
  description?: string;
  imageUrl?: string;
  order?: number;
  maxSelections?: number;
  options?: UpdateQuestionOptionRequest[];
}

function toUpdateActionInput(dto: UpdateQuestionRequest): UpdateActionInput {
  return {
    title: dto.title,
    description: dto.description,
    imageUrl: dto.imageUrl,
    order: dto.order,
    maxSelections: dto.maxSelections,
    options: dto.options,
  };
}

export async function updateAction(actionId: string, request: UpdateQuestionRequest) {
  try {
    const user = await requireAuth();
    const input = toUpdateActionInput(request);
    const updatedQuestion = await actionService.updateAction(actionId, input, user.id);
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
