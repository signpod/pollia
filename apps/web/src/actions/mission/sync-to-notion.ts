"use server";

import { requireContentManager } from "@/actions/common/auth";
import { handleActionError } from "@/actions/common/error";
import { missionService } from "@/server/services/mission";
import { missionNotionPageService } from "@/server/services/mission-notion-page";
import { missionResponseService } from "@/server/services/mission-response";
import { NotionService } from "@/server/services/notion";
import type { SyncMissionToNotionResponse } from "@/types/dto";

export async function syncMissionToNotion(missionId: string): Promise<SyncMissionToNotionResponse> {
  try {
    const { user, isAdmin } = await requireContentManager();

    const mission = await missionService.getMission(missionId);

    if (!isAdmin && mission.creatorId !== user.id) {
      const error = new Error("노션 동기화 권한이 없습니다.");
      error.cause = 403;
      throw error;
    }

    const actions = await missionService.getMissionActionsDetail(missionId);
    const responses = await missionResponseService.getMissionResponses(
      missionId,
      user.id,
      undefined,
      isAdmin,
    );

    const notionService = new NotionService();
    const result = await notionService.createOrUpdateMissionReport({
      mission,
      actions,
      responses,
    });

    await missionNotionPageService.upsertNotionPage(missionId, {
      notionPageId: result.notionPageId,
      notionPageUrl: result.notionPageUrl,
      syncedResponseCount: result.syncedResponseCount,
    });

    return {
      data: {
        notionPageUrl: result.notionPageUrl,
        syncedResponseCount: result.syncedResponseCount,
      },
    };
  } catch (error) {
    console.error("[syncMissionToNotion] 에러 발생:", {
      missionId,
      error,
      errorMessage: error instanceof Error ? error.message : String(error),
      errorStack: error instanceof Error ? error.stack : undefined,
    });
    return handleActionError(error, "노션 리포트 생성 실패");
  }
}
