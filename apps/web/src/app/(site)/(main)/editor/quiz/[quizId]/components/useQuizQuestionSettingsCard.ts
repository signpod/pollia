import type {
  ActionFormHandle,
  ActionFormRawSnapshot,
} from "@/app/(site)/mission/[missionId]/manage/actions/components/ActionForm";
import { useManageDeleteAction } from "@/app/(site)/mission/[missionId]/manage/actions/hooks";
import { useReadActionsDetail } from "@/hooks/action";
import type { ActionDetail } from "@/types/dto";
import type { DragEndEvent } from "@dnd-kit/core";
import { arrayMove } from "@dnd-kit/sortable";
import { ActionType } from "@prisma/client";
import { toast } from "@repo/ui/components";
import { useAtom, useAtomValue, useSetAtom } from "jotai";
import { AlertCircle } from "lucide-react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type {
  ActionListItem,
  ActionSectionDraftSnapshot,
} from "../../../missions/[missionId]/components/actionSettingsCard.types";
import {
  areActionSnapshotsEqual,
  areStringArraysEqual,
  createDraftKey,
  getDraftItemKey,
  getExistingItemKey,
} from "../../../missions/[missionId]/components/actionSettingsCard.utils";
import type {
  SectionSaveHandle,
  SectionSaveStateChangeHandler,
} from "../../../missions/[missionId]/components/editor-save.types";
import {
  quizActionDirtyByItemKeyAtom,
  quizActionDraftHydrationVersionAtom,
  quizActionDraftItemsAtom,
  quizActionFormSnapshotByItemKeyAtom,
  quizActionFormVersionByIdAtom,
  quizActionItemOrderKeysAtom,
  quizActionOpenItemKeyAtom,
  quizActionScrollTargetItemKeyAtom,
  quizActionTypeByItemKeyAtom,
  quizActionValidationIssueCountByItemKeyAtom,
  quizDraftVersionAtom,
} from "../atoms/quizActionAtoms";
import { useQuizActionSaveFlow } from "./useQuizActionSaveFlow";

function filterByValidKeys<T>(prev: Record<string, T>, validKeys: Set<string>): Record<string, T> {
  let hasChange = false;
  const next: Record<string, T> = {};
  for (const [key, value] of Object.entries(prev)) {
    if (validKeys.has(key)) {
      next[key] = value;
    } else {
      hasChange = true;
    }
  }
  return hasChange ? next : prev;
}

function deleteKeyFromRecord<T>(prev: Record<string, T>, key: string): Record<string, T> {
  if (!(key in prev)) return prev;
  const next = { ...prev };
  delete next[key];
  return next;
}

export interface QuizQuestionSettingsCardProps {
  missionId: string;
  onSaveStateChange?: SectionSaveStateChangeHandler;
  showHint?: boolean;
}

export interface UseQuizQuestionSettingsCardReturn {
  viewState: {
    isBusy: boolean;
    isActionsLoading: boolean;
    hasPendingChanges: boolean;
    hasValidationIssues: boolean;
    validationIssueCount: number;
  };
  listState: {
    orderedActionItems: ActionListItem[];
    openItemKey: string | null;
    actionTypeByItemKey: Record<string, ActionType>;
    existingFormVersionById: Record<string, number>;
    draftHydrationVersion: number;
  };
  formRefs: React.MutableRefObject<Record<string, ActionFormHandle | null>>;
  deleteDialog: {
    target: ActionDetail | null;
    isPending: boolean;
    onOpen: (action: ActionDetail) => void;
    onClose: () => void;
    onConfirm: () => void;
  };
  handlers: {
    handleAddDraft: () => void;
    handleRemoveDraft: (draftKey: string) => void;
    handleToggleItem: (itemKey: string) => void;
    handleActionTypeChange: (itemKey: string, type: ActionType) => void;
    handleDragEnd: (event: DragEndEvent) => void;
    handleMoveItem: (itemKey: string, direction: "up" | "down") => void;
    handleItemDirtyChange: (itemKey: string, isDirty: boolean) => void;
    handleItemValidationChange: (itemKey: string, issueCount: number) => void;
    handleItemRawSnapshotChange: (itemKey: string, snapshot: ActionFormRawSnapshot) => void;
  };
  saveHandle: SectionSaveHandle;
}

