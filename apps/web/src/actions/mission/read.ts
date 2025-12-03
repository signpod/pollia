"use server";

import { requireAuth } from "@/actions/common/auth";
import { missionService } from "@/server/services/mission";
import type { GetUserMissionsOptions } from "@/server/services/mission/types";
import type { SortOrderType } from "@/types/common/sort";
import type { GetSurveyResponse, GetUserSurveysResponse } from "@/types/dto";

export interface GetUserMissionsRequest {
  cursor?: string;
  limit?: number;
  sortOrder?: SortOrderType;
}

function toGetUserMissionsOptions(dto: GetUserMissionsRequest): GetUserMissionsOptions {
  return {
    cursor: dto.cursor,
    limit: dto.limit,
    sortOrder: dto.sortOrder,
  };
}

export async function getUserMissions(
  request?: GetUserMissionsRequest,
): Promise<GetUserSurveysResponse & { nextCursor?: string }> {
  try {
    const user = await requireAuth();
    const limit = request?.limit ?? 10;
    const options = request
      ? toGetUserMissionsOptions({ ...request, limit: limit + 1 })
      : { limit: limit + 1 };

    const missions = await missionService.getUserMissions(user.id, options);

    let nextCursor: string | undefined = undefined;
    if (missions.length > limit) {
      const nextItem = missions.pop();
      nextCursor = nextItem?.id;
    }

    return { data: missions, nextCursor };
  } catch (error) {
    console.error("getUserMissions error:", error);
    if (error instanceof Error && error.cause) {
      throw error;
    }
    const serverError = new Error("미션 목록을 불러올 수 없습니다.");
    serverError.cause = 500;
    throw serverError;
  }
}

export async function getMission(missionId: string): Promise<GetSurveyResponse> {
  try {
    const mission = await missionService.getMission(missionId);
    return { data: mission };
  } catch (error) {
    console.error("❌ 미션 조회 실패:", error);
    if (error instanceof Error && error.cause) {
      throw error;
    }
    const serverError = new Error("미션을 불러올 수 없습니다.");
    serverError.cause = 500;
    throw serverError;
  }
}
