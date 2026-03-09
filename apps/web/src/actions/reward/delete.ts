"use server";

import { requireActiveUser } from "@/actions/common/auth";
import { handleActionError } from "@/actions/common/error";
import { updateMission } from "@/actions/mission/update";
import { rewardService } from "@/server/services/reward/rewardService";

export async function deleteReward(rewardId: string, missionId?: string) {
  try {
    await requireActiveUser();

    if (missionId) {
      await updateMission(missionId, { rewardId: null });
    }

    await rewardService.deleteReward(rewardId);
    return { message: "Reward가 삭제되었습니다." };
  } catch (error) {
    return handleActionError(error, "Reward 삭제 중 오류가 발생했습니다.");
  }
}
