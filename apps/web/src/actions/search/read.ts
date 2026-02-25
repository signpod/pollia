"use server";

import { requireAdmin } from "@/actions/common/auth";
import type { MissionSearchRecord } from "@/server/search";
import { missionSearchReadService } from "@/server/services/search-sync";

export interface SearchMissionsRequest {
  query: string;
  hitsPerPage?: number;
}

export interface SearchMissionsResponse {
  data: MissionSearchRecord[];
}

export async function searchMissions(
  request: SearchMissionsRequest,
): Promise<SearchMissionsResponse> {
  try {
    await requireAdmin();
    const hitsPerPage = Math.max(1, Math.min(request.hitsPerPage ?? 20, 100));
    const data = await missionSearchReadService.searchMissions(request.query, hitsPerPage);
    return { data };
  } catch (error) {
    console.error("searchMissions error:", error);
    if (error instanceof Error && error.cause) {
      throw error;
    }

    const serverError = new Error("검색 결과를 불러오는 중 오류가 발생했습니다.");
    serverError.cause = 500;
    throw serverError;
  }
}
