"use server";

import { requireAuth } from "@/actions/common/auth";
import { actionService } from "@/server/services/action";

export interface ReorderActionsRequest {
  missionId: string;
  actionOrders: Array<{ id: string; order: number }>;
}

export async function reorderActions(request: ReorderActionsRequest) {
  try {
    const user = await requireAuth();
    const result = await actionService.reorderActions(
      request.missionId,
      request.actionOrders,
      user.id,
    );
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

