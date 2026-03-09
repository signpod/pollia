"use server";

import { requireActiveUser } from "@/actions/common/auth";
import { handleActionError } from "@/actions/common/error";
import UBIQUITOUS_CONSTANTS from "@/constants/ubiquitous";
import { missionService } from "@/server/services/mission";
import { missionNotionPageService } from "@/server/services/mission-notion-page";
import type { GetUserMissionsOptions } from "@/server/services/mission/types";
import type { SortOrderType } from "@/types/common/sort";
import type {
  GetMissionNotionPageResponse,
  GetMissionParticipantInfoResponse,
  GetMissionResponse,
  GetUserMissionsResponse,
} from "@/types/dto";
import type { MissionCategory, MissionType } from "@prisma/client";

export interface GetUserMissionsRequest {
  cursor?: string;
  limit?: number;
  sortOrder?: SortOrderType;
  category?: MissionCategory;
  type?: MissionType;
}

export interface GetAllMissionsRequest {
  cursor?: string;
  limit?: number;
  sortOrder?: SortOrderType;
  category?: MissionCategory;
  type?: MissionType;
}

function toGetUserMissionsOptions(dto: GetUserMissionsRequest): GetUserMissionsOptions {
  return {
    cursor: dto.cursor,
    limit: dto.limit,
    sortOrder: dto.sortOrder,
    category: dto.category,
    type: dto.type,
  };
}

function toGetAllMissionsOptions(dto: GetAllMissionsRequest): GetUserMissionsOptions {
  return {
    cursor: dto.cursor,
    limit: dto.limit,
    sortOrder: dto.sortOrder,
    category: dto.category,
    type: dto.type,
  };
}

export async function getUserMissions(
  request?: GetUserMissionsRequest,
): Promise<GetUserMissionsResponse & { nextCursor?: string }> {
  try {
    const user = await requireActiveUser();
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
    return handleActionError(error, `${UBIQUITOUS_CONSTANTS.MISSION} 목록을 불러올 수 없습니다.`);
  }
}

export async function getAllMissions(
  request?: GetAllMissionsRequest,
): Promise<GetUserMissionsResponse & { nextCursor?: string }> {
  try {
    await requireActiveUser();
    const limit = request?.limit ?? 10;
    const options = request
      ? toGetAllMissionsOptions({ ...request, limit: limit + 1 })
      : { limit: limit + 1 };

    const missions = await missionService.getAllMissions(options);

    let nextCursor: string | undefined = undefined;
    if (missions.length > limit) {
      const nextItem = missions.pop();
      nextCursor = nextItem?.id;
    }

    return { data: missions, nextCursor };
  } catch (error) {
    return handleActionError(error, `${UBIQUITOUS_CONSTANTS.MISSION} 목록을 불러올 수 없습니다.`);
  }
}

export async function getMission(missionId: string): Promise<GetMissionResponse> {
  try {
    const mission = await missionService.getMission(missionId);
    return { data: mission };
  } catch (error) {
    return handleActionError(error, `${UBIQUITOUS_CONSTANTS.MISSION}을 불러올 수 없습니다.`);
  }
}

export async function getMissionPassword(missionId: string) {
  try {
    const user = await requireActiveUser();
    const password = await missionService.getPassword(missionId, user.id);
    return { data: password };
  } catch (error) {
    return handleActionError(error, "비밀번호 조회 중 오류가 발생했습니다.");
  }
}

export async function verifyMissionPassword(missionId: string, password: string) {
  try {
    const isValid = await missionService.verifyPassword(missionId, password);
    return { data: isValid };
  } catch (error) {
    return handleActionError(error, "비밀번호 검증 중 오류가 발생했습니다.");
  }
}

export async function getMissionParticipantInfo(
  missionId: string,
): Promise<GetMissionParticipantInfoResponse> {
  try {
    const participantInfo = await missionService.getMissionWithParticipantInfo(missionId);
    return { data: participantInfo };
  } catch (error) {
    return handleActionError(error, "참여 정보를 불러올 수 없습니다.");
  }
}

export async function getMissionNotionPage(
  missionId: string,
): Promise<GetMissionNotionPageResponse> {
  try {
    const user = await requireActiveUser();
    const notionPage = await missionNotionPageService.getByMissionIdWithAuth(missionId, user.id);

    if (!notionPage) {
      return { data: null };
    }

    return {
      data: {
        notionPageId: notionPage.notionPageId,
        notionPageUrl: notionPage.notionPageUrl,
        lastSyncedAt: notionPage.lastSyncedAt,
        syncedResponseCount: notionPage.syncedResponseCount,
      },
    };
  } catch (error) {
    return handleActionError(error, "노션 리포트 정보를 불러올 수 없습니다.");
  }
}
