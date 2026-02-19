"use server";

import { requireActiveUser } from "@/actions/common/auth";
import { missionResponseService } from "@/server/services/mission-response";
import type {
  GetMissionResponseResponse,
  GetMissionResponsesResponse,
  GetMissionStatsResponse,
  GetMyMissionResponsesResponse,
} from "@/types/dto";

export async function getMissionResponse(responseId: string): Promise<GetMissionResponseResponse> {
  try {
    const user = await requireActiveUser();
    const response = await missionResponseService.getResponseById(responseId, user.id);
    return { data: response };
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
): Promise<GetMissionResponseResponse | { data: null }> {
  try {
    const user = await requireActiveUser();
    const response = await missionResponseService.getResponseByMissionAndUser(missionId, user.id);
    if (!response) {
      return { data: null };
    }
    return { data: response };
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

export async function getMyResponses(): Promise<GetMyMissionResponsesResponse> {
  try {
    const user = await requireActiveUser();
    const responses = await missionResponseService.getUserResponses(user.id);
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

export async function getMissionResponses(missionId: string): Promise<GetMissionResponsesResponse> {
  try {
    const user = await requireActiveUser();
    const responses = await missionResponseService.getMissionResponses(missionId, user.id);
    return { data: responses };
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

export async function getMissionStats(missionId: string): Promise<GetMissionStatsResponse> {
  try {
    const user = await requireActiveUser();
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
