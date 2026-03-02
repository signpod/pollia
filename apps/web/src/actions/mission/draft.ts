"use server";

import { requireActiveUser } from "@/actions/common/auth";
import { missionService } from "@/server/services/mission";
import type { EditorMissionDraftPayload } from "@/types/mission-editor-draft";

export async function saveMissionEditorDraft(
  missionId: string,
  payload: EditorMissionDraftPayload,
) {
  const user = await requireActiveUser();
  await missionService.saveEditorDraft(missionId, payload, user.id);
  return { success: true };
}
