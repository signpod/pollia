"use server";

import { requireActiveUser } from "@/actions/common/auth";
import { toggleMissionLikeSchema } from "@/schemas/mission-like";
import { missionLikeService } from "@/server/services/mission-like";
import type { ToggleMissionLikeRequest, ToggleMissionLikeResponse } from "@/types/dto/mission-like";

export async function toggleMissionLike(
  request: ToggleMissionLikeRequest,
): Promise<ToggleMissionLikeResponse> {
  try {
    const user = await requireActiveUser();
    const parsed = toggleMissionLikeSchema.safeParse(request);
    if (!parsed.success) {
      const error = new Error(parsed.error.issues[0]?.message ?? "유효성 검사 실패");
      error.cause = 400;
      throw error;
    }
    const result = await missionLikeService.toggleLike(parsed.data.missionId, user.id);
    return { data: result };
  } catch (error) {
    console.error("toggleMissionLike error:", error);
    if (error instanceof Error && error.cause) {
      throw error;
    }
    const serverError = new Error("좋아요 처리 중 오류가 발생했습니다.");
    serverError.cause = 500;
    throw serverError;
  }
}
