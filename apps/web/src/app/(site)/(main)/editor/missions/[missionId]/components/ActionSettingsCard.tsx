"use client";

import { getCompletionsByMissionId } from "@/actions/mission-completion";
import { applyMissionActionSectionDraft } from "@/actions/mission/apply-draft";
import {
  ActionForm,
  type ActionFormHandle,
  type ActionFormRawSnapshot,
} from "@/app/(site)/mission/[missionId]/manage/actions/components/ActionForm";
import { useManageDeleteAction } from "@/app/(site)/mission/[missionId]/manage/actions/hooks";
import {
  makeDraftActionId,
  mapEditInitialValues,
} from "@/app/(site)/mission/[missionId]/manage/actions/logic";
import { ACTION_TYPE_LABELS } from "@/constants/action";
import { actionQueryKeys } from "@/constants/queryKeys/actionQueryKeys";
import { missionCompletionQueryKeys } from "@/constants/queryKeys/missionCompletionQueryKeys";
import { missionQueryKeys } from "@/constants/queryKeys/missionQueryKeys";
import { useReadActionsDetail } from "@/hooks/action";
import { useReadMission } from "@/hooks/mission";
import type { ActionDetail } from "@/types/dto";
import { ActionType } from "@prisma/client";
import {
  Button,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogOverlay,
  DialogPortal,
  DialogTitle,
  Typo,
  toast,
} from "@repo/ui/components";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
  AlertCircle,
  ArrowDown,
  ArrowUp,
  ChevronDown,
  GitBranch,
  Plus,
  Trash2,
  X,
} from "lucide-react";
import {
  type ForwardedRef,
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useMemo,
  useRef,
  useState,
} from "react";
import { makeDraftCompletionId, useEditorMissionDraft } from "./EditorMissionDraftContext";
import { FlowOverviewDialog } from "./FlowOverviewDialog";
import { analyzeEditorFlow } from "./editor-publish-flow-validation";
import type {
  SectionSaveHandle,
  SectionSaveOptions,
  SectionSaveResult,
  SectionSaveStateChangeHandler,
} from "./editor-save.types";

interface ActionSettingsCardProps {
  missionId: string;
  useAiCompletion?: boolean;
  onSaveStateChange?: SectionSaveStateChangeHandler;
  getCompletionDraftSnapshot?: () => unknown | null;
  completionWorkingSetVersion?: number;
  onWorkingSetChange?: (draftSnapshot: ActionSectionDraftSnapshot) => void;
}

interface DraftActionItem {
  key: string;
}

interface ExistingListItem {
  key: string;
  kind: "existing";
  action: ActionDetail;
}

interface DraftListItem {
  key: string;
  kind: "draft";
  draft: DraftActionItem;
}

type ActionListItem = ExistingListItem | DraftListItem;

export interface ActionSectionDraftSnapshot {
  draftItems: DraftActionItem[];
  openItemKey: string | null;
  dirtyByItemKey: Record<string, boolean>;
  actionTypeByItemKey: Record<string, ActionType>;
  formSnapshotByItemKey: Record<string, ActionFormRawSnapshot>;
  itemOrderKeys?: string[];
}

