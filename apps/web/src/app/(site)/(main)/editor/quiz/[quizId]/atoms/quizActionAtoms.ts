import type { ActionFormRawSnapshot } from "@/app/(site)/mission/[missionId]/manage/actions/components/ActionForm";
import { ActionType } from "@prisma/client";
import { atom } from "jotai";
import type { DraftActionItem } from "../../../missions/[missionId]/components/actionSettingsCard.types";

export const quizActionDraftItemsAtom = atom<DraftActionItem[]>([]);

export const quizActionItemOrderKeysAtom = atom<string[]>([]);

export const quizActionOpenItemKeyAtom = atom<string | null>(null);

export const quizActionIsApplyingAtom = atom(false);

export const quizActionDirtyByItemKeyAtom = atom<Record<string, boolean>>({});

export const quizActionFormVersionByIdAtom = atom<Record<string, number>>({});

export const quizActionTypeByItemKeyAtom = atom<Record<string, ActionType>>({});

export const quizActionFormSnapshotByItemKeyAtom = atom<Record<string, ActionFormRawSnapshot>>({});

export const quizActionValidationIssueCountByItemKeyAtom = atom<Record<string, number>>({});

export const quizActionDraftHydrationVersionAtom = atom(0);

export const quizActionScrollTargetItemKeyAtom = atom<string | null>(null);

export const quizDraftVersionAtom = atom(0);
