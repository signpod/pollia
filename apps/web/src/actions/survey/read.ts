"use server";

import { requireAuth } from "@/actions/common/auth";
import { surveyService } from "@/server/services/mission";
import type { GetUserSurveysOptions } from "@/server/services/mission/types";
import type { SortOrderType } from "@/types/common/sort";
import type { GetSurveyResponse, GetUserSurveysResponse } from "@/types/dto";

export interface GetUserSurveysRequest {
  cursor?: string;
  limit?: number;
  sortOrder?: SortOrderType;
}

function toGetUserSurveysOptions(dto: GetUserSurveysRequest): GetUserSurveysOptions {
  return {
    cursor: dto.cursor,
    limit: dto.limit,
    sortOrder: dto.sortOrder,
  };
}

export async function getUserSurveys(
  request?: GetUserSurveysRequest,
): Promise<GetUserSurveysResponse & { nextCursor?: string }> {
  try {
    const user = await requireAuth();
    const limit = request?.limit ?? 10;
    const options = request
      ? toGetUserSurveysOptions({ ...request, limit: limit + 1 })
      : { limit: limit + 1 };

    const surveys = await surveyService.getUserSurveys(user.id, options);

    let nextCursor: string | undefined = undefined;
    if (surveys.length > limit) {
      const nextItem = surveys.pop();
      nextCursor = nextItem?.id;
    }

    return { data: surveys, nextCursor };
  } catch (error) {
    console.error("getUserSurveys error:", error);
    if (error instanceof Error && error.cause) {
      throw error;
    }
    const serverError = new Error("설문조사 목록을 불러올 수 없습니다.");
    serverError.cause = 500;
    throw serverError;
  }
}

export async function getSurvey(surveyId: string): Promise<GetSurveyResponse> {
  try {
    const survey = await surveyService.getSurvey(surveyId);
    return { data: survey };
  } catch (error) {
    console.error("❌ 설문조사 조회 실패:", error);
    if (error instanceof Error && error.cause) {
      throw error;
    }
    const serverError = new Error("설문조사를 불러올 수 없습니다.");
    serverError.cause = 500;
    throw serverError;
  }
}
