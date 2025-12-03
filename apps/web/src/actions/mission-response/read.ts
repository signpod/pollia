"use server";

import { requireAuth } from "@/actions/common/auth";
import { missionResponseService } from "@/server/services/mission-response";
import type {
  GetMyResponsesResponse,
  GetSurveyResponseResponse,
  GetSurveyResponsesResponse,
  GetSurveyStatsResponse,
} from "@/types/dto";

export async function getMissionResponse(responseId: string): Promise<GetSurveyResponseResponse> {
  try {
    const user = await requireAuth();
    const response = await missionResponseService.getResponseById(responseId, user.id);
    const data = { ...response, surveyId: response.missionId };
    return { data };
  } catch (error) {
    console.error("getMissionResponse error:", error);
    if (error instanceof Error && error.cause) {
      throw error;
    }
    const serverError = new Error("응답 조회 중 오류가 발생했습니다.");
    serverError.cause = 500;
    throw serverError;
  }
}

export async function getMyResponseForMission(
  missionId: string,
): Promise<GetSurveyResponseResponse | { data: null }> {
  try {
    const user = await requireAuth();
    const response = await missionResponseService.getResponseByMissionAndUser(missionId, user.id);
    if (!response) {
      return { data: null };
    }
    const data = { ...response, surveyId: response.missionId };
    return { data };
  } catch (error) {
    console.error("getMyResponseForMission error:", error);
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
    const responses = await missionResponseService.getUserResponses(user.id);
    const data = responses.map(response => ({ ...response, surveyId: response.missionId }));
    return { data };
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

export async function getMissionResponses(missionId: string): Promise<GetSurveyResponsesResponse> {
  try {
    const user = await requireAuth();
    const responses = await missionResponseService.getMissionResponses(missionId, user.id);
    const data = responses.map(response => ({ ...response, surveyId: response.missionId }));
    return { data };
  } catch (error) {
    console.error("getMissionResponses error:", error);
    if (error instanceof Error && error.cause) {
      throw error;
    }
    const serverError = new Error("응답 목록 조회 중 오류가 발생했습니다.");
    serverError.cause = 500;
    throw serverError;
  }
}

export async function getMissionStats(missionId: string): Promise<GetSurveyStatsResponse> {
  try {
    const user = await requireAuth();
    const stats = await missionResponseService.getMissionStats(missionId, user.id);
    return { data: stats };
  } catch (error) {
    console.error("getMissionStats error:", error);
    if (error instanceof Error && error.cause) {
      throw error;
    }
    const serverError = new Error("통계 조회 중 오류가 발생했습니다.");
    serverError.cause = 500;
    throw serverError;
  }
}
