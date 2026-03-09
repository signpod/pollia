import type {
  ActionFormHandle,
  ActionFormRawSnapshot,
} from "@/app/(site)/mission/[missionId]/manage/actions/components/ActionForm";
import { useManageDeleteAction } from "@/app/(site)/mission/[missionId]/manage/actions/hooks";
import { useReadActionsDetail } from "@/hooks/action";
import { useReadMission } from "@/hooks/mission";
import type { ActionDetail } from "@/types/dto";
import { ActionType } from "@prisma/client";
import { toast } from "@repo/ui/components";
import { useAtom, useAtomValue, useSetAtom } from "jotai";
import { AlertCircle } from "lucide-react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  actionDirtyByItemKeyAtom,
  actionDraftHydrationVersionAtom,
  actionDraftItemsAtom,
  actionFormSnapshotByItemKeyAtom,
  actionFormVersionByIdAtom,
  actionIsFlowDialogOpenAtom,
  actionItemOrderKeysAtom,
  actionOpenItemKeyAtom,
  actionTypeByItemKeyAtom,
  actionValidationIssueCountByItemKeyAtom,
} from "../atoms/editorActionAtoms";
import { completionOptionsAtom, isAiCompletionEnabledAtom } from "../atoms/editorDerivedAtoms";
import type {
  ActionListItem,
  ActionSectionDraftSnapshot,
  ActionSettingsCardProps,
} from "./actionSettingsCard.types";
import {
  areActionSnapshotsEqual,
  areStringArraysEqual,
  createDraftKey,
  getDraftItemKey,
  getExistingItemKey,
} from "./actionSettingsCard.utils";
import { analyzeEditorFlow } from "./editor-publish-flow-validation";
import type { SectionSaveHandle } from "./editor-save.types";
import { useActionFlowAnalysis } from "./useActionFlowAnalysis";
import { useActionLinkDerived } from "./useActionLinkDerived";
import { useActionSaveFlow } from "./useActionSaveFlow";

export interface UseActionSettingsCardReturn {
  viewState: {
    isBusy: boolean;
    isActionsLoading: boolean;
    isFlowLoading: boolean;
    hasPendingChanges: boolean;
    hasValidationIssues: boolean;
    validationIssueCount: number;
    isAiCompletionEnabled: boolean;
    isInactiveMission: boolean;
    flowErrorMessage: string | null;
  };
  listState: {
    orderedActionItems: ActionListItem[];
    openItemKey: string | null;
    actionTypeByItemKey: Record<string, ActionType>;
    draftFormSnapshotByItemKey: Record<string, ActionFormRawSnapshot>;
    existingFormVersionById: Record<string, number>;
    draftHydrationVersion: number;
  };
  derived: {
    completionOptions: Array<{ id: string; title: string }>;
    linkTargets: Array<{ id: string; title: string; order: number }>;
    referencedActionIdsBySource: Map<string, Set<string>>;
    flowAnalysis: ReturnType<typeof analyzeEditorFlow> | null;
  };
  formRefs: React.MutableRefObject<Record<string, ActionFormHandle | null>>;
  deleteDialog: {
    target: ActionDetail | null;
    isPending: boolean;
    onOpen: (action: ActionDetail) => void;
    onClose: () => void;
    onConfirm: () => void;
  };
  flowDialog: {
    isOpen: boolean;
    onOpenChange: (open: boolean) => void;
  };
  handlers: {
    handleAddDraft: () => void;
    handleRemoveDraft: (draftKey: string) => void;
    handleToggleItem: (itemKey: string) => void;
    handleActionTypeChange: (itemKey: string, type: ActionType) => void;
    handleMoveItem: (itemKey: string, direction: -1 | 1) => void;
    handleItemDirtyChange: (itemKey: string, isDirty: boolean) => void;
    handleItemValidationChange: (itemKey: string, issueCount: number) => void;
    handleItemRawSnapshotChange: (itemKey: string, snapshot: ActionFormRawSnapshot) => void;
  };
  saveHandle: SectionSaveHandle;
}

