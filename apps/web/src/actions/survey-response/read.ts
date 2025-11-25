"use server";

import { requireAuth } from "@/actions/common/auth";
import { surveyResponseService } from "@/server/services/survey-response/surveyResponseService";
import type {
  GetMyResponsesResponse,
  GetSurveyResponseResponse,
  GetSurveyResponsesResponse,
  GetSurveyStatsResponse,
} from "@/types/dto";

export async function getSurveyResponse(responseId: string): Promise<GetSurveyResponseResponse> {
  try {
    const user = await requireAuth();
    const response = await surveyResponseService.getResponseById(responseId, user.id);
    return { data: response };
  } catch (error) {
    console.error("getSurveyResponse error:", error);
    if (error instanceof Error && error.cause) {
      throw error;
    }
    const serverError = new Error("응답 조회 중 오류가 발생했습니다.");
    serverError.cause = 500;
    throw serverError;
  }
}

export async function getMyResponseForSurvey(
  surveyId: string,
): Promise<GetSurveyResponseResponse | { data: null }> {
  try {
    const user = await requireAuth();
    const response = await surveyResponseService.getResponseBySurveyAndUser(surveyId, user.id);
    return { data: response };
  } catch (error) {
    console.error("getMyResponseForSurvey error:", error);
    if (error instanceof Error && error.cause) {
      throw error;
    }
    const serverError = new Error("응답 조회 중 오류가 발생했습니다.");
    serverError.cause = 500;
    throw serverError;
  }
}

export async function getMyResponses(): Promise<GetMyResponsesResponse> {
  try {
    const user = await requireAuth();
    const responses = await surveyResponseService.getUserResponses(user.id);
    return { data: responses };
  } catch (error) {
    console.error("getMyResponses error:", error);
    if (error instanceof Error && error.cause) {
      throw error;
    }
    const serverError = new Error("응답 목록 조회 중 오류가 발생했습니다.");
    serverError.cause = 500;
    throw serverError;
  }
}

export async function getSurveyResponses(surveyId: string): Promise<GetSurveyResponsesResponse> {
  try {
    const user = await requireAuth();
    const responses = await surveyResponseService.getSurveyResponses(surveyId, user.id);
    return { data: responses };
  } catch (error) {
    console.error("getSurveyResponses error:", error);
    if (error instanceof Error && error.cause) {
      throw error;
    }
    const serverError = new Error("응답 목록 조회 중 오류가 발생했습니다.");
    serverError.cause = 500;
    throw serverError;
  }
}

export async function getSurveyStats(surveyId: string): Promise<GetSurveyStatsResponse> {
  try {
    const user = await requireAuth();
    const stats = await surveyResponseService.getSurveyStats(surveyId, user.id);
    return { data: stats };
  } catch (error) {
    console.error("getSurveyStats error:", error);
    if (error instanceof Error && error.cause) {
      throw error;
    }
    const serverError = new Error("통계 조회 중 오류가 발생했습니다.");
    serverError.cause = 500;
    throw serverError;
  }
}
