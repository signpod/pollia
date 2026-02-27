"use client";

import { createMissionCompletion, getCompletionsByMissionId } from "@/actions/mission-completion";
import { updateMission } from "@/actions/mission/update";
import {
  ActionForm,
  type ActionFormHandle,
  type ActionFormValues,
} from "@/app/(site)/mission/[missionId]/manage/actions/components/ActionForm";
import {
  useManageCreateAction,
  useManageDeleteAction,
  useManageUpdateAction,
} from "@/app/(site)/mission/[missionId]/manage/actions/hooks";
import {
  hasDraftActionReference,
  makeDraftActionId,
  mapCreateActionInput,
  mapEditInitialValues,
  mapUpdateActionInput,
  resolveDraftActionReferences,
} from "@/app/(site)/mission/[missionId]/manage/actions/logic";
import { ACTION_TYPE_LABELS } from "@/constants/action";
import { actionQueryKeys } from "@/constants/queryKeys/actionQueryKeys";
import { missionCompletionQueryKeys } from "@/constants/queryKeys/missionCompletionQueryKeys";
import { useReadActionsDetail } from "@/hooks/action";
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
import { AlertCircle, ChevronDown, Plus, Trash2, X } from "lucide-react";
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
import { isDraftCompletionId, useEditorMissionDraft } from "./EditorMissionDraftContext";
import type {
  SectionSaveHandle,
  SectionSaveResult,
  SectionSaveStateChangeHandler,
} from "./editor-save.types";

interface ActionSettingsCardProps {
  missionId: string;
  onSaveStateChange?: SectionSaveStateChangeHandler;
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

type ActionSubmission = {
  actionType: ActionType;
  values: ActionFormValues;
};

const ACTION_TYPES_WITH_OPTIONS = new Set<ActionType>([
  ActionType.MULTIPLE_CHOICE,
  ActionType.SCALE,
  ActionType.TAG,
  ActionType.BRANCH,
]);
const ACTION_TYPES_WITH_OPTION_DESCRIPTION = new Set<ActionType>([
  ActionType.MULTIPLE_CHOICE,
  ActionType.SCALE,
  ActionType.BRANCH,
]);
const ACTION_TYPES_WITH_OPTION_IMAGE = new Set<ActionType>([
  ActionType.MULTIPLE_CHOICE,
  ActionType.BRANCH,
]);

const ACTION_TYPES_WITH_MAX_SELECTIONS = new Set<ActionType>([
  ActionType.MULTIPLE_CHOICE,
  ActionType.TAG,
  ActionType.IMAGE,
  ActionType.DATE,
  ActionType.TIME,
]);

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

function normalizeActionValues(type: ActionType, values: ActionFormValues) {
  const normalized: Record<string, unknown> = {
    title: values.title.trim(),
    description: values.description?.trim() || null,
    imageUrl: values.imageUrl ?? null,
    imageFileUploadId: values.imageFileUploadId ?? null,
    isRequired: values.isRequired,
  };

  if (ACTION_TYPES_WITH_MAX_SELECTIONS.has(type)) {
    normalized.maxSelections = values.maxSelections ?? 1;
  }

  if (type === ActionType.MULTIPLE_CHOICE || type === ActionType.TAG) {
    normalized.hasOther = Boolean(values.hasOther);
  }

  if (ACTION_TYPES_WITH_OPTIONS.has(type)) {
    const showOptionDescription = ACTION_TYPES_WITH_OPTION_DESCRIPTION.has(type);
    const showOptionImage = ACTION_TYPES_WITH_OPTION_IMAGE.has(type);

    normalized.options = (values.options ?? []).map((option, index) => ({
      title: option.title.trim(),
      description: showOptionDescription ? option.description?.trim() || null : null,
      imageUrl: showOptionImage ? (option.imageUrl ?? null) : null,
      fileUploadId: showOptionImage ? (option.fileUploadId ?? null) : null,
      nextActionId: option.nextActionId ?? null,
      nextCompletionId: option.nextCompletionId ?? null,
      order: index,
    }));
  }

  if (type !== ActionType.BRANCH) {
    normalized.nextActionId = values.nextActionId ?? null;
    normalized.nextCompletionId = values.nextCompletionId ?? null;
  }

  return normalized;
}

function isActionChanged(action: ActionDetail, submission: ActionSubmission) {
  if (submission.actionType !== action.type) {
    return true;
  }

  const initialValues = mapEditInitialValues(action);
  const current = normalizeActionValues(submission.actionType, submission.values);
  const initial = normalizeActionValues(action.type, initialValues);

  return JSON.stringify(current) !== JSON.stringify(initial);
}

function collectDraftCompletionReferences(values: ActionFormValues): string[] {
  const draftIds = new Set<string>();

  if (isDraftCompletionId(values.nextCompletionId)) {
    draftIds.add(values.nextCompletionId);
  }

  for (const option of values.options ?? []) {
    if (isDraftCompletionId(option.nextCompletionId)) {
      draftIds.add(option.nextCompletionId);
    }
  }

  return [...draftIds];
}

function resolveDraftCompletionReferences(
  values: ActionFormValues,
  completionIdMap: Map<string, string>,
  allowUnresolved = false,
): ActionFormValues {
  const resolveCompletionId = (completionId: string | null | undefined): string | null => {
    if (!completionId) {
      return null;
    }
    if (!isDraftCompletionId(completionId)) {
      return completionId;
    }

    const mapped = completionIdMap.get(completionId);
    if (mapped) {
      return mapped;
    }

    return allowUnresolved ? null : completionId;
  };

  return {
    ...values,
    nextCompletionId: resolveCompletionId(values.nextCompletionId),
    options: values.options?.map(option => ({
      ...option,
      nextCompletionId: resolveCompletionId(option.nextCompletionId),
    })),
  };
}

const NOOP = () => {};

function ActionSettingsCardComponent(
  { missionId, onSaveStateChange }: ActionSettingsCardProps,
  ref: ForwardedRef<SectionSaveHandle>,
) {
  const queryClient = useQueryClient();
  const formRefs = useRef<Record<string, ActionFormHandle | null>>({});
  const [draftItems, setDraftItems] = useState<DraftActionItem[]>([]);
  const [openItemKey, setOpenItemKey] = useState<string | null>(null);
  const [isUpdatingEntryAction, setIsUpdatingEntryAction] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<ActionDetail | null>(null);
  const [dirtyByItemKey, setDirtyByItemKey] = useState<Record<string, boolean>>({});
  const [existingFormVersionById, setExistingFormVersionById] = useState<Record<string, number>>(
    {},
  );
  const [actionTypeByItemKey, setActionTypeByItemKey] = useState<Record<string, ActionType>>({});
  const {
    completionDrafts,
    getCompletionDraftFormById,
    openCompletionDraftById,
    removeCompletionDraftById,
  } = useEditorMissionDraft();

  const { data: actionsData, isLoading: isActionsLoading } = useReadActionsDetail(missionId);
  const { data: completionsData } = useQuery({
    queryKey: missionCompletionQueryKeys.missionCompletion(missionId),
    queryFn: () => getCompletionsByMissionId(missionId),
    staleTime: 5 * 60 * 1000,
  });

  const createAction = useManageCreateAction();
  const updateAction = useManageUpdateAction();
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
        setOpenItemKey(prev => (prev === deletingItemKey ? null : prev));
      }

