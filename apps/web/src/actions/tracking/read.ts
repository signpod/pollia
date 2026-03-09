"use server";

import { requireActiveUser } from "@/actions/common/auth";
import { handleActionError } from "@/actions/common/error";
import { trackingActionService } from "@/server/services/tracking";
import type { GetMissionFunnelResponse } from "@/types/dto";

export async function getMissionFunnel(
  missionId: string,
  options?: { membersOnly?: boolean },
): Promise<GetMissionFunnelResponse> {
  try {
    const user = await requireActiveUser();
    const funnelData = await trackingActionService.getMissionFunnel(missionId, user.id, options);
    return { data: funnelData };
  } catch (error) {
    return handleActionError(error, "퍼널 데이터를 불러올 수 없습니다.");
  }
}
