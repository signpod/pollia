"use server";

import type { MissionSearchRecord } from "@/server/search";
import { missionSearchReadService } from "@/server/services/search-sync";

export interface SearchMissionsPublicRequest {
  query: string;
  hitsPerPage?: number;
}

export interface SearchMissionsPublicResponse {
  data: MissionSearchRecord[];
}

export async function searchMissionsPublic(
  request: SearchMissionsPublicRequest,
): Promise<SearchMissionsPublicResponse> {
  const hitsPerPage = Math.max(1, Math.min(request.hitsPerPage ?? 20, 100));
  const data = await missionSearchReadService.searchMissions(request.query.trim(), hitsPerPage);
  return { data };
}
