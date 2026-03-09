"use server";

import { requireActiveUser } from "@/actions/common/auth";
import { handleActionError } from "@/actions/common/error";
import { actionService } from "@/server/services/action";
import { revalidatePath } from "next/cache";

export interface ReorderActionsRequest {
  missionId: string;
  actionOrders: Array<{ id: string; order: number }>;
}

export async function reorderActions(request: ReorderActionsRequest) {
  try {
    const user = await requireActiveUser();
    const result = await actionService.reorderActions(
      request.missionId,
      request.actionOrders,
      user.id,
    );

    revalidatePath(`/mission/${request.missionId}`);
    for (const action of request.actionOrders) {
      revalidatePath(`/mission/${request.missionId}/action/${action.id}`);
    }

    return { data: result };
  } catch (error) {
    return handleActionError(error, "액션 순서 변경 중 오류가 발생했습니다.");
  }
}
