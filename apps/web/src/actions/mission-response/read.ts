"use server";

import {
  requireActiveUser,
  requireContentManager,
  resolveMissionActor,
} from "@/actions/common/auth";
import { handleActionError } from "@/actions/common/error";
import { actionRepository } from "@/server/repositories/action/actionRepository";
import { missionResponseService } from "@/server/services/mission-response";
import { buildSubmissionTables } from "@/server/services/submission-list";
import type { DateRangeString } from "@/types/common/dateRange";
import type {
  GetDailyParticipationTrendResponse,
  GetMissionResponseResponse,
  GetMissionResponsesPageResponse,
  GetMissionResponsesResponse,
  GetMissionStatsResponse,
  GetMyMissionResponsesResponse,
} from "@/types/dto";

export async function getMissionResponse(responseId: string): Promise<GetMissionResponseResponse> {
  try {
    const { user, isAdmin } = await requireContentManager();
    const response = await missionResponseService.getResponseById(responseId, user.id, isAdmin);
    return { data: response };
  } catch (error) {
    return handleActionError(error, "응답 조회 중 오류가 발생했습니다.");
  }
}

export async function getMyResponseForMission(
  missionId: string,
): Promise<GetMissionResponseResponse | { data: null }> {
  try {
    const actor = await resolveMissionActor();
    const response = await missionResponseService.getResponseByMissionAndActor(missionId, actor);
    if (!response) {
      return { data: null };
    }
    return { data: response };
  } catch (error) {
    return handleActionError(error, "응답 조회 중 오류가 발생했습니다.");
  }
}

export async function getMyResponses(): Promise<GetMyMissionResponsesResponse> {
  try {
    const user = await requireActiveUser();
    const responses = await missionResponseService.getUserResponses(user.id);
    return { data: responses };
  } catch (error) {
    return handleActionError(error, "응답 목록 조회 중 오류가 발생했습니다.");
  }
}

export async function getMissionResponses(
  missionId: string,
  options?: { membersOnly?: boolean },
): Promise<GetMissionResponsesResponse> {
  try {
    const { user, isAdmin } = await requireContentManager();
    const responses = await missionResponseService.getMissionResponses(
      missionId,
      user.id,
      options,
      isAdmin,
    );
    return { data: responses };
  } catch (error) {
    return handleActionError(error, "응답 목록 조회 중 오류가 발생했습니다.");
  }
}

export async function getMissionStats(
  missionId: string,
  dateRange?: DateRangeString,
): Promise<GetMissionStatsResponse> {
  try {
    const { user, isAdmin } = await requireContentManager();
    const parsedDateRange = dateRange
      ? { from: new Date(dateRange.from), to: new Date(dateRange.to) }
      : undefined;
    const stats = await missionResponseService.getMissionStats(
      missionId,
      user.id,
      parsedDateRange,
      isAdmin,
    );
    return { data: stats };
  } catch (error) {
    return handleActionError(error, "통계 조회 중 오류가 발생했습니다.");
  }
}

export async function getDailyParticipationTrend(
  missionId: string,
  dateRange?: DateRangeString,
): Promise<GetDailyParticipationTrendResponse> {
  try {
    const { user, isAdmin } = await requireContentManager();
    const parsedDateRange = dateRange
      ? { from: new Date(dateRange.from), to: new Date(dateRange.to) }
      : undefined;
    const trend = await missionResponseService.getDailyParticipationTrend(
      missionId,
      user.id,
      parsedDateRange,
      isAdmin,
    );
    return { data: trend };
  } catch (error) {
    return handleActionError(error, "일별 참여 추이 조회 중 오류가 발생했습니다.");
  }
}

export async function getMissionResponsesPage(
  missionId: string,
  options?: { page?: number; pageSize?: number; membersOnly?: boolean },
): Promise<GetMissionResponsesPageResponse> {
  const DEFAULT_PAGE = 1;
  const DEFAULT_PAGE_SIZE = 20;
  const MAX_PAGE_SIZE = 100;

  try {
    const { user, isAdmin } = await requireContentManager();

    const page = Math.max(DEFAULT_PAGE, Math.floor(options?.page ?? DEFAULT_PAGE));
    const pageSize = Math.min(
      MAX_PAGE_SIZE,
      Math.max(DEFAULT_PAGE, Math.floor(options?.pageSize ?? DEFAULT_PAGE_SIZE)),
    );

    const pageResult = await missionResponseService.getMissionResponsesPage(
      missionId,
      user.id,
      {
        page,
        pageSize,
        membersOnly: options?.membersOnly,
      },
      isAdmin,
    );
    const actions = await actionRepository.findDetailsByMissionId(missionId);

    const submissionRows = buildSubmissionTables({
      responses: pageResult.responses,
      actions,
    });

    return {
      data: {
        columns: submissionRows.columns,
        rows: submissionRows.allRows,
        pagination: pageResult.pagination,
      },
    };
  } catch (error) {
    return handleActionError(error, "응답 목록 페이지 조회 중 오류가 발생했습니다.");
  }
}
