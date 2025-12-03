"use server";

import { requireAuth } from "@/actions/common/auth";
import { surveyQuestionService } from "@/server/services/action";
import type { UpdateQuestionInput } from "@/server/services/action/types";

export interface UpdateQuestionRequest {
  title?: string;
  description?: string;
  imageUrl?: string;
  order?: number;
  maxSelections?: number;
}

function toUpdateQuestionInput(dto: UpdateQuestionRequest): UpdateQuestionInput {
  return {
    title: dto.title,
    description: dto.description,
    imageUrl: dto.imageUrl,
    order: dto.order,
    maxSelections: dto.maxSelections,
  };
}

export async function updateQuestion(questionId: string, request: UpdateQuestionRequest) {
  try {
    const user = await requireAuth();
    const input = toUpdateQuestionInput(request);
    const updatedQuestion = await surveyQuestionService.updateQuestion(questionId, input, user.id);
    return { data: updatedQuestion };
  } catch (error) {
    console.error("updateQuestion error:", error);
    if (error instanceof Error && error.cause) {
      throw error;
    }
    const serverError = new Error("질문 수정 중 오류가 발생했습니다.");
    serverError.cause = 500;
    throw serverError;
  }
}
