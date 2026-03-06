import type {
  ActionFormHandle,
  ActionFormRawSnapshot,
} from "@/app/(site)/mission/[missionId]/manage/actions/components/ActionForm";
import { makeDraftActionId } from "@/app/(site)/mission/[missionId]/manage/actions/logic";
import { ACTION_TYPE_LABELS } from "@/constants/action";
import type { ActionDetail } from "@/types/dto";
import { ActionType } from "@prisma/client";
import { useMemo } from "react";
import type { ActionListItem, DraftActionItem } from "./actionSettingsCard.types";
import { getDraftItemKey, getExistingItemKey } from "./actionSettingsCard.utils";

interface UseActionLinkDerivedParams {
  orderedActionItems: ActionListItem[];
  existingActions: ActionDetail[];
  draftItems: DraftActionItem[];
  draftFormSnapshotByItemKey: Record<string, ActionFormRawSnapshot>;
  actionTypeByItemKey: Record<string, ActionType>;
  formRefs: React.MutableRefObject<Record<string, ActionFormHandle | null>>;
  isInactiveMission: boolean;
  entryActionId: string | null;
}

export interface UseActionLinkDerivedReturn {
  linkTargets: Array<{ id: string; title: string; order: number }>;
  referencedActionIdsBySource: Map<string, Set<string>>;
}

export function useActionLinkDerived({
  orderedActionItems,
  existingActions,
  draftItems,
  draftFormSnapshotByItemKey,
  actionTypeByItemKey,
  formRefs,
  isInactiveMission,
  entryActionId,
}: UseActionLinkDerivedParams): UseActionLinkDerivedReturn {
  const linkTargets = useMemo(() => {
    const formSnapshotByItemKey: Record<string, ActionFormRawSnapshot> = {};
    for (const item of orderedActionItems) {
      const snapshot =
        formRefs.current[item.key]?.getRawSnapshot() ?? draftFormSnapshotByItemKey[item.key];
      if (snapshot) {
        formSnapshotByItemKey[item.key] = snapshot;
      }
    }

    const existingTargets = existingActions.map(action => {
      const existingItemKey = getExistingItemKey(action.id);
      const snapshotTitle = formSnapshotByItemKey[existingItemKey]?.values?.title?.trim();

      return {
        id: action.id,
        title: isInactiveMission ? snapshotTitle || action.title : action.title,
        order: action.order ?? 0,
      };
    });

    const draftTargets = draftItems.map((draft, index) => {
      const itemKey = getDraftItemKey(draft.key);
      const draftType = actionTypeByItemKey[itemKey] ?? ActionType.SUBJECTIVE;
      const snapshotTitle = formSnapshotByItemKey[itemKey]?.values?.title?.trim();
      const fallbackTitle = `${ACTION_TYPE_LABELS[draftType]} 질문`;

      return {
        id: makeDraftActionId(draft.key),
        title: isInactiveMission ? snapshotTitle || fallbackTitle : fallbackTitle,
        order: existingActions.length + index,
      };
    });

    return [...existingTargets, ...draftTargets];
  }, [
    actionTypeByItemKey,
    draftFormSnapshotByItemKey,
    draftItems,
    existingActions,
    isInactiveMission,
    orderedActionItems,
  ]);

  const referencedActionIdsBySource = useMemo(() => {
    const map = new Map<string, Set<string>>();
    const addRef = (targetId: string, sourceKey: string) => {
      const set = map.get(targetId) ?? new Set();
      set.add(sourceKey);
      map.set(targetId, set);
    };

    if (entryActionId) {
      addRef(entryActionId, "__mission_entry__");
    }

    for (const item of orderedActionItems) {
      const snapshot = draftFormSnapshotByItemKey[item.key];
      if (snapshot) {
        const { values, actionType } = snapshot;
        if (actionType === ActionType.BRANCH && values.options) {
          for (const option of values.options) {
            if (option.nextActionId) addRef(option.nextActionId, item.key);
          }
        } else if (values.nextActionId) {
          addRef(values.nextActionId, item.key);
        }
      } else if (item.kind === "existing") {
        const action = item.action;
        if (action.type === ActionType.BRANCH) {
          for (const option of action.options) {
            if (option.nextActionId) addRef(option.nextActionId, item.key);
          }
        } else if (action.nextActionId) {
          addRef(action.nextActionId, item.key);
        }
      }
    }
    return map;
  }, [entryActionId, orderedActionItems, draftFormSnapshotByItemKey]);

  return { linkTargets, referencedActionIdsBySource };
}