      toast({ message: "액션이 삭제되었습니다." });
      setDeleteTarget(null);
    },
    onError: error => {
      toast({
        message: error.message || "액션 삭제에 실패했습니다.",
        icon: AlertCircle,
        iconClassName: "text-red-500",
      });
    },
  });

  const isSaving = createAction.isPending || updateAction.isPending || isUpdatingEntryAction;
  const isDeletingAction = deleteAction.isPending;
  const isBusy = isSaving || isDeletingAction;

  const existingActions = useMemo(() => {
    const list = actionsData?.data ?? [];
    return [...list].sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
  }, [actionsData]);

  const completionOptions = useMemo(
    () => [
      ...(completionsData?.data ?? []).map(completion => ({
        id: completion.id,
        title: completion.title ?? "완료 화면",
      })),
      ...completionDrafts.map(draft => ({
        id: draft.id,
        title: `[임시 완료] ${draft.title}`,
      })),
    ],
    [completionsData, completionDrafts],
  );

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

  const linkTargets = useMemo(() => {
    const existingTargets = existingActions.map(action => ({
      id: action.id,
      title: action.title,
      order: action.order ?? 0,
    }));

    const draftTargets = draftItems.map((draft, index) => {
      const itemKey = getDraftItemKey(draft.key);
      const draftType = actionTypeByItemKey[itemKey] ?? ActionType.SUBJECTIVE;

      return {
        id: makeDraftActionId(draft.key),
        title: `[임시] ${ACTION_TYPE_LABELS[draftType]} 액션`,
        order: existingActions.length + index,
      };
    });

    return [...existingTargets, ...draftTargets];
  }, [existingActions, draftItems, actionTypeByItemKey]);

  useEffect(() => {
    const validKeys = new Set(actionItems.map(item => item.key));
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
  }, [actionItems]);

  const hasPendingChanges = useMemo(() => {
    if (draftItems.length > 0) {
      return true;
    }

    return existingActions.some(action => dirtyByItemKey[getExistingItemKey(action.id)]);
  }, [draftItems.length, existingActions, dirtyByItemKey]);

  useEffect(() => {
    onSaveStateChange?.({
      hasPendingChanges,
      isBusy: isBusy || isActionsLoading,
    });
  }, [hasPendingChanges, isBusy, isActionsLoading, onSaveStateChange]);

  const handleItemDirtyChange = useCallback((itemKey: string, isDirty: boolean) => {
    setDirtyByItemKey(prev => {
      if (prev[itemKey] === isDirty) {
        return prev;
      }

      return { ...prev, [itemKey]: isDirty };
    });
  }, []);

  const handleAddDraft = () => {
    const draftKey = createDraftKey();
    const itemKey = getDraftItemKey(draftKey);

    setDraftItems(prev => [...prev, { key: draftKey }]);
    setActionTypeByItemKey(prev => ({ ...prev, [itemKey]: ActionType.SUBJECTIVE }));
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
    delete formRefs.current[itemKey];
    setOpenItemKey(prev => (prev === itemKey ? null : prev));
  };

  const handleToggleItem = (itemKey: string) => {
    setOpenItemKey(prev => (prev === itemKey ? null : itemKey));
  };

  const handleActionTypeChange = (itemKey: string, actionType: ActionType) => {
    setActionTypeByItemKey(prev => ({ ...prev, [itemKey]: actionType }));
  };

  const handleDeleteConfirm = () => {
    if (!deleteTarget) return;
    deleteAction.mutate({ actionId: deleteTarget.id, missionId });
  };

  const executeSave = async ({
    silent = false,
  }: { silent?: boolean } = {}): Promise<SectionSaveResult> => {
    if (isActionsLoading || isBusy) {
      return { status: "failed", message: "액션 저장이 진행 중입니다." };
    }

    const existingSnapshot = [...existingActions];
    const draftSnapshot = [...draftItems];
    const listSnapshot: ActionListItem[] = [
      ...existingSnapshot.map(action => ({
        key: getExistingItemKey(action.id),
        kind: "existing" as const,
        action,
      })),
      ...draftSnapshot.map(draft => ({
        key: getDraftItemKey(draft.key),
        kind: "draft" as const,
        draft,
      })),
    ];

    if (listSnapshot.length === 0) {
      return { status: "no_changes" };
    }

    const submissionsByKey = new Map<string, ActionSubmission>();

    for (const item of listSnapshot) {
      const formRef = formRefs.current[item.key];
      if (!formRef) {
        setOpenItemKey(item.key);
        return {
          status: "failed",
          message: "액션 폼이 준비되지 않았습니다. 다시 시도해주세요.",
        };
      }

      if (formRef.isUploading()) {
        setOpenItemKey(item.key);
        return {
          status: "failed",
          message: "이미지 업로드가 완료된 뒤 저장해주세요.",
        };
      }

      const submission = formRef.validateAndGetSubmission();
      if (!submission) {
        setOpenItemKey(item.key);
        return {
          status: "failed",
          message: "액션 입력값을 확인해주세요.",
        };
      }

      submissionsByKey.set(item.key, submission);
    }

    const changedExistingActions = existingSnapshot.filter(action => {
      const key = getExistingItemKey(action.id);
      const submission = submissionsByKey.get(key);
      if (!submission) return false;

      return isActionChanged(action, submission);
    });

    if (changedExistingActions.length === 0 && draftSnapshot.length === 0) {
      return { status: "no_changes" };
    }

    const actionSubmissionsToPersist = [
      ...changedExistingActions
        .map(action => submissionsByKey.get(getExistingItemKey(action.id)))
        .filter((submission): submission is ActionSubmission => Boolean(submission)),
      ...draftSnapshot
        .map(draft => submissionsByKey.get(getDraftItemKey(draft.key)))
        .filter((submission): submission is ActionSubmission => Boolean(submission)),
    ];
    const persistedItemKeys = [
      ...changedExistingActions.map(action => getExistingItemKey(action.id)),
      ...draftSnapshot.map(draft => getDraftItemKey(draft.key)),
    ];

    const referencedDraftCompletionIds = [
      ...new Set(
        actionSubmissionsToPersist.flatMap(submission =>
          collectDraftCompletionReferences(submission.values),
        ),
      ),
    ];

    const createdCompletionDraftIds: string[] = [];

    try {
      let firstCreatedActionId: string | null = null;
      const tempToRealActionIdMap = new Map<string, string>();
      const tempToRealCompletionIdMap = new Map<string, string>();
      const createdDraftRecords: Array<{
        createdId: string;
        submission: ActionSubmission;
        hasDraftReference: boolean;
      }> = [];

      for (const draftCompletionId of referencedDraftCompletionIds) {
        const completionForm = getCompletionDraftFormById(draftCompletionId);
        if (!completionForm) {
          openCompletionDraftById(draftCompletionId);
          return {
            status: "failed",
            message: "참조된 결과 화면 폼을 찾을 수 없습니다.",
          };
        }

        if (completionForm.isUploading()) {
          openCompletionDraftById(draftCompletionId);
          return {
            status: "failed",
            message: "결과 화면 이미지 업로드가 완료된 뒤 저장해주세요.",
          };
        }

        const completionValues = completionForm.validateAndGetValues();
        if (!completionValues) {
          openCompletionDraftById(draftCompletionId);
          return {
            status: "failed",
            message: "연결된 결과 화면 입력값을 확인해주세요.",
          };
        }

        const createdCompletion = await createMissionCompletion({
          missionId,
          title: completionValues.title,
          description: completionValues.description,
          imageUrl: completionValues.imageUrl ?? undefined,
          imageFileUploadId: completionValues.imageFileUploadId ?? undefined,
        });

        const createdCompletionId = createdCompletion?.data?.id;
        if (!createdCompletionId) {
          throw new Error("결과 화면 생성 결과를 확인할 수 없습니다.");
        }

        tempToRealCompletionIdMap.set(draftCompletionId, createdCompletionId);
        createdCompletionDraftIds.push(draftCompletionId);
        completionForm.deleteMarkedInitial();
      }

      for (const [index, draft] of draftSnapshot.entries()) {
        const key = getDraftItemKey(draft.key);
        const submission = submissionsByKey.get(key);
        if (!submission) continue;

        const hasDraftReference = hasDraftActionReference(submission.values);
        const completionResolvedValues = resolveDraftCompletionReferences(
          submission.values,
          tempToRealCompletionIdMap,
          true,
        );
        const sanitizedValues = resolveDraftActionReferences(
          completionResolvedValues,
          tempToRealActionIdMap,
          true,
        );

        const created = await createAction.mutateAsync(
          mapCreateActionInput({
            missionId,
            selectedType: submission.actionType,
            values: sanitizedValues,
            order: existingSnapshot.length + index,
          }),
        );

        const createdId = created?.data?.id;
        if (!createdId) {
          throw new Error("액션 생성 결과를 확인할 수 없습니다.");
        }

        tempToRealActionIdMap.set(makeDraftActionId(draft.key), createdId);
        createdDraftRecords.push({
          createdId,
          submission,
          hasDraftReference,
        });

        if (!firstCreatedActionId) {
          firstCreatedActionId = createdId;
        }
      }

      for (const action of changedExistingActions) {
        const key = getExistingItemKey(action.id);
        const submission = submissionsByKey.get(key);
        if (!submission) continue;

        const completionResolvedValues = resolveDraftCompletionReferences(
          submission.values,
          tempToRealCompletionIdMap,
          true,
        );
        const resolvedValues = resolveDraftActionReferences(
          completionResolvedValues,
          tempToRealActionIdMap,
          true,
        );

        await updateAction.mutateAsync(
          mapUpdateActionInput({
            missionId,
            editingActionId: action.id,
            values: resolvedValues,
            actionType: submission.actionType,
            previousActionType: action.type,
          }),
        );
      }

      for (const createdDraft of createdDraftRecords) {
        if (!createdDraft.hasDraftReference) {
          continue;
        }

        const completionResolvedValues = resolveDraftCompletionReferences(
          createdDraft.submission.values,
          tempToRealCompletionIdMap,
          true,
        );
        const resolvedValues = resolveDraftActionReferences(
          completionResolvedValues,
          tempToRealActionIdMap,
          true,
        );

        await updateAction.mutateAsync(
          mapUpdateActionInput({
            missionId,
            editingActionId: createdDraft.createdId,
            values: resolvedValues,
            actionType: createdDraft.submission.actionType,
            previousActionType: createdDraft.submission.actionType,
          }),
        );
      }

      for (const itemKey of persistedItemKeys) {
        formRefs.current[itemKey]?.deleteMarkedInitialImages();
      }

      if (existingSnapshot.length === 0 && firstCreatedActionId) {
        setIsUpdatingEntryAction(true);
        try {
          await updateMission(missionId, { entryActionId: firstCreatedActionId });
        } catch {
          if (!silent) {
            toast({
              message: "시작 액션 설정 중 오류가 발생했습니다.",
              icon: AlertCircle,
              iconClassName: "text-red-500",
            });
          }
        } finally {
          setIsUpdatingEntryAction(false);
        }
      }

      setExistingFormVersionById(prev => {
        const next = { ...prev };
        for (const action of changedExistingActions) {
          next[action.id] = (next[action.id] ?? 0) + 1;
        }
        return next;
      });
      setDraftItems([]);
      setActionTypeByItemKey(prev => {
        const next = { ...prev };
        for (const draft of draftSnapshot) {
          delete next[getDraftItemKey(draft.key)];
        }
        return next;
      });
      setDirtyByItemKey(prev => {
        const next = { ...prev };
        for (const action of changedExistingActions) {
          delete next[getExistingItemKey(action.id)];
        }
        for (const draft of draftSnapshot) {
          delete next[getDraftItemKey(draft.key)];
        }
        return next;
      });

      for (const draftCompletionId of createdCompletionDraftIds) {
        removeCompletionDraftById(draftCompletionId);
      }

      await Promise.all([
        queryClient.invalidateQueries({
          queryKey: missionCompletionQueryKeys.missionCompletion(missionId),
        }),
        queryClient.invalidateQueries({
          queryKey: actionQueryKeys.actions({ missionId }),
        }),
      ]);

      if (!silent) {
        toast({ message: "액션 설정이 저장되었습니다." });
      }
      return { status: "saved" };
    } catch (error) {
      if (createdCompletionDraftIds.length > 0) {
        for (const draftCompletionId of createdCompletionDraftIds) {
          removeCompletionDraftById(draftCompletionId);
        }
        await queryClient.invalidateQueries({
          queryKey: missionCompletionQueryKeys.missionCompletion(missionId),
        });
      }

      const message = error instanceof Error ? error.message : "액션 설정 저장에 실패했습니다.";
      if (!silent) {
        toast({
          message,
          icon: AlertCircle,
          iconClassName: "text-red-500",
        });
      }
      return { status: "failed", message };
    } finally {
      setIsUpdatingEntryAction(false);
    }

    return { status: "failed", message: "액션 설정 저장에 실패했습니다." };
  };

  useImperativeHandle(
    ref,
    () => ({
      save: executeSave,
      hasPendingChanges: () => hasPendingChanges,
      isBusy: () => isBusy || isActionsLoading,
    }),
    [executeSave, hasPendingChanges, isActionsLoading, isBusy],
  );

  return (
    <div className="border border-zinc-200 bg-white">
      <div className="border-b border-zinc-100 px-5 py-4">
        <Typo.SubTitle>액션 수정</Typo.SubTitle>
        <Typo.Body size="medium" className="mt-1 text-zinc-500">
          참여자가 수행할 액션을 추가하고 수정합니다.
        </Typo.Body>
      </div>

      <div className="flex flex-col gap-4 px-5 py-5">
        {isActionsLoading ? (
          <div className="rounded-xl border border-zinc-200 bg-zinc-50 px-4 py-10 text-center">
            <Typo.Body size="medium" className="text-zinc-500">
              로딩 중...
            </Typo.Body>
          </div>
        ) : actionItems.length === 0 ? (
          <div className="rounded-xl border border-zinc-200 bg-zinc-50 px-4 py-10 text-center">
            <Typo.SubTitle>아직 액션이 없습니다</Typo.SubTitle>
            <Typo.Body size="medium" className="mt-2 text-zinc-500">
              액션 추가 버튼으로 첫 액션을 생성해주세요.
            </Typo.Body>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {actionItems.map((item, index) => {
              const isOpen = openItemKey === item.key;
              const fallbackType =
                item.kind === "existing" ? item.action.type : ActionType.SUBJECTIVE;
              const itemType = actionTypeByItemKey[item.key] ?? fallbackType;
              const itemTitle =
                item.kind === "existing"
                  ? item.action.title
                  : `${ACTION_TYPE_LABELS[itemType]} 액션`;
              const currentActionId =
                item.kind === "existing" ? item.action.id : makeDraftActionId(item.draft.key);
              const formLinkTargets = linkTargets.filter(target => target.id !== currentActionId);

              return (
                <div key={item.key} className="overflow-hidden rounded-xl border border-zinc-200">
                  <div className="flex items-center justify-between bg-zinc-50 px-4 py-3">
                    <button
                      type="button"
                      onClick={() => handleToggleItem(item.key)}
                      className="flex min-w-0 flex-1 items-center justify-between gap-3 text-left"
                    >
                      <div className="min-w-0">
                        <Typo.Body size="medium" className="truncate font-semibold text-zinc-800">
                          {index + 1}. {itemTitle}
                        </Typo.Body>
                        <Typo.Body size="small" className="mt-1 text-zinc-500">
                          {ACTION_TYPE_LABELS[itemType]}
                        </Typo.Body>
                      </div>
                      <ChevronDown
                        className={`size-4 shrink-0 text-zinc-500 transition-transform ${
                          isOpen ? "rotate-180" : ""
                        }`}
                      />
                    </button>

                    {item.kind === "draft" ? (
                      <button
                        type="button"
                        aria-label="신규 액션 제거"
                        onClick={() => handleRemoveDraft(item.draft.key)}
                        className="ml-2 rounded p-1 text-zinc-400 transition-colors hover:text-red-500"
                      >
                        <X className="size-4" />
                      </button>
                    ) : (
                      <button
                        type="button"
                        aria-label="저장된 액션 삭제"
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
                        key={`${item.key}:${existingFormVersionById[item.action.id] ?? 0}`}
                        ref={instance => {
                          formRefs.current[item.key] = instance;
                        }}
                        actionType={itemType}
                        editingAction={item.action}
                        initialValues={mapEditInitialValues(item.action)}
                        allActions={formLinkTargets}
                        completionOptions={completionOptions}
                        isLoading={isBusy}
                        onSubmit={NOOP}
                        onCancel={NOOP}
                        hideTitle
                        hideFooter
                        enableTypeSelect
                        enforceExclusiveNextLink
                        onActionTypeChange={type => handleActionTypeChange(item.key, type)}
                        onDirtyChange={isDirty => {
                          handleItemDirtyChange(item.key, isDirty);
                        }}
                      />
                    ) : (
                      <ActionForm
                        ref={instance => {
                          formRefs.current[item.key] = instance;
                        }}
                        actionType={itemType}
                        allActions={formLinkTargets}
                        completionOptions={completionOptions}
                        isLoading={isBusy}
                        onSubmit={NOOP}
                        onCancel={NOOP}
                        hideTitle
                        hideFooter
                        enableTypeSelect
                        enforceExclusiveNextLink
                        onActionTypeChange={type => handleActionTypeChange(item.key, type)}
                        onDirtyChange={isDirty => {
                          handleItemDirtyChange(item.key, isDirty);
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
            액션 추가
          </Typo.Body>
        </button>
      </div>

      <Dialog
        open={Boolean(deleteTarget)}
        onOpenChange={open => {
          if (!open && !isDeletingAction) {
            setDeleteTarget(null);
          }
        }}
      >
        <DialogPortal>
          <DialogOverlay />
          {deleteTarget ? (
            <DialogContent
              onInteractOutside={event => {
                if (isDeletingAction) {
                  event.preventDefault();
                }
              }}
              onEscapeKeyDown={event => {
                if (isDeletingAction) {
                  event.preventDefault();
                }
              }}
            >
              <DialogTitle asChild>
                <Typo.SubTitle className="mb-2">액션 삭제</Typo.SubTitle>
              </DialogTitle>
              <DialogDescription asChild>
                <Typo.Body size="medium" className="mb-6 text-zinc-500">
                  "{deleteTarget.title}" 액션을 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.
                </Typo.Body>
              </DialogDescription>
              <div className="flex gap-3">
                <Button
                  variant="secondary"
                  fullWidth
                  onClick={() => setDeleteTarget(null)}
                  disabled={isDeletingAction}
                >
                  취소
                </Button>
                <Button
                  fullWidth
                  onClick={handleDeleteConfirm}
                  loading={isDeletingAction}
                  disabled={isDeletingAction}
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
