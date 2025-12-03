"use server";

import { requireAuth } from "@/actions/common/auth";
import { surveyService } from "@/server/services/mission";

export async function deleteSurvey(surveyId: string) {
  try {
    const user = await requireAuth();
    await surveyService.deleteSurvey(surveyId, user.id);
    return { message: "설문조사가 삭제되었습니다." };
  } catch (error) {
    console.error("deleteSurvey error:", error);
    if (error instanceof Error && error.cause) {
      throw error;
    }
    const serverError = new Error("설문조사 삭제 중 오류가 발생했습니다.");
    serverError.cause = 500;
    throw serverError;
  }
}
