"use server";

import { requireAuth } from "@/actions/common/auth";
import { surveyService } from "@/server/services/mission";
import type { CreateSurveyInput } from "@/server/services/mission/types";
import type { CreateSurveyRequest, CreateSurveyResponse } from "@/types/dto";

function toCreateSurveyInput(dto: CreateSurveyRequest): CreateSurveyInput {
  return {
    title: dto.title,
    description: dto.description,
    target: dto.target,
    imageUrl: dto.imageUrl,
    deadline: dto.deadline,
    estimatedMinutes: dto.estimatedMinutes,
    questionIds: dto.questionIds,
  };
}

export async function createSurvey(request: CreateSurveyRequest): Promise<CreateSurveyResponse> {
  try {
    const user = await requireAuth();
    const input = toCreateSurveyInput(request);
    const survey = await surveyService.createSurvey(input, user.id);
    return { data: survey };
  } catch (error) {
    console.error("createSurvey error:", error);
    if (error instanceof Error && error.cause) {
      throw error;
    }
    const serverError = new Error("설문지 생성 중 오류가 발생했습니다.");
    serverError.cause = 500;
    throw serverError;
  }
}
