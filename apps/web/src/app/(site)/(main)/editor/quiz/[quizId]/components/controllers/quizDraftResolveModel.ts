import type { EditorMissionDraftPayload } from "@/types/mission-editor-draft";

export function pickNewerDraft(
  serverDraft: EditorMissionDraftPayload | null,
  localDraft: EditorMissionDraftPayload | null,
): EditorMissionDraftPayload | null {
  if (!serverDraft && !localDraft) return null;
  if (!serverDraft) return localDraft;
  if (!localDraft) return serverDraft;

  const serverUpdatedAt = serverDraft.meta?.updatedAtMs ?? 0;
  const localUpdatedAt = localDraft.meta?.updatedAtMs ?? 0;
  return localUpdatedAt >= serverUpdatedAt ? localDraft : serverDraft;
}
