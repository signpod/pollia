"use server";

import { missionResponseService } from "@/server/services/mission-response";

export async function cleanupMissionResponseAbuseMeta() {
  try {
    return await missionResponseService.cleanupAbuseMeta();
  } catch (error) {
    console.error("미션 응답 어뷰징 메타 정리 실패:", error);
    if (error instanceof Error && error.cause) {
      throw error;
    }

    const serverError = new Error("미션 응답 어뷰징 메타 정리 중 오류가 발생했습니다.");
    serverError.cause = 500;
    throw serverError;
  }
}
