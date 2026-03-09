"use server";

import { resolveMissionActor } from "@/actions/common/auth";
import { handleActionError } from "@/actions/common/error";
import { getRequestMeta } from "@/actions/common/requestMeta";
import { missionResponseService } from "@/server/services/mission-response";
import type {
  CompleteMissionResponseRequest,
  CompleteMissionResponseResponse,
  StartMissionResponseRequest,
  StartMissionResponseResponse,
} from "@/types/dto";

export async function startMissionResponse(
  request: StartMissionResponseRequest,
): Promise<StartMissionResponseResponse> {
  try {
    const actor = await resolveMissionActor();
    const response = await missionResponseService.startResponse(request, actor);
    return { data: response };
  } catch (error) {
    return handleActionError(error, "응답 시작 중 오류가 발생했습니다.");
  }
}

export async function completeMissionResponse(
  request: CompleteMissionResponseRequest,
): Promise<CompleteMissionResponseResponse> {
  try {
    const actor = await resolveMissionActor();
    const requestMeta = await getRequestMeta();
    const response = await missionResponseService.completeResponse(
      { responseId: request.responseId },
      actor,
      requestMeta,
    );
    return { data: response };
  } catch (error) {
    return handleActionError(error, "응답 완료 중 오류가 발생했습니다.");
  }
}
