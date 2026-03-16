"use server";

import { requireContentManager } from "@/actions/common/auth";
import { missionService } from "@/server/services/mission";
import type { EditorMissionDraftPayload } from "@/types/mission-editor-draft";

export async function saveMissionEditorDraft(
  missionId: string,
  payload: EditorMissionDraftPayload | null,
) {
  const { user, isAdmin } = await requireContentManager();
  await missionService.saveEditorDraft(missionId, payload, user.id, isAdmin);
  return { success: true };
}
