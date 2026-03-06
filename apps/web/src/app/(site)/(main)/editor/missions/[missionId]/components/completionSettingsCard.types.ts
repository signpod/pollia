import type { MissionCompletionWithMission } from "@/types/dto";
import type { CompletionFormRawSnapshot } from "./CompletionForm";
import type { SectionSaveStateChangeHandler } from "./editor-save.types";

export interface CompletionSettingsCardProps {
  missionId: string;
  onSaveStateChange?: SectionSaveStateChangeHandler;
  onWorkingSetChange?: (draftSnapshot: CompletionSectionDraftSnapshot) => void;
}

export interface ExistingListItem {
  key: string;
  kind: "existing";
  completion: MissionCompletionWithMission;
}

export interface DraftListItem {
  key: string;
  kind: "draft";
  draft: {
    key: string;
    title: string;
  };
}

export type CompletionListItem = ExistingListItem | DraftListItem;

export interface CompletionSectionDraftSnapshot {
  draftItems: Array<{ key: string; title: string }>;
  openItemKey: string | null;
  removedExistingIds: string[];
  dirtyByItemKey: Record<string, boolean>;
  formSnapshotByItemKey: Record<string, CompletionFormRawSnapshot>;
}
