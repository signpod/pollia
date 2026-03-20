import type { ActionFormRawSnapshot } from "@/app/(site)/mission/[missionId]/manage/actions/components/ActionForm";
import type { ActionDetail } from "@/types/dto";
import type { ActionType } from "@prisma/client";
import type { SectionSaveStateChangeHandler } from "./editor-save.types";

export interface ActionSettingsCardProps {
  missionId: string;
  useAiCompletion?: boolean;
  onSaveStateChange?: SectionSaveStateChangeHandler;
}

export interface DraftActionItem {
  key: string;
}

export interface ExistingListItem {
  key: string;
  kind: "existing";
  action: ActionDetail;
}

export interface DraftListItem {
  key: string;
  kind: "draft";
  draft: DraftActionItem;
}

export type ActionListItem = ExistingListItem | DraftListItem;

export interface ActionSectionDraftSnapshot {
  draftItems: DraftActionItem[];
  openItemKey: string | null;
  removedExistingIds: string[];
  dirtyByItemKey: Record<string, boolean>;
  actionTypeByItemKey: Record<string, ActionType>;
  formSnapshotByItemKey: Record<string, ActionFormRawSnapshot>;
  itemOrderKeys?: string[];
}
