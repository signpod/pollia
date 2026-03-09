"use server";

import { requireActiveUser } from "@/actions/common/auth";
import { handleActionError } from "@/actions/common/error";
import { actionService } from "@/server/services/action";
import { missionService } from "@/server/services/mission";
import type { UpdateActionRequest } from "@/types/dto/action";
import { revalidatePath } from "next/cache";

export async function updateAction(actionId: string, request: UpdateActionRequest) {
  try {
    const user = await requireActiveUser();
    const updatedAction = await actionService.updateAction(actionId, request, user.id);

    if (updatedAction.missionId) {
      revalidatePath(`/mission/${updatedAction.missionId}`);
      revalidatePath(`/mission/${updatedAction.missionId}/action/${actionId}`);
    }

    return { data: updatedAction };
  } catch (error) {
    return handleActionError(error, "액션 수정 중 오류가 발생했습니다.");
  }
}

export async function disconnectActionWithCleanup(actionId: string, missionId: string) {
  try {
    const user = await requireActiveUser();

    await actionService.disconnectActionWithCleanup(actionId, missionId, user.id);

    revalidatePath(`/admin/missions/${missionId}/flow`);
    revalidatePath(`/mission/${missionId}`);

    return { success: true };
  } catch (error) {
    return handleActionError(error, "액션 연결 해제 중 오류가 발생했습니다.");
  }
}

export async function disconnectBranchOptionWithCleanup(
  actionId: string,
  optionId: string,
  missionId: string,
) {
  try {
    const user = await requireActiveUser();

    await actionService.disconnectBranchOptionWithCleanup(actionId, optionId, missionId, user.id);

    revalidatePath(`/admin/missions/${missionId}/flow`);
    revalidatePath(`/mission/${missionId}`);

    return { success: true };
  } catch (error) {
    return handleActionError(error, "브랜치 옵션 연결 해제 중 오류가 발생했습니다.");
  }
}

export async function connectAction(
  sourceActionId: string,
  targetId: string,
  isCompletion: boolean,
  missionId: string,
) {
  try {
    const user = await requireActiveUser();

    await actionService.connectAction(sourceActionId, targetId, isCompletion, missionId, user.id);

    revalidatePath(`/admin/missions/${missionId}/flow`);
    revalidatePath(`/mission/${missionId}`);

    return { success: true };
  } catch (error) {
    return handleActionError(error, "액션 연결 중 오류가 발생했습니다.");
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
    const user = await requireActiveUser();

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
    return handleActionError(error, "브랜치 옵션 연결 중 오류가 발생했습니다.");
  }
}

export async function disconnectStartWithCleanup(targetActionId: string, missionId: string) {
  try {
    const user = await requireActiveUser();

    await actionService.disconnectActionWithCleanup(targetActionId, missionId, user.id);

    await missionService.updateMission(missionId, { entryActionId: null }, user.id);

    revalidatePath(`/admin/missions/${missionId}/flow`);
    revalidatePath(`/mission/${missionId}`);

    return { success: true };
  } catch (error) {
    return handleActionError(error, "시작 노드 연결 해제 중 오류가 발생했습니다.");
  }
}
