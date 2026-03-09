"use server";

import { handleActionError } from "@/actions/common/error";
import { missionResponseService } from "@/server/services/mission-response";

export async function cleanupMissionResponseAbuseMeta() {
  try {
    return await missionResponseService.cleanupAbuseMeta();
  } catch (error) {
    return handleActionError(error, "미션 응답 어뷰징 메타 정리 중 오류가 발생했습니다.");
  }
}
