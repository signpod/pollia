import type {
  ActionFormHandle,
  ActionFormRawSnapshot,
} from "@/app/(site)/mission/[missionId]/manage/actions/components/ActionForm";
import { makeDraftActionId } from "@/app/(site)/mission/[missionId]/manage/actions/logic";
import { ACTION_TYPE_LABELS } from "@/constants/action";
import { ActionType } from "@prisma/client";
import { useMemo } from "react";
import type { ActionListItem } from "./actionSettingsCard.types";

interface UseActionLinkDerivedParams {
  orderedActionItems: ActionListItem[];
  draftFormSnapshotByItemKey: Record<string, ActionFormRawSnapshot>;
  actionTypeByItemKey: Record<string, ActionType>;
  formRefs: React.MutableRefObject<Record<string, ActionFormHandle | null>>;
  entryActionId: string | null;
}

export interface UseActionLinkDerivedReturn {
  linkTargets: Array<{ id: string; title: string; order: number }>;
  referencedActionIdsBySource: Map<string, Set<string>>;
}

export function useActionLinkDerived({
  orderedActionItems,
  draftFormSnapshotByItemKey,
  actionTypeByItemKey,
  formRefs,
  entryActionId,
}: UseActionLinkDerivedParams): UseActionLinkDerivedReturn {
  const linkTargets = useMemo(() => {
    return orderedActionItems.map((item, index) => {
      const snapshot =
        formRefs.current[item.key]?.getRawSnapshot() ?? draftFormSnapshotByItemKey[item.key];
      const snapshotTitle = snapshot?.values?.title?.trim();

      if (item.kind === "existing") {
        return {
          id: item.action.id,
          title: snapshotTitle || item.action.title,
          order: index,
        };
      }

      const draftType = actionTypeByItemKey[item.key] ?? ActionType.SUBJECTIVE;
      const fallbackTitle = `${ACTION_TYPE_LABELS[draftType]} 질문`;
      return {
        id: makeDraftActionId(item.draft.key),
        title: snapshotTitle || fallbackTitle,
        order: index,
      };
    });
  }, [orderedActionItems, draftFormSnapshotByItemKey, actionTypeByItemKey]);

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