function createDraftKey() {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }

  return `draft-${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

function getExistingItemKey(actionId: string) {
  return `existing:${actionId}`;
}

function getDraftItemKey(draftKey: string) {
  return `draft:${draftKey}`;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

function toNullableString(value: unknown): string | null {
  if (typeof value !== "string") {
    return null;
  }

  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
}

function parseCompletionDraftSnapshotForOptions(snapshot: unknown): {
  removedExistingIds: Set<string>;
  draftItems: Array<{ key: string; title: string }>;
  titleByItemKey: Record<string, string>;
} | null {
  if (!isRecord(snapshot)) {
    return null;
  }

  const removedExistingIds = new Set<string>(
    Array.isArray(snapshot.removedExistingIds)
      ? snapshot.removedExistingIds
          .map(id => toNullableString(id))
          .filter((id): id is string => Boolean(id))
      : [],
  );

  const draftItems = Array.isArray(snapshot.draftItems)
    ? snapshot.draftItems.flatMap(item => {
        if (!isRecord(item)) {
          return [];
        }

        const key = toNullableString(item.key);
        if (!key) {
          return [];
        }

        return [
          {
            key,
            title: toNullableString(item.title) ?? "새 결과 화면",
          },
        ];
      })
    : [];

  const titleByItemKey: Record<string, string> = {};
  if (isRecord(snapshot.formSnapshotByItemKey)) {
    for (const [itemKey, raw] of Object.entries(snapshot.formSnapshotByItemKey)) {
      if (!isRecord(raw)) {
        continue;
      }

      const title = toNullableString(raw.title);
      if (title) {
        titleByItemKey[itemKey] = title;
      }
    }
  }

  return {
    removedExistingIds,
    draftItems,
    titleByItemKey,
  };
}

function areActionSnapshotsEqual(
  left: ActionFormRawSnapshot | undefined,
  right: ActionFormRawSnapshot,
) {
  if (!left) {
    return false;
  }

  return JSON.stringify(left) === JSON.stringify(right);
}

function areStringArraysEqual(left: string[], right: string[]) {
  if (left.length !== right.length) {
    return false;
  }

  for (let index = 0; index < left.length; index += 1) {
    if (left[index] !== right[index]) {
      return false;
    }
  }

  return true;
}

const NOOP = () => {};

function ActionSettingsCardComponent(
  {
    missionId,
    useAiCompletion: useAiCompletionOverride,
    onSaveStateChange,
    getCompletionDraftSnapshot,
    completionWorkingSetVersion = 0,
    onWorkingSetChange,
  }: ActionSettingsCardProps,
  ref: ForwardedRef<SectionSaveHandle>,
) {
  const queryClient = useQueryClient();
  const formRefs = useRef<Record<string, ActionFormHandle | null>>({});
  const [draftItems, setDraftItems] = useState<DraftActionItem[]>([]);
  const [itemOrderKeys, setItemOrderKeys] = useState<string[]>([]);
  const [openItemKey, setOpenItemKey] = useState<string | null>(null);
  const [isApplying, setIsApplying] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<ActionDetail | null>(null);
  const [dirtyByItemKey, setDirtyByItemKey] = useState<Record<string, boolean>>({});
  const [existingFormVersionById, setExistingFormVersionById] = useState<Record<string, number>>(
    {},
  );
  const [actionTypeByItemKey, setActionTypeByItemKey] = useState<Record<string, ActionType>>({});
  const [draftFormSnapshotByItemKey, setDraftFormSnapshotByItemKey] = useState<
    Record<string, ActionFormRawSnapshot>
  >({});
  const [validationIssueCountByItemKey, setValidationIssueCountByItemKey] = useState<
    Record<string, number>
  >({});
  const [draftHydrationVersion, setDraftHydrationVersion] = useState(0);
  const [isFlowDialogOpen, setIsFlowDialogOpen] = useState(false);
  const { completionDrafts, removeCompletionDraftById } = useEditorMissionDraft();

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
  const {
    data: completionsData,
    isLoading: isCompletionsLoading,
    error: completionsError,
  } = useQuery({
    queryKey: missionCompletionQueryKeys.missionCompletion(missionId),
    queryFn: () => getCompletionsByMissionId(missionId),
    staleTime: 5 * 60 * 1000,
  });

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

  const isBusy = isApplying || deleteAction.isPending;
  const isInactiveMission = missionData?.data?.isActive === false;
  const isAiCompletionEnabled =
    useAiCompletionOverride ?? missionData?.data?.useAiCompletion === true;

  const existingActions = useMemo(() => {
    const list = actionsData?.data ?? [];
    return [...list].sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
  }, [actionsData]);

  const completionOptions = useMemo(() => {
    if (isAiCompletionEnabled) {
      return [];
    }

    const parsedCompletionSnapshot = parseCompletionDraftSnapshotForOptions(
      getCompletionDraftSnapshot?.() ?? null,
    );
    const removedExistingIds = parsedCompletionSnapshot?.removedExistingIds ?? new Set<string>();
    const titleByItemKey = parsedCompletionSnapshot?.titleByItemKey ?? {};
    const existingOptions = (completionsData?.data ?? [])
      .filter(completion => !removedExistingIds.has(completion.id))
      .map(completion => {
        const itemKey = `existing:${completion.id}`;
        return {
          id: completion.id,
          title: titleByItemKey[itemKey] ?? completion.title ?? "완료 화면",
        };
      });

    const parsedDraftTitleByKey = new Map(
      (parsedCompletionSnapshot?.draftItems ?? []).map(draft => [draft.key, draft.title]),
    );
    const contextDraftTitleByKey = new Map(completionDrafts.map(draft => [draft.key, draft.title]));
    const mergedDraftKeys = [
      ...new Set([
        ...(parsedCompletionSnapshot?.draftItems ?? []).map(draft => draft.key),
        ...completionDrafts.map(draft => draft.key),
      ]),
    ];

    const draftOptions = mergedDraftKeys.map(draftKey => {
      const draftItemKey = getDraftItemKey(draftKey);
      const title =
        titleByItemKey[draftItemKey] ??
        parsedDraftTitleByKey.get(draftKey) ??
        contextDraftTitleByKey.get(draftKey) ??
        "새 결과 화면";
      return {
        id: makeDraftCompletionId(draftKey),
        title,
      };
    });

    return [...existingOptions, ...draftOptions];
  }, [
    isAiCompletionEnabled,
    completionDrafts,
    completionWorkingSetVersion,
    completionsData?.data,
    getCompletionDraftSnapshot,
  ]);

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

  const notifyWorkingSetChange = useCallback(() => {
    if (!onWorkingSetChange) {
      return;
    }

    onWorkingSetChange(getActionDraftSnapshot());
  }, [getActionDraftSnapshot, onWorkingSetChange]);

  const flowAnalysis = useMemo(() => {
    if (!missionData?.data || !actionsData?.data || !completionsData?.data) {
      return null;
    }

    return analyzeEditorFlow({
      entryActionId: missionData.data.entryActionId,
      useAiCompletion: isAiCompletionEnabled,
      serverActions: actionsData.data,
      serverCompletions: completionsData.data,
      actionDraftSnapshot: getActionDraftSnapshot(),
      completionDraftSnapshot: getCompletionDraftSnapshot?.() ?? null,
    });
  }, [
    actionsData?.data,
    completionsData?.data,
    getActionDraftSnapshot,
    getCompletionDraftSnapshot,
    isAiCompletionEnabled,
    missionData?.data,
  ]);

  const flowErrorMessage =
    missionError instanceof Error
      ? missionError.message
      : actionsError instanceof Error
        ? actionsError.message
        : completionsError instanceof Error
          ? completionsError.message
          : null;
  const isFlowLoading = isMissionLoading || isActionsLoading || isCompletionsLoading;

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

  const hasPendingChanges = useMemo(() => {
    if (draftItems.length > 0) {
      return true;
    }

    if (hasOrderChanges) {
      return true;
    }

    return existingActions.some(action => dirtyByItemKey[getExistingItemKey(action.id)]);
  }, [draftItems.length, existingActions, dirtyByItemKey, hasOrderChanges]);

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
      isBusy: isBusy || isActionsLoading,
      hasValidationIssues,
      validationIssueCount,
    });
  }, [
    hasPendingChanges,
    hasValidationIssues,
    isBusy,
    isActionsLoading,
    onSaveStateChange,
    validationIssueCount,
  ]);

  const handleItemDirtyChange = useCallback((itemKey: string, isDirty: boolean) => {
    setDirtyByItemKey(prev => {
      if (prev[itemKey] === isDirty) {
        return prev;
      }

      return { ...prev, [itemKey]: isDirty };
    });
  }, []);

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
      let hasChange = false;
      setDraftFormSnapshotByItemKey(prev => {
        if (areActionSnapshotsEqual(prev[itemKey], snapshot)) {
          return prev;
        }

        hasChange = true;
        return {
          ...prev,
          [itemKey]: snapshot,
        };
      });

      if (hasChange) {
        notifyWorkingSetChange();
      }
    },
    [notifyWorkingSetChange],
  );

  useEffect(() => {
    notifyWorkingSetChange();
  }, [draftItems, notifyWorkingSetChange]);

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
      let didMove = false;

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
        didMove = true;
        return next;
      });

      if (didMove) {
        notifyWorkingSetChange();
      }
    },
    [notifyWorkingSetChange],
  );

  const handleDeleteConfirm = () => {
    if (!deleteTarget) return;
    deleteAction.mutate({ actionId: deleteTarget.id, missionId });
  };

  const executeSave = async ({
    silent = false,
    showValidationUi = true,
    trigger = "manual",
  }: SectionSaveOptions = {}): Promise<SectionSaveResult> => {
    if (isActionsLoading || isBusy) {
      return { status: "failed", message: "진행 목록 저장이 진행 중입니다." };
    }

    const strictMode = trigger === "publish";

    for (const item of orderedActionItems) {
      const formRef = formRefs.current[item.key];
      if (!formRef) {
        if (showValidationUi) setOpenItemKey(item.key);
        const message = "질문 폼이 준비되지 않았습니다. 다시 시도해주세요.";
        if (strictMode) return { status: "failed", message };
        continue;
      }

      if (formRef.isUploading()) {
        if (showValidationUi) setOpenItemKey(item.key);
        const message = "이미지 업로드가 완료된 뒤 저장해주세요.";
        if (strictMode) return { status: "failed", message };
        continue;
      }

      const submission = formRef.validateAndGetSubmission({ showErrors: showValidationUi });
      if (!submission) {
        if (showValidationUi) setOpenItemKey(item.key);
        const message = "질문 입력값을 확인해주세요.";
        if (strictMode) return { status: "invalid", message };
      }
    }

    setIsApplying(true);
    try {
      const response = await applyMissionActionSectionDraft(missionId);
      const result = response.data;

      for (const tempId of Object.keys(result.tempToRealCompletionIdMap)) {
        removeCompletionDraftById(tempId);
      }

      const savedDraftKeys = new Set(
        Object.keys(result.tempToRealActionIdMap).map(key => key.replace(/^draft:/, "")),
      );
      if (savedDraftKeys.size > 0) {
        setDraftItems(prev => prev.filter(item => !savedDraftKeys.has(item.key)));
        setActionTypeByItemKey(prev => {
          const next = { ...prev };
          for (const draftKey of savedDraftKeys) {
            delete next[getDraftItemKey(draftKey)];
          }
          return next;
        });
      }

      setDirtyByItemKey({});
      setDraftFormSnapshotByItemKey({});
      setValidationIssueCountByItemKey({});

      if (result.updatedActionIds.length > 0) {
        setExistingFormVersionById(prev => {
          const next = { ...prev };
          for (const actionId of result.updatedActionIds) {
            next[actionId] = (next[actionId] ?? 0) + 1;
          }
          return next;
        });
      }

      for (const item of orderedActionItems) {
        formRefs.current[item.key]?.deleteMarkedInitialImages();
      }

      await Promise.all([
        queryClient.invalidateQueries({ queryKey: actionQueryKeys.actions({ missionId }) }),
        queryClient.invalidateQueries({
          queryKey: missionCompletionQueryKeys.missionCompletion(missionId),
        }),
        queryClient.invalidateQueries({ queryKey: missionQueryKeys.mission(missionId) }),
      ]);

      const savedCount = result.createdActionIds.length + result.updatedActionIds.length;
      if (!silent && savedCount > 0) {
        toast({ message: "진행 목록 설정이 저장되었습니다." });
      }

      return savedCount > 0 ? { status: "saved", savedCount } : { status: "no_changes" };
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "진행 목록 설정 저장에 실패했습니다.";
      if (!silent) {
        toast({ message, icon: AlertCircle, iconClassName: "text-red-500" });
      }
      return { status: "failed", message };
    } finally {
      setIsApplying(false);
    }
  };

  useImperativeHandle(
    ref,
    () => ({
      save: executeSave,
      hasPendingChanges: () => hasPendingChanges,
      isBusy: () => isBusy || isActionsLoading,
      exportDraftSnapshot: (): ActionSectionDraftSnapshot => getActionDraftSnapshot(),
      importDraftSnapshot: async (snapshot: unknown) => {
        if (!snapshot || typeof snapshot !== "object") {
          return;
        }

        const next = snapshot as Partial<ActionSectionDraftSnapshot>;
        const nextDraftItems = Array.isArray(next.draftItems)
          ? next.draftItems.filter(
              (item): item is DraftActionItem =>
                Boolean(item) &&
                typeof item === "object" &&
                typeof (item as { key?: unknown }).key === "string",
            )
          : [];

        setDraftItems(nextDraftItems);
        setItemOrderKeys(
          Array.isArray(next.itemOrderKeys)
            ? next.itemOrderKeys.filter((key): key is string => typeof key === "string")
            : [],
        );
        setOpenItemKey(typeof next.openItemKey === "string" ? next.openItemKey : null);
        setDirtyByItemKey(
          next.dirtyByItemKey && typeof next.dirtyByItemKey === "object"
            ? (next.dirtyByItemKey as Record<string, boolean>)
            : {},
        );
        setActionTypeByItemKey(
          next.actionTypeByItemKey && typeof next.actionTypeByItemKey === "object"
            ? (next.actionTypeByItemKey as Record<string, ActionType>)
            : {},
        );
        setDraftFormSnapshotByItemKey(
          next.formSnapshotByItemKey && typeof next.formSnapshotByItemKey === "object"
            ? (next.formSnapshotByItemKey as Record<string, ActionFormRawSnapshot>)
            : {},
        );
        setDraftHydrationVersion(prev => prev + 1);
        notifyWorkingSetChange();
      },
    }),
    [
      executeSave,
      getActionDraftSnapshot,
      hasPendingChanges,
      isActionsLoading,
      isBusy,
      notifyWorkingSetChange,
    ],
  );

  return (
    <div className="border border-zinc-200 bg-white">
      <div className="border-b border-zinc-100 px-5 py-4">
        <div className="flex items-start justify-between gap-4">
          <div>
            <Typo.SubTitle>진행 목록 수정</Typo.SubTitle>
            <Typo.Body size="medium" className="mt-1 text-zinc-500">
              참여자가 수행할 질문을 추가하고 수정합니다.
            </Typo.Body>
          </div>
          <div className="flex shrink-0 items-center gap-2">
            {hasValidationIssues ? (
              <div
                className="flex items-center gap-1 text-red-500"
                title="입력 확인 필요"
                aria-label="입력 확인 필요"
              >
                <AlertCircle className="size-4" />
                <Typo.Body size="small" className="font-semibold text-red-500">
                  {validationIssueCount}
                </Typo.Body>
              </div>
            ) : null}
            <Button
              variant="secondary"
              className="h-10 px-4"
              inlineIcon
              leftIcon={<GitBranch className="size-4" />}
              onClick={() => setIsFlowDialogOpen(true)}
              disabled={isFlowLoading}
            >
              플로우
            </Button>
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-4 px-5 py-5">
        {isActionsLoading ? (
          <div className="rounded-xl border border-zinc-200 bg-zinc-50 px-4 py-10 text-center">
            <Typo.Body size="medium" className="text-zinc-500">
              로딩 중...
            </Typo.Body>
          </div>
        ) : orderedActionItems.length === 0 ? (
          <div className="rounded-xl border border-zinc-200 bg-zinc-50 px-4 py-10 text-center">
            <Typo.SubTitle>아직 진행 목록이 없습니다</Typo.SubTitle>
            <Typo.Body size="medium" className="mt-2 text-zinc-500">
              질문 추가 버튼으로 첫 질문을 생성해주세요.
            </Typo.Body>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {orderedActionItems.map((item, index) => {
              const isOpen = openItemKey === item.key;
              const canMoveUp = index > 0;
              const canMoveDown = index < orderedActionItems.length - 1;
              const fallbackType =
                item.kind === "existing" ? item.action.type : ActionType.SUBJECTIVE;
              const itemType = actionTypeByItemKey[item.key] ?? fallbackType;
              const itemTitle =
                item.kind === "existing"
                  ? item.action.title
                  : `${ACTION_TYPE_LABELS[itemType]} 질문`;
              const currentActionId =
                item.kind === "existing" ? item.action.id : makeDraftActionId(item.draft.key);
              const formLinkTargets = linkTargets.filter(target => target.id !== currentActionId);
              const previewImageUrl =
                formRefs.current[item.key]?.getRawSnapshot().values.imageUrl ??
                draftFormSnapshotByItemKey[item.key]?.values.imageUrl ??
                (item.kind === "existing" ? item.action.imageUrl : null);

              return (
                <div key={item.key} className="overflow-hidden rounded-xl border border-zinc-200">
                  <div className="flex items-center justify-between bg-zinc-50 px-4 py-3">
                    <div className="mr-2 flex shrink-0 items-center gap-1">
                      <button
                        type="button"
                        aria-label="위로 이동"
                        onClick={() => handleMoveItem(item.key, -1)}
                        disabled={isBusy || !canMoveUp}
                        className="rounded p-1 text-zinc-500 transition-colors hover:text-zinc-700 disabled:cursor-not-allowed disabled:opacity-40"
                      >
                        <ArrowUp className="size-4" />
                      </button>
                      <button
                        type="button"
                        aria-label="아래로 이동"
                        onClick={() => handleMoveItem(item.key, 1)}
                        disabled={isBusy || !canMoveDown}
                        className="rounded p-1 text-zinc-500 transition-colors hover:text-zinc-700 disabled:cursor-not-allowed disabled:opacity-40"
                      >
                        <ArrowDown className="size-4" />
                      </button>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleToggleItem(item.key)}
                      className="flex min-w-0 flex-1 items-center justify-between gap-3 text-left"
                    >
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <Typo.Body size="medium" className="truncate font-semibold text-zinc-800">
                            {index + 1}. {itemTitle}
                          </Typo.Body>
                          {index === 0 ? (
                            <span className="shrink-0 rounded-full bg-zinc-200 px-2 py-0.5 text-xs font-medium text-zinc-700">
                              시작 질문
                            </span>
                          ) : null}
                        </div>
                        <Typo.Body size="small" className="mt-1 text-zinc-500">
                          {ACTION_TYPE_LABELS[itemType]}
                        </Typo.Body>
                      </div>
                      <div className="flex shrink-0 items-center gap-2">
                        {previewImageUrl ? (
                          <img
                            src={previewImageUrl}
                            alt={`${itemTitle} 미리보기 이미지`}
                            className="size-10 shrink-0 rounded border border-zinc-200 bg-zinc-100 object-cover"
                          />
                        ) : null}
                        <ChevronDown
                          className={`size-4 shrink-0 text-zinc-500 transition-transform ${
                            isOpen ? "rotate-180" : ""
                          }`}
                        />
                      </div>
                    </button>

                    {item.kind === "draft" ? (
                      <button
                        type="button"
                        aria-label="신규 질문 제거"
                        onClick={() => handleRemoveDraft(item.draft.key)}
                        className="ml-2 rounded p-1 text-zinc-400 transition-colors hover:text-red-500"
                      >
                        <X className="size-4" />
                      </button>
                    ) : (
                      <button
                        type="button"
                        aria-label="저장된 질문 삭제"
                        onClick={event => {
                          event.stopPropagation();
                          setDeleteTarget(item.action);
                        }}
                        disabled={isBusy}
                        className="ml-2 rounded p-1 text-red-500 transition-colors hover:text-red-600 disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        <Trash2 className="size-4" />
                      </button>
                    )}
                  </div>

                  <div className={isOpen ? "block border-t border-zinc-200" : "hidden"}>
                    {item.kind === "existing" ? (
                      <ActionForm
                        key={`${item.key}:${existingFormVersionById[item.action.id] ?? 0}:${draftHydrationVersion}`}
                        ref={instance => {
                          formRefs.current[item.key] = instance;
                        }}
                        actionType={itemType}
                        editingAction={item.action}
                        initialValues={
                          draftFormSnapshotByItemKey[item.key]?.values ??
                          mapEditInitialValues(item.action)
                        }
                        dirtyBaselineValues={mapEditInitialValues(item.action)}
                        allActions={formLinkTargets}
                        completionOptions={completionOptions}
                        allowCompletionLink={!isAiCompletionEnabled}
                        isLoading={isBusy}
                        onSubmit={NOOP}
                        onCancel={NOOP}
                        hideTitle
                        hideFooter
                        enableTypeSelect
                        enforceExclusiveNextLink
                        wordingMode="question"
                        onActionTypeChange={type => handleActionTypeChange(item.key, type)}
                        onDirtyChange={isDirty => {
                          handleItemDirtyChange(item.key, isDirty);
                        }}
                        onValidationStateChange={issueCount => {
                          handleItemValidationChange(item.key, issueCount);
                        }}
                        onRawSnapshotChange={snapshot => {
                          handleItemRawSnapshotChange(item.key, snapshot);
                        }}
                      />
                    ) : (
                      <ActionForm
                        key={`${item.key}:${draftHydrationVersion}`}
                        ref={instance => {
                          formRefs.current[item.key] = instance;
                        }}
                        actionType={itemType}
                        initialValues={draftFormSnapshotByItemKey[item.key]?.values}
                        allActions={formLinkTargets}
                        completionOptions={completionOptions}
                        allowCompletionLink={!isAiCompletionEnabled}
                        isLoading={isBusy}
                        onSubmit={NOOP}
                        onCancel={NOOP}
                        hideTitle
                        hideFooter
                        enableTypeSelect
                        enforceExclusiveNextLink
                        wordingMode="question"
                        onActionTypeChange={type => handleActionTypeChange(item.key, type)}
                        onDirtyChange={isDirty => {
                          handleItemDirtyChange(item.key, isDirty);
                        }}
                        onValidationStateChange={issueCount => {
                          handleItemValidationChange(item.key, issueCount);
                        }}
                        onRawSnapshotChange={snapshot => {
                          handleItemRawSnapshotChange(item.key, snapshot);
                        }}
                      />
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        <button
          type="button"
          onClick={handleAddDraft}
          disabled={isBusy || isActionsLoading}
          className="flex items-center justify-center gap-2 rounded-xl border-2 border-dashed border-zinc-200 bg-white py-4 text-zinc-500 transition-colors hover:border-violet-300 hover:text-violet-500 disabled:cursor-not-allowed disabled:opacity-50"
        >
          <Plus className="size-5" />
          <Typo.Body size="medium" className="font-medium">
            질문 추가
          </Typo.Body>
        </button>
      </div>

      <FlowOverviewDialog
        open={isFlowDialogOpen}
        onOpenChange={setIsFlowDialogOpen}
        analysis={flowAnalysis}
        isLoading={isFlowLoading}
        errorMessage={flowErrorMessage}
      />

      <Dialog
        open={Boolean(deleteTarget)}
        onOpenChange={open => {
          if (!open && !deleteAction.isPending) {
            setDeleteTarget(null);
          }
        }}
      >
        <DialogPortal>
          <DialogOverlay />
          {deleteTarget ? (
            <DialogContent
              onInteractOutside={event => {
                if (deleteAction.isPending) {
                  event.preventDefault();
                }
              }}
              onEscapeKeyDown={event => {
                if (deleteAction.isPending) {
                  event.preventDefault();
                }
              }}
            >
              <DialogTitle asChild>
                <Typo.SubTitle className="mb-2">질문 삭제</Typo.SubTitle>
              </DialogTitle>
              <DialogDescription asChild>
                <Typo.Body size="medium" className="mb-6 text-zinc-500">
                  "{deleteTarget.title}" 질문을 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.
                </Typo.Body>
              </DialogDescription>
              <div className="flex gap-3">
                <Button
                  variant="secondary"
                  fullWidth
                  onClick={() => setDeleteTarget(null)}
                  disabled={deleteAction.isPending}
                >
                  취소
                </Button>
                <Button
                  fullWidth
                  onClick={handleDeleteConfirm}
                  loading={deleteAction.isPending}
                  disabled={deleteAction.isPending}
                  className="bg-red-500 hover:bg-red-600"
                >
                  삭제
                </Button>
              </div>
            </DialogContent>
          ) : null}
        </DialogPortal>
      </Dialog>
    </div>
  );
}

export const ActionSettingsCard = forwardRef<SectionSaveHandle, ActionSettingsCardProps>(
  ActionSettingsCardComponent,
);
ActionSettingsCard.displayName = "ActionSettingsCard";
