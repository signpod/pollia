"use server";

import { requireAuth } from "@/actions/common/auth";
import { missionService } from "@/server/services/mission";
import { revalidatePath } from "next/cache";

export async function deleteMission(missionId: string) {
  try {
    const user = await requireAuth();
    await missionService.deleteMission(missionId, user.id);

    revalidatePath(`/mission/${missionId}`);

    return { message: "미션이 삭제되었습니다." };
  } catch (error) {
    console.error("deleteMission error:", error);
    if (error instanceof Error && error.cause) {
      throw error;
    }
    const serverError = new Error("미션 삭제 중 오류가 발생했습니다.");
    serverError.cause = 500;
    throw serverError;
  }
}
