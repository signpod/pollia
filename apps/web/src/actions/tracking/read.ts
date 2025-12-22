"use server";

import { requireAuth } from "@/actions/common/auth";
import { trackingActionService } from "@/server/services/tracking";
import type { GetMissionFunnelResponse } from "@/types/dto";

export async function getMissionFunnel(missionId: string): Promise<GetMissionFunnelResponse> {
  try {
    const user = await requireAuth();
    const funnelData = await trackingActionService.getMissionFunnel(missionId, user.id);
    return { data: funnelData };
  } catch (error) {
    console.error("getMissionFunnel error:", error);
    if (error instanceof Error && error.cause) {
      throw error;
    }
    const serverError = new Error("퍼널 데이터를 불러올 수 없습니다.");
    serverError.cause = 500;
    throw serverError;
  }
}
