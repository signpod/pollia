"use server";

import { handleActionError } from "@/actions/common/error";
import { trackMissionViewSchema } from "@/schemas/mission-view";
import { missionViewService } from "@/server/services/mission-view";

interface TrackMissionViewRequest {
  missionId: string;
}

interface TrackMissionViewResponse {
  data: { tracked: boolean; viewCount: number };
}

export async function trackMissionView(
  request: TrackMissionViewRequest,
): Promise<TrackMissionViewResponse> {
  try {
    const parsed = trackMissionViewSchema.safeParse(request);
    if (!parsed.success) {
      const error = new Error(parsed.error.issues[0]?.message ?? "유효성 검사 실패");
      error.cause = 400;
      throw error;
    }

    const result = await missionViewService.trackView(parsed.data.missionId);
    return { data: result };
  } catch (error) {
    return handleActionError(error, "조회수 기록 중 오류가 발생했습니다.");
  }
}
