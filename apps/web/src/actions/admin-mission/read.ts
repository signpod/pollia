"use server";

import { requireAdmin } from "@/actions/common/auth";
import { handleActionError } from "@/actions/common/error";
import { missionService } from "@/server/services/mission";
import type { GetAdminMissionsRequest, GetAdminMissionsResponse } from "@/types/dto/admin-mission";

export async function getAdminMissions(
  request?: GetAdminMissionsRequest,
): Promise<GetAdminMissionsResponse> {
  try {
    await requireAdmin();
    const result = await missionService.listAllMissions(request);
    return { data: result.missions, total: result.total };
  } catch (error) {
    return handleActionError(error, "콘텐츠 목록 조회 중 오류가 발생했습니다.");
  }
}
