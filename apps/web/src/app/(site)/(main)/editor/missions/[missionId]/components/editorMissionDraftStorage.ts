import {
  type LocalEditorDraftPayload,
  normalizeEditorMissionDraftPayload,
} from "@/types/mission-editor-draft";

export function getMissionEditorDraftStorageKey(missionId: string) {
  return `pollia:editor:mission:${missionId}:draft`;
}

export function saveMissionEditorDraftToLocalStorage(
  missionId: string,
  payload: LocalEditorDraftPayload,
) {
  if (typeof window === "undefined") {
    return;
  }

  try {
    window.localStorage.setItem(
      getMissionEditorDraftStorageKey(missionId),
      JSON.stringify(payload),
    );
  } catch (error) {
    console.error("Failed to save mission draft to localStorage:", error);
  }
}

export function loadMissionEditorDraftFromLocalStorage(
  missionId: string,
): LocalEditorDraftPayload | null {
  if (typeof window === "undefined") {
    return null;
  }

  try {
    const raw = window.localStorage.getItem(getMissionEditorDraftStorageKey(missionId));
    if (!raw) {
      return null;
    }

    return normalizeEditorMissionDraftPayload(JSON.parse(raw));
  } catch (error) {
    console.error("Failed to load mission draft from localStorage:", error);
    return null;
  }
}

export function removeMissionEditorDraftFromLocalStorage(missionId: string) {
  if (typeof window === "undefined") {
    return;
  }

  try {
    window.localStorage.removeItem(getMissionEditorDraftStorageKey(missionId));
  } catch (error) {
    console.error("Failed to remove mission draft from localStorage:", error);
  }
}
