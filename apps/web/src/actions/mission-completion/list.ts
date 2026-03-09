"use server";

import { handleActionError } from "@/actions/common/error";
import { missionCompletionService } from "@/server/services/mission-completion/missionCompletionService";
import type { GetMissionCompletionsResponse } from "@/types/dto";
import { toMissionCompletionWithMission } from "./utils";

export async function getCompletionsByMissionId(
  missionId: string,
): Promise<GetMissionCompletionsResponse> {
  try {
    const completions = await missionCompletionService.getCompletionsByMissionId(missionId);
    return { data: completions.map(toMissionCompletionWithMission) };
  } catch (error) {
    return handleActionError(error, "완료 화면 목록을 불러올 수 없습니다.");
  }
}
