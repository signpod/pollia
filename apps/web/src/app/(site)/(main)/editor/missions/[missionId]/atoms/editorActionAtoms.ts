import type { ActionFormRawSnapshot } from "@/app/(site)/mission/[missionId]/manage/actions/components/ActionForm";
import { ActionType } from "@prisma/client";
import { atom } from "jotai";
import type { DraftActionItem } from "../components/actionSettingsCard.types";

export const actionDraftItemsAtom = atom<DraftActionItem[]>([]);

export const actionItemOrderKeysAtom = atom<string[]>([]);

export const actionOpenItemKeyAtom = atom<string | null>(null);

export const actionIsApplyingAtom = atom(false);

export const actionDirtyByItemKeyAtom = atom<Record<string, boolean>>({});

export const actionFormVersionByIdAtom = atom<Record<string, number>>({});

export const actionTypeByItemKeyAtom = atom<Record<string, ActionType>>({});

export const actionFormSnapshotByItemKeyAtom = atom<Record<string, ActionFormRawSnapshot>>({});

export const actionValidationIssueCountByItemKeyAtom = atom<Record<string, number>>({});

export const actionDraftHydrationVersionAtom = atom(0);

export const actionIsFlowDialogOpenAtom = atom(false);

export const actionScrollTargetItemKeyAtom = atom<string | null>(null);
