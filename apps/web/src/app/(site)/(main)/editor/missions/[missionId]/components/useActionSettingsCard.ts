import type {
  ActionFormHandle,
  ActionFormRawSnapshot,
} from "@/app/(site)/mission/[missionId]/manage/actions/components/ActionForm";
import {
  makeDraftActionId,
  mapEditInitialValues,
} from "@/app/(site)/mission/[missionId]/manage/actions/logic";
import { useReadActionsDetail } from "@/hooks/action";
import { useReadMission } from "@/hooks/mission";
import type { DragEndEvent } from "@dnd-kit/core";
import { arrayMove } from "@dnd-kit/sortable";
import { ActionType } from "@prisma/client";
import { useAtom, useAtomValue, useSetAtom } from "jotai";
import { useCallback, useEffect, useMemo, useRef } from "react";
import {
  actionDirtyByItemKeyAtom,
  actionDraftHydrationVersionAtom,
  actionDraftItemsAtom,
  actionFormSnapshotByItemKeyAtom,
  actionFormVersionByIdAtom,
  actionIsFlowDialogOpenAtom,
  actionItemOrderKeysAtom,
  actionOpenItemKeyAtom,
  actionScrollTargetItemKeyAtom,
  actionTypeByItemKeyAtom,
  actionValidationIssueCountByItemKeyAtom,
  cleanupDeletedActionRefsAtom,
  markActionRemovedAtom,
  removedActionIdsAtom,
  resetActionAfterSaveAtom,
} from "../atoms/editorActionAtoms";
import { completionOptionsAtom, isAiCompletionEnabledAtom } from "../atoms/editorDerivedAtoms";
import { editorDraftVersionAtom } from "../atoms/editorDraftVersionAtom";
import { mobilePreviewModeAtom } from "../atoms/editorMobilePreviewAtom";
import type {
  ActionListItem,
  ActionSectionDraftSnapshot,
  ActionSettingsCardProps,
} from "./actionSettingsCard.types";
import {
  areActionSnapshotsEqual,
  areStringArraysEqual,
  computeOrderedItems,
  createDraftKey,
  deleteKeyFromRecord,
  filterByValidKeys,
  getDraftItemKey,
  getExistingItemKey,
  syncOrderKeys,
} from "./actionSettingsCard.utils";
import { analyzeEditorFlow } from "./editor-publish-flow-validation";
import type { SectionSaveHandle } from "./editor-save.types";
import { toggleItemWithPreview } from "./editorMobilePreview.utils";
import { scrollToFirstFieldError } from "./editorScrollToItem";
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
    existingFormVersionById: Record<string, number>;
    draftHydrationVersion: number;
  };
  derived: {
    completionOptions: Array<{ id: string; title: string }>;
    linkTargets: Array<{ id: string; title: string; order: number }>;
    entryActionId: string | null;
    referencedActionIdsBySource: Map<string, Set<string>>;
    flowAnalysis: ReturnType<typeof analyzeEditorFlow> | null;
  };
  formRefs: React.MutableRefObject<Record<string, ActionFormHandle | null>>;
  flowDialog: {
    isOpen: boolean;
    onOpenChange: (open: boolean) => void;
  };
  handlers: {
    handleAddDraft: () => void;
    handleRemoveDraft: (draftKey: string) => void;
    handleRemoveExisting: (actionId: string) => void;
    handleToggleItem: (itemKey: string) => void;
    handleActionTypeChange: (itemKey: string, type: ActionType) => void;
    handleDragEnd: (event: DragEndEvent) => void;
    handleMoveItem: (itemKey: string, direction: "up" | "down") => void;
    handleItemDirtyChange: (itemKey: string, isDirty: boolean) => void;
    handleItemValidationChange: (itemKey: string, issueCount: number) => void;
    handleItemRawSnapshotChange: (itemKey: string, snapshot: ActionFormRawSnapshot) => void;
    handleDuplicateItem: (itemKey: string) => void;
  };
  saveHandle: SectionSaveHandle;
  scrollToFirstError: () => void;
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
  const [removedExistingIds, setRemovedExistingIds] = useAtom(removedActionIdsAtom);
  const dispatchMarkRemoved = useSetAtom(markActionRemovedAtom);
  const dispatchResetAfterSave = useSetAtom(resetActionAfterSaveAtom);
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
  const setDraftHydrationVersion = useSetAtom(actionDraftHydrationVersionAtom);
  const dispatchCleanupDeletedActionRefs = useSetAtom(cleanupDeletedActionRefsAtom);
  const incrementDraftVersion = useSetAtom(editorDraftVersionAtom);
  const [isFlowDialogOpen, setIsFlowDialogOpen] = useAtom(actionIsFlowDialogOpenAtom);
  const setIsAiCompletionEnabled = useSetAtom(isAiCompletionEnabledAtom);
  const setMobilePreviewMode = useSetAtom(mobilePreviewModeAtom);
  const setScrollTarget = useSetAtom(actionScrollTargetItemKeyAtom);

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

  const allExistingActions = useMemo(() => {
    const list = actionsData?.data ?? [];
    return [...list].sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
  }, [actionsData]);

  const existingActions = useMemo(
    () => allExistingActions.filter(action => !removedExistingIds.has(action.id)),
    [allExistingActions, removedExistingIds],
  );

  const isBusy = false;
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

  const orderedActionItems = useMemo<ActionListItem[]>(
    () => computeOrderedItems(actionItems, itemOrderKeys),
    [actionItems, itemOrderKeys],
  );

  const defaultOrderKeys = useMemo(() => actionItems.map(item => item.key), [actionItems]);

  const orderedItemKeys = useMemo(
    () => orderedActionItems.map(item => item.key),
    [orderedActionItems],
  );

  const hasOrderChanges = useMemo(
    () => !areStringArraysEqual(orderedItemKeys, defaultOrderKeys),
    [defaultOrderKeys, orderedItemKeys],
  );

  const firstItem = orderedActionItems[0];
  const firstOrderedActionId = firstItem
    ? firstItem.kind === "existing"
      ? firstItem.action.id
      : makeDraftActionId(firstItem.draft.key)
    : null;
  const entryActionId = missionData?.data?.entryActionId ?? firstOrderedActionId;

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
      removedExistingIds: [...removedExistingIds],
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
    removedExistingIds,
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
    if (removedExistingIds.size > 0) return true;
    if (hasOrderChanges) return true;
    return existingActions.some(action => dirtyByItemKey[getExistingItemKey(action.id)]);
  }, [draftItems.length, removedExistingIds, existingActions, dirtyByItemKey, hasOrderChanges]);

  const { isApplying, saveHandle } = useActionSaveFlow({
    missionId,
    formRefs,
    orderedActionItems,
    isActionsLoading,
    isBusy,
    hasPendingChanges,
    getActionDraftSnapshot,
    removedActionIds: removedExistingIds,
    dispatchResetAfterSave,
    setRemovedActionIds: setRemovedExistingIds,
  });

  const isBusyTotal = isApplying || isBusy;

  // biome-ignore lint/correctness/useExhaustiveDependencies: 안정 참조 제외 - setDirtyByItemKey, setDraftFormSnapshotByItemKey, setValidationIssueCountByItemKey
  useEffect(() => {
    const validKeys = new Set(orderedActionItems.map(item => item.key));
    setDirtyByItemKey(prev => filterByValidKeys(prev, validKeys));
    setDraftFormSnapshotByItemKey(prev => filterByValidKeys(prev, validKeys));
    setValidationIssueCountByItemKey(prev => filterByValidKeys(prev, validKeys));
  }, [orderedActionItems]);

  // biome-ignore lint/correctness/useExhaustiveDependencies: 안정 참조 제외 - setItemOrderKeys
  useEffect(() => {
    const validKeys = actionItems.map(item => item.key);
    setItemOrderKeys(prev => syncOrderKeys(prev, validKeys));
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
      incrementDraftVersion(v => v + 1);
    },
    [setDraftFormSnapshotByItemKey, incrementDraftVersion],
  );

  // biome-ignore lint/correctness/useExhaustiveDependencies: 안정 참조 제외 - setDraftItems, setActionTypeByItemKey, setOpenItemKey, setScrollTarget, setDraftFormSnapshotByItemKey, setDraftHydrationVersion
  const handleAddDraft = useCallback(() => {
    const draftKey = createDraftKey();
    const itemKey = getDraftItemKey(draftKey);
    const newDraftActionId = makeDraftActionId(draftKey);

    setDraftItems(prev => [...prev, { key: draftKey }]);
    setActionTypeByItemKey(prev => ({ ...prev, [itemKey]: ActionType.MULTIPLE_CHOICE }));
    setOpenItemKey(itemKey);
    setScrollTarget(itemKey);

    const prevItem = orderedActionItems[orderedActionItems.length - 1];
    if (!prevItem) return;

    const prevItemKey = prevItem.key;
    const prevActionType =
      actionTypeByItemKey[prevItemKey] ??
      (prevItem.kind === "existing" ? prevItem.action.type : undefined);
    if (!prevActionType) return;

    const prevSnapshot = draftFormSnapshotByItemKey[prevItemKey];
    const prevValues =
      prevSnapshot?.values ??
      (prevItem.kind === "existing" ? mapEditInitialValues(prevItem.action) : undefined);
    if (!prevValues) return;

    if (prevActionType === ActionType.BRANCH) {
      const hasUnlinkedOption = prevValues.options?.some(o => !o.nextActionId);
      if (!hasUnlinkedOption) return;

      const updatedValues = {
        ...prevValues,
        options: prevValues.options?.map(o =>
          o.nextActionId ? o : { ...o, nextActionId: newDraftActionId },
        ),
      };
      setDraftFormSnapshotByItemKey(prev => ({
        ...prev,
        [prevItemKey]: {
          actionType: prevSnapshot?.actionType ?? prevActionType,
          values: updatedValues,
        },
      }));
    } else {
      if (prevValues.nextActionId) return;

      setDraftFormSnapshotByItemKey(prev => ({
        ...prev,
        [prevItemKey]: {
          actionType: prevSnapshot?.actionType ?? prevActionType,
          values: { ...prevValues, nextActionId: newDraftActionId },
        },
      }));
    }

    setDraftHydrationVersion(v => v + 1);
  }, [orderedActionItems, actionTypeByItemKey, draftFormSnapshotByItemKey]);

  // biome-ignore lint/correctness/useExhaustiveDependencies: 안정 참조 제외 - setDraftItems, setActionTypeByItemKey, setDraftFormSnapshotByItemKey, setOpenItemKey, setScrollTarget
  const handleDuplicateItem = useCallback(
    (itemKey: string) => {
      const snapshot = formRefs.current[itemKey]?.getRawSnapshot();
      if (!snapshot) return;

      const draftKey = createDraftKey();
      const newItemKey = getDraftItemKey(draftKey);

      setDraftItems(prev => [...prev, { key: draftKey }]);
      setActionTypeByItemKey(prev => ({ ...prev, [newItemKey]: snapshot.actionType }));
      setDraftFormSnapshotByItemKey(prev => ({
        ...prev,
        [newItemKey]: {
          ...snapshot,
          values: {
            ...snapshot.values,
            title: `${snapshot.values.title} (복제)`,
            nextActionId: null,
            nextCompletionId: null,
          },
        },
      }));
      setOpenItemKey(newItemKey);
      setScrollTarget(newItemKey);
    },
    [setScrollTarget],
  );

  // biome-ignore lint/correctness/useExhaustiveDependencies: 안정 참조 제외 - setDraftItems, setActionTypeByItemKey, setDirtyByItemKey, setValidationIssueCountByItemKey, setOpenItemKey, dispatchCleanupDeletedActionRefs
  const handleRemoveDraft = useCallback((draftKey: string) => {
    const itemKey = getDraftItemKey(draftKey);
    const deletedActionId = makeDraftActionId(draftKey);

    setDraftItems(prev => prev.filter(item => item.key !== draftKey));
    setActionTypeByItemKey(prev => deleteKeyFromRecord(prev, itemKey));
    setDirtyByItemKey(prev => deleteKeyFromRecord(prev, itemKey));

    dispatchCleanupDeletedActionRefs({ itemKey, deletedActionId });

    setValidationIssueCountByItemKey(prev => deleteKeyFromRecord(prev, itemKey));
    delete formRefs.current[itemKey];
    setOpenItemKey(prev => (prev === itemKey ? null : prev));
  }, []);

  const handleToggleItem = useCallback(
    (itemKey: string) => {
      toggleItemWithPreview(
        itemKey,
        orderedActionItems,
        setOpenItemKey,
        setMobilePreviewMode,
        item => ({ type: "action", actionId: item.action.id }),
        openItemKey,
      );
    },
    [orderedActionItems, setMobilePreviewMode, setOpenItemKey, openItemKey],
  );

  // biome-ignore lint/correctness/useExhaustiveDependencies: 안정 참조 제외 - setActionTypeByItemKey
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

  const handleRemoveExisting = useCallback(
    (actionId: string) => {
      const itemKey = getExistingItemKey(actionId);

      const affectedActionIds = allExistingActions
        .filter(
          action =>
            action.id !== actionId &&
            (action.nextActionId === actionId ||
              action.options.some(option => option.nextActionId === actionId)),
        )
        .map(action => action.id);

      dispatchMarkRemoved(actionId);

      setExistingFormVersionById(prev => {
        const next = { ...prev };
        for (const affectedId of affectedActionIds) {
          next[affectedId] = (next[affectedId] ?? 0) + 1;
        }
        return next;
      });

      delete formRefs.current[itemKey];
      setActionTypeByItemKey(prev => deleteKeyFromRecord(prev, itemKey));
      setDirtyByItemKey(prev => {
        const next = deleteKeyFromRecord(prev, itemKey);
        for (const affectedId of affectedActionIds) {
          delete next[getExistingItemKey(affectedId)];
        }
        return next;
      });
      setValidationIssueCountByItemKey(prev => {
        const next = deleteKeyFromRecord(prev, itemKey);
        for (const affectedId of affectedActionIds) {
          delete next[getExistingItemKey(affectedId)];
        }
        return next;
      });
      setOpenItemKey(prev => (prev === itemKey ? null : prev));

      dispatchCleanupDeletedActionRefs({ itemKey, deletedActionId: actionId });
    },
    [
      allExistingActions,
      dispatchMarkRemoved,
      setExistingFormVersionById,
      setActionTypeByItemKey,
      setDirtyByItemKey,
      setValidationIssueCountByItemKey,
      setOpenItemKey,
      dispatchCleanupDeletedActionRefs,
    ],
  );

  const scrollToFirstError = useCallback(() => {
    scrollToFirstFieldError({
      items: orderedActionItems,
      validationIssueCountByItemKey,
      formRefs,
      setOpenItemKey,
    });
  }, [orderedActionItems, validationIssueCountByItemKey, setOpenItemKey]);

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
      existingFormVersionById,
      draftHydrationVersion,
    },
    derived: {
      completionOptions,
      linkTargets,
      entryActionId,
      referencedActionIdsBySource,
      flowAnalysis,
    },
    formRefs,
    flowDialog: {
      isOpen: isFlowDialogOpen,
      onOpenChange: setIsFlowDialogOpen,
    },
    handlers: {
      handleAddDraft,
      handleRemoveDraft,
      handleRemoveExisting,
      handleToggleItem,
      handleActionTypeChange,
      handleDragEnd,
      handleMoveItem,
      handleItemDirtyChange,
      handleItemValidationChange,
      handleItemRawSnapshotChange,
      handleDuplicateItem,
    },
    saveHandle,
    scrollToFirstError,
  };
}