export function useQuizQuestionSettingsCard({
  missionId,
  onSaveStateChange,
}: QuizQuestionSettingsCardProps): UseQuizQuestionSettingsCardReturn {
  const formRefs = useRef<Record<string, ActionFormHandle | null>>({});
  const [draftItems, setDraftItems] = useAtom(quizActionDraftItemsAtom);
  const [itemOrderKeys, setItemOrderKeys] = useAtom(quizActionItemOrderKeysAtom);
  const [openItemKey, setOpenItemKey] = useAtom(quizActionOpenItemKeyAtom);
  const [deleteTarget, setDeleteTarget] = useState<ActionDetail | null>(null);
  const [dirtyByItemKey, setDirtyByItemKey] = useAtom(quizActionDirtyByItemKeyAtom);
  const [existingFormVersionById, setExistingFormVersionById] = useAtom(
    quizActionFormVersionByIdAtom,
  );
  const [actionTypeByItemKey, setActionTypeByItemKey] = useAtom(quizActionTypeByItemKeyAtom);
  const [draftFormSnapshotByItemKey, setDraftFormSnapshotByItemKey] = useAtom(
    quizActionFormSnapshotByItemKeyAtom,
  );
  const [validationIssueCountByItemKey, setValidationIssueCountByItemKey] = useAtom(
    quizActionValidationIssueCountByItemKeyAtom,
  );
  const draftHydrationVersion = useAtomValue(quizActionDraftHydrationVersionAtom);
  const incrementDraftVersion = useSetAtom(quizDraftVersionAtom);
  const setScrollTarget = useSetAtom(quizActionScrollTargetItemKeyAtom);

  const { data: actionsData, isLoading: isActionsLoading } = useReadActionsDetail(missionId);

  const existingActions = useMemo(() => {
    const list = actionsData?.data ?? [];
    return [...list].sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
  }, [actionsData]);

  const deleteAction = useManageDeleteAction({
    onSuccess: () => {
      const deletingActionId = deleteTarget?.id;

      if (deletingActionId) {
        const deletingItemKey = getExistingItemKey(deletingActionId);

        setExistingFormVersionById(prev => {
          const next = { ...prev };
          delete next[deletingActionId];
          return next;
        });

        delete formRefs.current[deletingItemKey];
        setActionTypeByItemKey(prev => deleteKeyFromRecord(prev, deletingItemKey));
        setDirtyByItemKey(prev => deleteKeyFromRecord(prev, deletingItemKey));
        setValidationIssueCountByItemKey(prev => deleteKeyFromRecord(prev, deletingItemKey));
        setOpenItemKey(prev => (prev === deletingItemKey ? null : prev));
      }

      toast({ message: "질문이 삭제되었습니다." });
      setDeleteTarget(null);
    },
    onError: error => {
      toast({
        message: error.message || "질문 삭제에 실패했습니다.",
        icon: AlertCircle,
        iconClassName: "text-red-500",
      });
    },
  });

  const isBusy = deleteAction.isPending;

  const actionItems = useMemo<ActionListItem[]>(
    () => [
      ...existingActions.map(action => ({
        key: getExistingItemKey(action.id),
        kind: "existing" as const,
        action,
      })),
      ...draftItems.map(draft => ({
        key: getDraftItemKey(draft.key),
        kind: "draft" as const,
        draft,
      })),
    ],
    [existingActions, draftItems],
  );

  const orderedActionItems = useMemo<ActionListItem[]>(() => {
    if (actionItems.length === 0) return [];

    const actionItemByKey = new Map(actionItems.map(item => [item.key, item]));
    const orderedKeys: string[] = [];
    const seen = new Set<string>();

    for (const key of itemOrderKeys) {
      if (seen.has(key) || !actionItemByKey.has(key)) continue;
      orderedKeys.push(key);
      seen.add(key);
    }

    for (const item of actionItems) {
      if (seen.has(item.key)) continue;
      orderedKeys.push(item.key);
      seen.add(item.key);
    }

    return orderedKeys.flatMap(key => {
      const item = actionItemByKey.get(key);
      return item ? [item] : [];
    });
  }, [actionItems, itemOrderKeys]);

  const defaultOrderKeys = useMemo(() => actionItems.map(item => item.key), [actionItems]);
  const orderedItemKeys = useMemo(
    () => orderedActionItems.map(item => item.key),
    [orderedActionItems],
  );
  const hasOrderChanges = useMemo(
    () => !areStringArraysEqual(orderedItemKeys, defaultOrderKeys),
    [defaultOrderKeys, orderedItemKeys],
  );

  const getActionDraftSnapshot = useCallback((): ActionSectionDraftSnapshot => {
    const formSnapshotByItemKey: Record<string, ActionFormRawSnapshot> = {};

    for (const item of orderedActionItems) {
      const snapshot =
        formRefs.current[item.key]?.getRawSnapshot() ?? draftFormSnapshotByItemKey[item.key];
      if (snapshot) {
        formSnapshotByItemKey[item.key] = snapshot;
      }
    }

    return {
      draftItems,
      openItemKey,
      dirtyByItemKey,
      actionTypeByItemKey,
      formSnapshotByItemKey,
      itemOrderKeys: orderedActionItems.map(item => item.key),
    };
  }, [
    actionTypeByItemKey,
    draftFormSnapshotByItemKey,
    draftItems,
    dirtyByItemKey,
    openItemKey,
    orderedActionItems,
  ]);

  const hasPendingChanges = useMemo(() => {
    if (draftItems.length > 0) return true;
    if (hasOrderChanges) return true;
    return existingActions.some(action => dirtyByItemKey[getExistingItemKey(action.id)]);
  }, [draftItems.length, existingActions, dirtyByItemKey, hasOrderChanges]);

  const { isApplying, saveHandle } = useQuizActionSaveFlow({
    missionId,
    formRefs,
    orderedActionItems,
    isActionsLoading,
    isBusy,
    hasPendingChanges,
    getActionDraftSnapshot,
  });

  const isBusyTotal = isApplying || isBusy;

  // biome-ignore lint/correctness/useExhaustiveDependencies: 안정 참조 제외
  useEffect(() => {
    const validKeys = new Set(orderedActionItems.map(item => item.key));
    setDirtyByItemKey(prev => filterByValidKeys(prev, validKeys));
    setDraftFormSnapshotByItemKey(prev => filterByValidKeys(prev, validKeys));
    setValidationIssueCountByItemKey(prev => filterByValidKeys(prev, validKeys));
  }, [orderedActionItems]);

  // biome-ignore lint/correctness/useExhaustiveDependencies: 안정 참조 제외
  useEffect(() => {
    const validKeys = actionItems.map(item => item.key);
    setItemOrderKeys(prev => {
      const validKeySet = new Set(validKeys);
      const next = prev.filter(key => validKeySet.has(key));

      for (const key of validKeys) {
        if (!next.includes(key)) {
          next.push(key);
        }
      }

      return areStringArraysEqual(prev, next) ? prev : next;
    });
  }, [actionItems]);

  const validationIssueCount = useMemo(
    () =>
      orderedActionItems.reduce(
        (sum, item) => sum + (validationIssueCountByItemKey[item.key] ?? 0),
        0,
      ),
    [orderedActionItems, validationIssueCountByItemKey],
  );
  const hasValidationIssues = validationIssueCount > 0;

  useEffect(() => {
    onSaveStateChange?.({
      hasPendingChanges,
      isBusy: isBusyTotal || isActionsLoading,
      hasValidationIssues,
      validationIssueCount,
    });
  }, [
    hasPendingChanges,
    hasValidationIssues,
    isBusyTotal,
    isActionsLoading,
    onSaveStateChange,
    validationIssueCount,
  ]);

  // biome-ignore lint/correctness/useExhaustiveDependencies: 안정 참조 제외
  const handleItemDirtyChange = useCallback((itemKey: string, isDirty: boolean) => {
    setDirtyByItemKey(prev => (prev[itemKey] === isDirty ? prev : { ...prev, [itemKey]: isDirty }));
  }, []);

  // biome-ignore lint/correctness/useExhaustiveDependencies: 안정 참조 제외
  const handleItemValidationChange = useCallback((itemKey: string, issueCount: number) => {
    setValidationIssueCountByItemKey(prev =>
      (prev[itemKey] ?? 0) === issueCount ? prev : { ...prev, [itemKey]: issueCount },
    );
  }, []);

  const handleItemRawSnapshotChange = useCallback(
    (itemKey: string, snapshot: ActionFormRawSnapshot) => {
      setDraftFormSnapshotByItemKey(prev => {
        if (areActionSnapshotsEqual(prev[itemKey], snapshot)) return prev;
        return { ...prev, [itemKey]: snapshot };
      });
      incrementDraftVersion(v => v + 1);
    },
    [setDraftFormSnapshotByItemKey, incrementDraftVersion],
  );

  // biome-ignore lint/correctness/useExhaustiveDependencies: 안정 참조 제외
  const handleAddDraft = useCallback(() => {
    const draftKey = createDraftKey();
    const itemKey = getDraftItemKey(draftKey);

    setDraftItems(prev => [...prev, { key: draftKey }]);
    setActionTypeByItemKey(prev => ({ ...prev, [itemKey]: ActionType.MULTIPLE_CHOICE }));
    setOpenItemKey(itemKey);
    setScrollTarget(itemKey);
  }, []);

  // biome-ignore lint/correctness/useExhaustiveDependencies: 안정 참조 제외
  const handleRemoveDraft = useCallback((draftKey: string) => {
    const itemKey = getDraftItemKey(draftKey);

    setDraftItems(prev => prev.filter(item => item.key !== draftKey));
    setActionTypeByItemKey(prev => deleteKeyFromRecord(prev, itemKey));
    setDirtyByItemKey(prev => deleteKeyFromRecord(prev, itemKey));
    setValidationIssueCountByItemKey(prev => deleteKeyFromRecord(prev, itemKey));
    delete formRefs.current[itemKey];
    setOpenItemKey(prev => (prev === itemKey ? null : prev));
  }, []);

  const handleToggleItem = useCallback(
    (itemKey: string) => {
      setOpenItemKey(prev => (prev === itemKey ? null : itemKey));
    },
    [setOpenItemKey],
  );

  // biome-ignore lint/correctness/useExhaustiveDependencies: 안정 참조 제외
  const handleActionTypeChange = useCallback((itemKey: string, actionType: ActionType) => {
    setActionTypeByItemKey(prev => ({ ...prev, [itemKey]: actionType }));
  }, []);

  const handleDragEnd = useCallback(
    (event: DragEndEvent) => {
      const { active, over } = event;
      if (over && active.id !== over.id) {
        setItemOrderKeys(prev => {
          const oldIndex = prev.indexOf(String(active.id));
          const newIndex = prev.indexOf(String(over.id));
          if (oldIndex === -1 || newIndex === -1) return prev;
          return arrayMove(prev, oldIndex, newIndex);
        });
      }
    },
    [setItemOrderKeys],
  );

  const handleMoveItem = useCallback(
    (itemKey: string, direction: "up" | "down") => {
      setItemOrderKeys(prev => {
        const oldIndex = prev.indexOf(itemKey);
        if (oldIndex === -1) return prev;
        const newIndex = direction === "up" ? oldIndex - 1 : oldIndex + 1;
        if (newIndex < 0 || newIndex >= prev.length) return prev;
        return arrayMove(prev, oldIndex, newIndex);
      });
    },
    [setItemOrderKeys],
  );

  const handleDeleteConfirm = useCallback(() => {
    if (!deleteTarget) return;
    deleteAction.mutate({ actionId: deleteTarget.id, missionId });
  }, [deleteTarget, deleteAction, missionId]);

  return {
    viewState: {
      isBusy: isBusyTotal,
      isActionsLoading,
      hasPendingChanges,
      hasValidationIssues,
      validationIssueCount,
    },
    listState: {
      orderedActionItems,
      openItemKey,
      actionTypeByItemKey,
      existingFormVersionById,
      draftHydrationVersion,
    },
    formRefs,
    deleteDialog: {
      target: deleteTarget,
      isPending: deleteAction.isPending,
      onOpen: setDeleteTarget,
      onClose: () => setDeleteTarget(null),
      onConfirm: handleDeleteConfirm,
    },
    handlers: {
      handleAddDraft,
      handleRemoveDraft,
      handleToggleItem,
      handleActionTypeChange,
      handleDragEnd,
      handleMoveItem,
      handleItemDirtyChange,
      handleItemValidationChange,
      handleItemRawSnapshotChange,
    },
    saveHandle,
  };
}
