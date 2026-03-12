"use server";

import { requireActiveUser } from "@/actions/common/auth";
import { handleActionError } from "@/actions/common/error";
import { trackingActionService } from "@/server/services/tracking";
import type { GetMissionFunnelResponse } from "@/types/dto";

export async function getMissionFunnel(
  missionId: string,
  options?: { membersOnly?: boolean; dateRange?: { from: string; to: string } },
): Promise<GetMissionFunnelResponse> {
  try {
    const user = await requireActiveUser();
    const serviceOptions: { membersOnly?: boolean; dateRange?: { from: Date; to: Date } } = {};
    if (options?.membersOnly) serviceOptions.membersOnly = true;
    if (options?.dateRange) {
      serviceOptions.dateRange = {
        from: new Date(options.dateRange.from),
        to: new Date(options.dateRange.to),
      };
    }
    const funnelData = await trackingActionService.getMissionFunnel(
      missionId,
      user.id,
      serviceOptions,
    );
    return { data: funnelData };
  } catch (error) {
    return handleActionError(error, "퍼널 데이터를 불러올 수 없습니다.");
  }
}
