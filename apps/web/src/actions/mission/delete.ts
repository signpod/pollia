"use server";

import { requireContentManager } from "@/actions/common/auth";
import { handleActionError } from "@/actions/common/error";
import UBIQUITOUS_CONSTANTS from "@/constants/ubiquitous";
import { missionService } from "@/server/services/mission";
import { revalidatePath } from "next/cache";

export async function deleteMission(missionId: string) {
  try {
    const { user, isAdmin } = await requireContentManager();
    await missionService.deleteMission(missionId, user.id, isAdmin);

    revalidatePath(`/mission/${missionId}`);

    return { message: `${UBIQUITOUS_CONSTANTS.MISSION}이 삭제되었습니다.` };
  } catch (error) {
    return handleActionError(error, `${UBIQUITOUS_CONSTANTS.MISSION} 삭제 중 오류가 발생했습니다.`);
  }
}
