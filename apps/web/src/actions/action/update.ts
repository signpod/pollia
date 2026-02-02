"use server";

import { requireAuth } from "@/actions/common/auth";
import { actionService } from "@/server/services/action";
import type { UpdateActionRequest } from "@/types/dto/action";
import { revalidatePath } from "next/cache";

export async function updateAction(actionId: string, request: UpdateActionRequest) {
  try {
    const user = await requireAuth();
    const updatedQuestion = await actionService.updateAction(actionId, request, user.id);

    if (updatedQuestion.missionId) {
      revalidatePath(`/mission/${updatedQuestion.missionId}`);
      revalidatePath(`/mission/${updatedQuestion.missionId}/action/${actionId}`);
    }

    return { data: updatedQuestion };
  } catch (error) {
    console.error("updateAction error:", error);
    if (error instanceof Error && error.cause) {
      throw error;
    }
    const serverError = new Error("질문 수정 중 오류가 발생했습니다.");
    serverError.cause = 500;
    throw serverError;
  }
}

export async function disconnectActionWithCleanup(actionId: string, missionId: string) {
  try {
    const user = await requireAuth();

    await actionService.disconnectActionWithCleanup(actionId, missionId, user.id);

    revalidatePath(`/admin/missions/${missionId}/flow`);
    revalidatePath(`/mission/${missionId}`);

    return { success: true };
  } catch (error) {
    console.error("disconnectActionWithCleanup error:", error);
    if (error instanceof Error && error.cause) {
      throw error;
    }
    const serverError = new Error("액션 연결 끊기 중 오류가 발생했습니다.");
    serverError.cause = 500;
    throw serverError;
  }
}

export async function disconnectBranchOptionWithCleanup(
  actionId: string,
  optionId: string,
  missionId: string,
) {
  try {
    const user = await requireAuth();

    await actionService.disconnectBranchOptionWithCleanup(actionId, optionId, missionId, user.id);

    revalidatePath(`/admin/missions/${missionId}/flow`);
    revalidatePath(`/mission/${missionId}`);

    return { success: true };
  } catch (error) {
    console.error("disconnectBranchOptionWithCleanup error:", error);
    if (error instanceof Error && error.cause) {
      throw error;
    }
    const serverError = new Error("브랜치 옵션 연결 끊기 중 오류가 발생했습니다.");
    serverError.cause = 500;
    throw serverError;
  }
}

export async function connectAction(
  sourceActionId: string,
  targetId: string,
  isCompletion: boolean,
  missionId: string,
) {
  try {
    const user = await requireAuth();

    await actionService.connectAction(sourceActionId, targetId, isCompletion, missionId, user.id);

    revalidatePath(`/admin/missions/${missionId}/flow`);
    revalidatePath(`/mission/${missionId}`);

    return { success: true };
  } catch (error) {
    console.error("connectAction error:", error);
    if (error instanceof Error && error.cause) {
      throw error;
    }
    const serverError = new Error("액션 연결 중 오류가 발생했습니다.");
    serverError.cause = 500;
    throw serverError;
  }
}

export async function connectBranchOption(
  actionId: string,
  optionId: string,
  targetId: string,
  isCompletion: boolean,
  missionId: string,
) {
  try {
    const user = await requireAuth();

    await actionService.connectBranchOption(
      actionId,
      optionId,
      targetId,
      isCompletion,
      missionId,
      user.id,
    );

    revalidatePath(`/admin/missions/${missionId}/flow`);
    revalidatePath(`/mission/${missionId}`);

    return { success: true };
  } catch (error) {
    console.error("connectBranchOption error:", error);
    if (error instanceof Error && error.cause) {
      throw error;
    }
    const serverError = new Error("브랜치 옵션 연결 중 오류가 발생했습니다.");
    serverError.cause = 500;
    throw serverError;
  }
}
