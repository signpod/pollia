"use server";

import { requireAuth } from "@/actions/common/auth";
import { surveyService } from "@/server/services/survey/surveyService";
import type { GetUserSurveysOptions } from "@/server/services/survey/types";
import type { SortOrderType } from "@/types/common/sort";
import type {
  GetQuestionByIdResponse,
  GetSurveyQuestionIdsResponse,
  GetSurveyQuestionsDetailResponse,
  GetSurveyResponse,
  GetUserSurveysResponse,
} from "@/types/dto";

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
    const options = request ? toGetUserSurveysOptions({ ...request, limit: limit + 1 }) : { limit: limit + 1 };

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
    console.error("getSurvey error:", error);
    if (error instanceof Error && error.cause) {
      throw error;
    }
    const serverError = new Error("설문조사를 불러올 수 없습니다.");
    serverError.cause = 500;
    throw serverError;
  }
}

export async function getSurveyQuestionIds(surveyId: string): Promise<GetSurveyQuestionIdsResponse> {
  try {
    const data = await surveyService.getSurveyQuestionIds(surveyId);
    return { data };
  } catch (error) {
    console.error("getSurveyQuestionIds error:", error);
    if (error instanceof Error && error.cause) {
      throw error;
    }
    const serverError = new Error("설문 질문 ID 목록을 불러올 수 없습니다.");
    serverError.cause = 500;
    throw serverError;
  }
}

export async function getQuestionById(questionId: string): Promise<GetQuestionByIdResponse> {
  try {
    const question = await surveyService.getQuestionById(questionId);
    return { data: question };
  } catch (error) {
    console.error("getQuestionById error:", error);
    if (error instanceof Error && error.cause) {
      throw error;
    }
    const serverError = new Error("질문을 불러올 수 없습니다.");
    serverError.cause = 500;
    throw serverError;
  }
}

export async function getSurveyQuestionsDetail(
  surveyId: string,
): Promise<GetSurveyQuestionsDetailResponse> {
  try {
    const questions = await surveyService.getSurveyQuestionsDetail(surveyId);
    return { data: questions };
  } catch (error) {
    console.error("getSurveyQuestionsDetail error:", error);
    if (error instanceof Error && error.cause) {
      throw error;
    }
    const serverError = new Error("설문 질문 상세 목록을 불러올 수 없습니다.");
    serverError.cause = 500;
    throw serverError;
  }
}
