import type { MissionEditorAutosaveSnapshotV1 } from "./editor-autosave.types";

const STORAGE_KEY_PREFIX = "pollia:editor:mission:";
const STORAGE_KEY_SUFFIX = ":autosave:v1";

function getStorageKey(missionId: string) {
  return `${STORAGE_KEY_PREFIX}${missionId}${STORAGE_KEY_SUFFIX}`;
}

function isObjectRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function isValidSnapshot(value: unknown): value is MissionEditorAutosaveSnapshotV1 {
  if (!isObjectRecord(value)) {
    return false;
  }

  if (value.version !== 1 || typeof value.missionId !== "string" || !isObjectRecord(value.meta)) {
    return false;
  }

  return isObjectRecord(value.sections);
}

export function loadMissionEditorAutosaveSnapshot(
  missionId: string,
): MissionEditorAutosaveSnapshotV1 | null {
  if (typeof window === "undefined") {
    return null;
  }

  try {
    const raw = window.localStorage.getItem(getStorageKey(missionId));
    if (!raw) {
      return null;
    }

    const parsed: unknown = JSON.parse(raw);
    if (!isValidSnapshot(parsed)) {
      return null;
    }

    return parsed;
  } catch {
    return null;
  }
}

export function saveMissionEditorAutosaveSnapshot(snapshot: MissionEditorAutosaveSnapshotV1) {
  if (typeof window === "undefined") {
    return false;
  }

  try {
    window.localStorage.setItem(getStorageKey(snapshot.missionId), JSON.stringify(snapshot));
    return true;
  } catch {
    return false;
  }
}

export function clearMissionEditorAutosaveSnapshot(missionId: string) {
  if (typeof window === "undefined") {
    return;
  }

  try {
    window.localStorage.removeItem(getStorageKey(missionId));
  } catch {
    // ignore storage errors
  }
}
