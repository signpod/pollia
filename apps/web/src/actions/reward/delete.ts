"use server";

import { requireAuth } from "@/actions/common/auth";
import { updateMission } from "@/actions/mission/update";
import { rewardService } from "@/server/services/reward/rewardService";

export async function deleteReward(rewardId: string, missionId?: string) {
  try {
    await requireAuth();

    if (missionId) {
      await updateMission(missionId, { rewardId: null });
    }

    await rewardService.deleteReward(rewardId);
    return { message: "Reward가 삭제되었습니다." };
  } catch (error) {
    console.error("deleteReward error:", error);
    if (error instanceof Error && error.cause) {
      throw error;
    }
    const serverError = new Error("Reward 삭제 중 오류가 발생했습니다.");
    serverError.cause = 500;
    throw serverError;
  }
}