export function useActionSettingsCard({
  missionId,
  useAiCompletion: useAiCompletionOverride,
  onSaveStateChange,
}: ActionSettingsCardProps): UseActionSettingsCardReturn {
  const formRefs = useRef<Record<string, ActionFormHandle | null>>({});
  const [draftItems, setDraftItems] = useAtom(actionDraftItemsAtom);
  const [itemOrderKeys, setItemOrderKeys] = useAtom(actionItemOrderKeysAtom);
  const [openItemKey, setOpenItemKey] = useAtom(actionOpenItemKeyAtom);
  const [deleteTarget, setDeleteTarget] = useState<ActionDetail | null>(null);
  const [dirtyByItemKey, setDirtyByItemKey] = useAtom(actionDirtyByItemKeyAtom);
  const [existingFormVersionById, setExistingFormVersionById] = useAtom(actionFormVersionByIdAtom);
  const [actionTypeByItemKey, setActionTypeByItemKey] = useAtom(actionTypeByItemKeyAtom);
  const [draftFormSnapshotByItemKey, setDraftFormSnapshotByItemKey] = useAtom(
    actionFormSnapshotByItemKeyAtom,
  );
  const [validationIssueCountByItemKey, setValidationIssueCountByItemKey] = useAtom(
    actionValidationIssueCountByItemKeyAtom,
  );
  const draftHydrationVersion = useAtomValue(actionDraftHydrationVersionAtom);
  const [isFlowDialogOpen, setIsFlowDialogOpen] = useAtom(actionIsFlowDialogOpenAtom);
  const setIsAiCompletionEnabled = useSetAtom(isAiCompletionEnabledAtom);

  const {
    data: missionData,
    isLoading: isMissionLoading,
    error: missionError,
  } = useReadMission(missionId);
  const {
    data: actionsData,
    isLoading: isActionsLoading,
    error: actionsError,
  } = useReadActionsDetail(missionId);

  const existingActions = useMemo(() => {
    const list = actionsData?.data ?? [];
    return [...list].sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
  }, [actionsData]);

  const deleteAction = useManageDeleteAction({
    onSuccess: () => {
      const deletingActionId = deleteTarget?.id;

      if (deletingActionId) {
        const deletingItemKey = getExistingItemKey(deletingActionId);
        const affectedActionIds = existingActions
          .filter(
            action =>
              action.id !== deletingActionId &&
              (action.nextActionId === deletingActionId ||
                action.options.some(option => option.nextActionId === deletingActionId)),
          )
          .map(action => action.id);

        setExistingFormVersionById(prev => {
          const next = { ...prev };
          delete next[deletingActionId];
          for (const actionId of affectedActionIds) {
            next[actionId] = (next[actionId] ?? 0) + 1;
          }
          return next;
        });

        delete formRefs.current[deletingItemKey];
        setActionTypeByItemKey(prev => {
          const next = { ...prev };
          delete next[deletingItemKey];
          return next;
        });
        setDirtyByItemKey(prev => {
          const next = { ...prev };
          delete next[deletingItemKey];
          for (const actionId of affectedActionIds) {
            delete next[getExistingItemKey(actionId)];
          }
          return next;
        });
        setValidationIssueCountByItemKey(prev => {
          const next = { ...prev };
          delete next[deletingItemKey];
          for (const actionId of affectedActionIds) {
            delete next[getExistingItemKey(actionId)];
          }
          return next;
        });
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
  const isInactiveMission = missionData?.data?.isActive === false;
  const isAiCompletionEnabled =
    useAiCompletionOverride ?? missionData?.data?.useAiCompletion === true;

  useEffect(() => {
    setIsAiCompletionEnabled(isAiCompletionEnabled);
  }, [isAiCompletionEnabled, setIsAiCompletionEnabled]);

  const completionOptions = useAtomValue(completionOptionsAtom);

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
    if (actionItems.length === 0) {
      return [];
    }

    const actionItemByKey = new Map(actionItems.map(item => [item.key, item]));
    const orderedKeys: string[] = [];
    const seen = new Set<string>();

    for (const key of itemOrderKeys) {
      if (seen.has(key) || !actionItemByKey.has(key)) {
        continue;
      }
      orderedKeys.push(key);
      seen.add(key);
    }

    for (const item of actionItems) {
      if (seen.has(item.key)) {
        continue;
      }
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

  const entryActionId = missionData?.data?.entryActionId ?? null;

  const { linkTargets, referencedActionIdsBySource } = useActionLinkDerived({
    orderedActionItems,
    draftFormSnapshotByItemKey,
    actionTypeByItemKey,
    entryActionId,
  });

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

  const { flowAnalysis, flowErrorMessage, isFlowLoading } = useActionFlowAnalysis({
    missionData,
    actionsData,
    missionError: missionError instanceof Error ? missionError : null,
    actionsError: actionsError instanceof Error ? actionsError : null,
    isMissionLoading,
    isActionsLoading,
    isAiCompletionEnabled,
    getActionDraftSnapshot,
  });

  const hasPendingChanges = useMemo(() => {
    if (draftItems.length > 0) return true;
    if (hasOrderChanges) return true;
    return existingActions.some(action => dirtyByItemKey[getExistingItemKey(action.id)]);
  }, [draftItems.length, existingActions, dirtyByItemKey, hasOrderChanges]);

  const { isApplying, saveHandle } = useActionSaveFlow({
    missionId,
    formRefs,
    orderedActionItems,
    isActionsLoading,
    isBusy,
    hasPendingChanges,
    getActionDraftSnapshot,
  });

  const isBusyTotal = isApplying || isBusy;

  // biome-ignore lint/correctness/useExhaustiveDependencies: 안정 참조 제외 - setDirtyByItemKey, setDraftFormSnapshotByItemKey, setValidationIssueCountByItemKey
  useEffect(() => {
    const validKeys = new Set(orderedActionItems.map(item => item.key));
    setDirtyByItemKey(prev => {
      let hasChange = false;
      const next: Record<string, boolean> = {};

      for (const [key, value] of Object.entries(prev)) {
        if (validKeys.has(key)) {
          next[key] = value;
        } else {
          hasChange = true;
        }
      }

      return hasChange ? next : prev;
    });

    setDraftFormSnapshotByItemKey(prev => {
      let hasChange = false;
      const next: Record<string, ActionFormRawSnapshot> = {};
      for (const [key, value] of Object.entries(prev)) {
        if (validKeys.has(key)) {
          next[key] = value;
        } else {
          hasChange = true;
        }
      }
      return hasChange ? next : prev;
    });

    setValidationIssueCountByItemKey(prev => {
      let hasChange = false;
      const next: Record<string, number> = {};
      for (const [key, value] of Object.entries(prev)) {
        if (validKeys.has(key)) {
          next[key] = value;
        } else {
          hasChange = true;
        }
      }
      return hasChange ? next : prev;
    });
  }, [orderedActionItems]);

  // biome-ignore lint/correctness/useExhaustiveDependencies: 안정 참조 제외 - setItemOrderKeys
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

  // biome-ignore lint/correctness/useExhaustiveDependencies: 안정 참조 제외 - setDirtyByItemKey
  const handleItemDirtyChange = useCallback((itemKey: string, isDirty: boolean) => {
    setDirtyByItemKey(prev => {
      if (prev[itemKey] === isDirty) {
        return prev;
      }

      return { ...prev, [itemKey]: isDirty };
    });
  }, []);

  // biome-ignore lint/correctness/useExhaustiveDependencies: 안정 참조 제외 - setValidationIssueCountByItemKey
  const handleItemValidationChange = useCallback((itemKey: string, issueCount: number) => {
    setValidationIssueCountByItemKey(prev => {
      if ((prev[itemKey] ?? 0) === issueCount) {
        return prev;
      }

      return { ...prev, [itemKey]: issueCount };
    });
  }, []);

  const handleItemRawSnapshotChange = useCallback(
    (itemKey: string, snapshot: ActionFormRawSnapshot) => {
      setDraftFormSnapshotByItemKey(prev => {
        if (areActionSnapshotsEqual(prev[itemKey], snapshot)) {
          return prev;
        }

        return {
          ...prev,
          [itemKey]: snapshot,
        };
      });
    },
    [setDraftFormSnapshotByItemKey],
  );

  const handleAddDraft = () => {
    const draftKey = createDraftKey();
    const itemKey = getDraftItemKey(draftKey);

    setDraftItems(prev => [...prev, { key: draftKey }]);
    setActionTypeByItemKey(prev => ({ ...prev, [itemKey]: ActionType.MULTIPLE_CHOICE }));
    setOpenItemKey(itemKey);
  };

  const handleRemoveDraft = (draftKey: string) => {
    const itemKey = getDraftItemKey(draftKey);
    setDraftItems(prev => prev.filter(item => item.key !== draftKey));
    setActionTypeByItemKey(prev => {
      const next = { ...prev };
      delete next[itemKey];
      return next;
    });
    setDirtyByItemKey(prev => {
      const next = { ...prev };
      delete next[itemKey];
      return next;
    });
    setDraftFormSnapshotByItemKey(prev => {
      const next = { ...prev };
      delete next[itemKey];
      return next;
    });
    setValidationIssueCountByItemKey(prev => {
      const next = { ...prev };
      delete next[itemKey];
      return next;
    });
    delete formRefs.current[itemKey];
    setOpenItemKey(prev => (prev === itemKey ? null : prev));
  };

  const handleToggleItem = (itemKey: string) => {
    setOpenItemKey(prev => (prev === itemKey ? null : itemKey));
  };

  const handleActionTypeChange = (itemKey: string, actionType: ActionType) => {
    setActionTypeByItemKey(prev => ({ ...prev, [itemKey]: actionType }));
  };

  const handleMoveItem = useCallback(
    (itemKey: string, direction: -1 | 1) => {
      setItemOrderKeys(prev => {
        const currentIndex = prev.indexOf(itemKey);
        if (currentIndex < 0) {
          return prev;
        }

        const nextIndex = currentIndex + direction;
        if (nextIndex < 0 || nextIndex >= prev.length) {
          return prev;
        }

        const next = [...prev];
        const currentValue = next[currentIndex];
        const targetValue = next[nextIndex];
        if (!currentValue || !targetValue) {
          return prev;
        }

        next[currentIndex] = targetValue;
        next[nextIndex] = currentValue;
        return next;
      });
    },
    [setItemOrderKeys],
  );

  const handleDeleteConfirm = () => {
    if (!deleteTarget) return;
    deleteAction.mutate({ actionId: deleteTarget.id, missionId });
  };

  return {
    viewState: {
      isBusy: isBusyTotal,
      isActionsLoading,
      isFlowLoading,
      hasPendingChanges,
      hasValidationIssues,
      validationIssueCount,
      isAiCompletionEnabled,
      isInactiveMission,
      flowErrorMessage,
    },
    listState: {
      orderedActionItems,
      openItemKey,
      actionTypeByItemKey,
      draftFormSnapshotByItemKey,
      existingFormVersionById,
      draftHydrationVersion,
    },
    derived: {
      completionOptions,
      linkTargets,
      referencedActionIdsBySource,
      flowAnalysis,
    },
    formRefs,
    deleteDialog: {
      target: deleteTarget,
      isPending: deleteAction.isPending,
      onOpen: setDeleteTarget,
      onClose: () => setDeleteTarget(null),
      onConfirm: handleDeleteConfirm,
    },
    flowDialog: {
      isOpen: isFlowDialogOpen,
      onOpenChange: setIsFlowDialogOpen,
    },
    handlers: {
      handleAddDraft,
      handleRemoveDraft,
      handleToggleItem,
      handleActionTypeChange,
      handleMoveItem,
      handleItemDirtyChange,
      handleItemValidationChange,
      handleItemRawSnapshotChange,
    },
    saveHandle,
  };
}
