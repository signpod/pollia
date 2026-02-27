import type { MutableRefObject } from "react";
import type { SectionSaveHandle, SectionSaveState } from "./editor-save.types";

export type EditorSectionKey = "basic" | "reward" | "action" | "completion";

export type EditorSectionStateMap = Record<EditorSectionKey, SectionSaveState>;

export type EditorSectionRefMap = Record<
  EditorSectionKey,
  MutableRefObject<SectionSaveHandle | null>
>;

export interface SectionDraftSnapshot {
  updatedAt: number;
  payload: unknown | null;
}

export interface MissionEditorAutosaveSnapshotV1 {
  version: 1;
  missionId: string;
  updatedAt: number;
  sections: Record<EditorSectionKey, SectionDraftSnapshot>;
  meta: {
    lastServerSyncAt: number | null;
    invalidSections: EditorSectionKey[];
    lastError: string | null;
  };
}

export interface ServerSyncSummary {
  savedCount: number;
  invalidCount: number;
  failedCount: number;
  invalidSections: EditorSectionKey[];
  failedSections: EditorSectionKey[];
}
