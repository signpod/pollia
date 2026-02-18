"use server";

import { requireActiveUser } from "@/actions/common/auth";
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
    console.error("reorderActions error:", error);
    if (error instanceof Error && error.cause) {
      throw error;
    }
    const serverError = new Error("액션 순서 변경 중 오류가 발생했습니다.");
    serverError.cause = 500;
    throw serverError;
  }
}
