"use server";

import { requireAuth } from "@/actions/common/auth";
import { surveyService } from "@/server/services/mission";
import type { UpdateSurveyInput } from "@/server/services/mission/types";

export interface UpdateSurveyRequest {
  title?: string;
  description?: string;
  target?: string;
  imageUrl?: string;
  deadline?: Date;
  estimatedMinutes?: number;
}

function toUpdateSurveyInput(dto: UpdateSurveyRequest): UpdateSurveyInput {
  return {
    title: dto.title,
    description: dto.description,
    target: dto.target,
    imageUrl: dto.imageUrl,
    deadline: dto.deadline,
    estimatedMinutes: dto.estimatedMinutes,
  };
}

export async function updateSurvey(surveyId: string, request: UpdateSurveyRequest) {
  try {
    const user = await requireAuth();
    const input = toUpdateSurveyInput(request);
    const updatedSurvey = await surveyService.updateSurvey(surveyId, input, user.id);
    return { data: updatedSurvey };
  } catch (error) {
    console.error("updateSurvey error:", error);
    if (error instanceof Error && error.cause) {
      throw error;
    }
    const serverError = new Error("설문조사 수정 중 오류가 발생했습니다.");
    serverError.cause = 500;
    throw serverError;
  }
}
