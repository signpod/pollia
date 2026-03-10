import {
  createMissionCompletion,
  deleteMissionCompletion,
  getCompletionsByMissionId,
  updateMissionCompletion,
} from "@/actions/mission-completion";

import { actionQueryKeys } from "@/constants/queryKeys/actionQueryKeys";
import { missionCompletionQueryKeys } from "@/constants/queryKeys/missionCompletionQueryKeys";
import type { GetMissionCompletionsResponse, MissionCompletionWithMission } from "@/types/dto";
import { toast } from "@repo/ui/components";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useAtom, useAtomValue, useSetAtom } from "jotai";
import { AlertCircle } from "lucide-react";
import { useCallback, useEffect, useMemo, useRef } from "react";
import { cleanupDeletedCompletionRefsAtom } from "../atoms/editorActionAtoms";
import {
  addCompletionDraftAtom,
  clearCompletionDraftsAtom,
  completionDirtyByItemKeyAtom,
  completionDraftHydrationVersionAtom,
  completionDraftsAtom,
  completionFormSnapshotByItemKeyAtom,
  completionFormVersionByIdAtom,
  completionIsSavingAtom,
  completionOpenItemKeyAtom,
  completionValidationIssueCountByItemKeyAtom,
  markCompletionRemovedAtom,
  removeCompletionDraftAtom,
  removedCompletionIdsAtom,
  resetCompletionAfterSaveAtom,
  setCompletionDraftTitleAtom,
} from "../atoms/editorCompletionAtoms";
import { mobilePreviewModeAtom } from "../atoms/editorMobilePreviewAtom";
import type {
  CompletionFormHandle,
  CompletionFormRawSnapshot,
  CompletionFormValues,
} from "./CompletionForm";
import {
  getCompletionDraftItemKey,
  makeDraftCompletionId,
  useEditorMissionDraft,
} from "./EditorMissionDraftContext";
import type {
  CompletionListItem,
  CompletionSectionDraftSnapshot,
  CompletionSettingsCardProps,
} from "./completionSettingsCard.types";
import {
  areCompletionSnapshotsEqual,
  buildPatchedCompletionForCache,
  createDraftKey,
  getExistingItemKey,
  isCompletionChanged,
  isMissingCompletionError,
  patchCompletionsQueryData,
} from "./completionSettingsCard.utils";
import type { SectionSaveHandle, SectionSaveOptions, SectionSaveResult } from "./editor-save.types";
import { toggleItemWithPreview } from "./editorMobilePreview.utils";

function getDraftItemKey(draftKey: string) {
  return getCompletionDraftItemKey(draftKey);
}

export interface UseCompletionSettingsCardReturn {
  viewState: {
    isSaving: boolean;
    isLoading: boolean;
    hasPendingChanges: boolean;
    hasValidationIssues: boolean;
    validationIssueCount: number;
  };
  listState: {
    completionItems: CompletionListItem[];
    openItemKey: string | null;
    draftFormSnapshotByItemKey: Record<string, CompletionFormRawSnapshot>;
    existingFormVersionById: Record<string, number>;
    draftHydrationVersion: number;
  };
  formRefs: React.MutableRefObject<Record<string, CompletionFormHandle | null>>;
  handlers: {
    handleAddDraft: () => void;
    handleRemoveDraft: (draftKey: string) => void;
    handleRemoveExisting: (completionId: string) => void;
    handleToggleItem: (itemKey: string) => void;
    handleItemDirtyChange: (itemKey: string, isDirty: boolean) => void;
    handleItemValidationChange: (itemKey: string, issueCount: number) => void;
    handleItemRawSnapshotChange: (itemKey: string, snapshot: CompletionFormRawSnapshot) => void;
    setCompletionDraftTitle: (draftKey: string, title: string) => void;
    registerCompletionDraftForm: (draftKey: string, instance: CompletionFormHandle | null) => void;
  };
  saveHandle: SectionSaveHandle;
}

export function useCompletionSettingsCard({
  missionId,
  onSaveStateChange,
}: Omit<CompletionSettingsCardProps, "onWorkingSetChange">): UseCompletionSettingsCardReturn {
  const queryClient = useQueryClient();
  const formRefs = useRef<Record<string, CompletionFormHandle | null>>({});

  const completionDrafts = useAtomValue(completionDraftsAtom);
  const [removedExistingIds, setRemovedExistingIds] = useAtom(removedCompletionIdsAtom);
  const [openItemKey, setOpenItemKey] = useAtom(completionOpenItemKeyAtom);
  const [isSaving, setIsSaving] = useAtom(completionIsSavingAtom);
  const [dirtyByItemKey, setDirtyByItemKey] = useAtom(completionDirtyByItemKeyAtom);
  const [existingFormVersionById] = useAtom(completionFormVersionByIdAtom);
  const [draftFormSnapshotByItemKey, setDraftFormSnapshotByItemKey] = useAtom(
    completionFormSnapshotByItemKeyAtom,
  );
  const [validationIssueCountByItemKey, setValidationIssueCountByItemKey] = useAtom(
    completionValidationIssueCountByItemKeyAtom,
  );
  const [draftHydrationVersion, setDraftHydrationVersion] = useAtom(
    completionDraftHydrationVersionAtom,
  );
  const dispatchAddDraft = useSetAtom(addCompletionDraftAtom);
  const dispatchRemoveDraft = useSetAtom(removeCompletionDraftAtom);
  const setMobilePreviewMode = useSetAtom(mobilePreviewModeAtom);
  const dispatchSetTitle = useSetAtom(setCompletionDraftTitleAtom);
  const dispatchClear = useSetAtom(clearCompletionDraftsAtom);
  const dispatchMarkRemoved = useSetAtom(markCompletionRemovedAtom);
  const dispatchResetAfterSave = useSetAtom(resetCompletionAfterSaveAtom);
  const dispatchCleanupDeletedCompletionRefs = useSetAtom(cleanupDeletedCompletionRefsAtom);
  const { registerCompletionDraftForm } = useEditorMissionDraft();

  const { data, isLoading } = useQuery({
    queryKey: missionCompletionQueryKeys.missionCompletion(missionId),
    queryFn: () => getCompletionsByMissionId(missionId),
    staleTime: 5 * 60 * 1000,
  });

  const existingCompletions = useMemo(() => {
    const list = data?.data ?? [];
    return [...list].sort(
      (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
    );
  }, [data]);

  const visibleExistingCompletions = useMemo(
    () => existingCompletions.filter(item => !removedExistingIds.has(item.id)),
    [existingCompletions, removedExistingIds],
  );

  const completionItems = useMemo<CompletionListItem[]>(
    () => [
      ...visibleExistingCompletions.map(completion => ({
        key: getExistingItemKey(completion.id),
        kind: "existing" as const,
        completion,
      })),
      ...completionDrafts.map(draft => ({
        key: getDraftItemKey(draft.key),
        kind: "draft" as const,
        draft: {
          key: draft.key,
          title: draft.title,
        },
      })),
    ],
    [visibleExistingCompletions, completionDrafts],
  );

  const getCompletionDraftSnapshot = useCallback((): CompletionSectionDraftSnapshot => {
    const snapshotByKey: Record<string, CompletionFormRawSnapshot> = {};

    for (const item of completionItems) {
      const snapshot = formRefs.current[item.key]?.getRawSnapshot();
      if (snapshot) {
        snapshotByKey[item.key] = snapshot;
      }
    }

    return {
      draftItems: completionDrafts.map(item => ({ key: item.key, title: item.title })),
      openItemKey,
      removedExistingIds: [...removedExistingIds],
      dirtyByItemKey,
      formSnapshotByItemKey: snapshotByKey,
    };
  }, [completionDrafts, completionItems, dirtyByItemKey, openItemKey, removedExistingIds]);

  useEffect(() => {
    const validKeys = new Set(completionItems.map(item => item.key));
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
      const next: Record<string, CompletionFormRawSnapshot> = {};
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
  }, [
    completionItems,
    setDirtyByItemKey,
    setDraftFormSnapshotByItemKey,
    setValidationIssueCountByItemKey,
  ]);

  const hasPendingChanges = useMemo(() => {
    if (completionDrafts.length > 0 || removedExistingIds.size > 0) {
      return true;
    }

    return visibleExistingCompletions.some(
      completion => dirtyByItemKey[getExistingItemKey(completion.id)],
    );
  }, [completionDrafts.length, removedExistingIds, visibleExistingCompletions, dirtyByItemKey]);

  const validationIssueCount = useMemo(
    () =>
      completionItems.reduce(
        (sum, item) => sum + (validationIssueCountByItemKey[item.key] ?? 0),
        0,
      ),
    [completionItems, validationIssueCountByItemKey],
  );
  const hasValidationIssues = validationIssueCount > 0;

  useEffect(() => {
    onSaveStateChange?.({
      hasPendingChanges,
      isBusy: isSaving || isLoading,
      hasValidationIssues,
      validationIssueCount,
    });
  }, [
    hasPendingChanges,
    hasValidationIssues,
    isLoading,
    isSaving,
    onSaveStateChange,
    validationIssueCount,
  ]);

  const handleItemDirtyChange = useCallback(
    (itemKey: string, isDirty: boolean) => {
      setDirtyByItemKey(prev => {
        if (prev[itemKey] === isDirty) {
          return prev;
        }

        return { ...prev, [itemKey]: isDirty };
      });
    },
    [setDirtyByItemKey],
  );

  const handleItemValidationChange = useCallback(
    (itemKey: string, issueCount: number) => {
      setValidationIssueCountByItemKey(prev => {
        if ((prev[itemKey] ?? 0) === issueCount) {
          return prev;
        }

        return { ...prev, [itemKey]: issueCount };
      });
    },
    [setValidationIssueCountByItemKey],
  );

  const handleItemRawSnapshotChange = useCallback(
    (itemKey: string, snapshot: CompletionFormRawSnapshot) => {
      setDraftFormSnapshotByItemKey(prev => {
        if (areCompletionSnapshotsEqual(prev[itemKey], snapshot)) {
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
    if (isSaving) {
      return;
    }

    const draftKey = createDraftKey();
    dispatchAddDraft({ draftKey });
    setOpenItemKey(getDraftItemKey(draftKey));
  };

  const handleToggleItem = useCallback(
    (itemKey: string) => {
      toggleItemWithPreview(
        itemKey,
        completionItems,
        setOpenItemKey,
        setMobilePreviewMode,
        item => ({ type: "completion", completionId: item.completion.id }),
        openItemKey,
      );
    },
    [completionItems, setMobilePreviewMode, setOpenItemKey, openItemKey],
  );

  const clearCompletionRefsInActionSnapshots = useCallback(
    (deletedCompletionId: string) => {
      dispatchCleanupDeletedCompletionRefs(deletedCompletionId);
    },
    [dispatchCleanupDeletedCompletionRefs],
  );

  const handleRemoveDraft = (draftKey: string) => {
    const itemKey = getDraftItemKey(draftKey);
    const deletedCompletionId = makeDraftCompletionId(draftKey);

    dispatchRemoveDraft(draftKey);
    registerCompletionDraftForm(draftKey, null);
    delete formRefs.current[itemKey];
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
    setOpenItemKey(prev => (prev === itemKey ? null : prev));

    clearCompletionRefsInActionSnapshots(deletedCompletionId);
  };

  const handleRemoveExisting = (completionId: string) => {
    const confirmed = window.confirm(
      "결과 화면을 제거하면 저장 시 실제 삭제됩니다.\n액션에서 연결된 완료 화면 설정은 비워질 수 있습니다.\n계속하시겠습니까?",
    );
    if (!confirmed) {
      return;
    }

    dispatchMarkRemoved(completionId);
    setOpenItemKey(prev => (prev === getExistingItemKey(completionId) ? null : prev));

    clearCompletionRefsInActionSnapshots(completionId);
  };

  const setCompletionDraftTitle = useCallback(
    (draftKey: string, title: string) => {
      dispatchSetTitle({ draftKey, title });
    },
    [dispatchSetTitle],
  );

  const executeSave = async ({
    silent = false,
    showValidationUi = true,
    trigger = "manual",
  }: SectionSaveOptions = {}): Promise<SectionSaveResult> => {
    if (isLoading || isSaving) {
      return { status: "failed", message: "결과 화면 저장이 진행 중입니다." };
    }

    const strictMode = trigger === "publish";
    const canShowValidationUi = showValidationUi;
    const removedSnapshot = new Set(removedExistingIds);
    const existingSnapshot = [...visibleExistingCompletions];
    const draftSnapshot = [...completionDrafts];
    const listSnapshot: CompletionListItem[] = [
      ...existingSnapshot.map(completion => ({
        key: getExistingItemKey(completion.id),
        kind: "existing" as const,
        completion,
      })),
      ...draftSnapshot.map(draft => ({
        key: getDraftItemKey(draft.key),
        kind: "draft" as const,
        draft: {
          key: draft.key,
          title: draft.title,
        },
      })),
    ];

    if (listSnapshot.length === 0 && removedSnapshot.size === 0) {
      return { status: "no_changes" };
    }

    const details: NonNullable<SectionSaveResult["details"]> = [];
    const valuesByItemKey = new Map<string, CompletionFormValues>();
    const changedExisting: MissionCompletionWithMission[] = [];
    const draftsToCreate: Array<{ key: string; title: string }> = [];
    const settledItemKeys = new Set<string>();
    const successfulItemKeys = new Set<string>();
    const successfulRemovedIds = new Set<string>();
    const cacheUpsertByCompletionId = new Map<string, MissionCompletionWithMission>();
    const missionMeta = existingSnapshot[0]?.mission ?? null;
    let savedCount = 0;
    let skippedCount = 0;
    let failedCount = 0;
    let invalidCount = 0;
    let didMutateServer = false;

    const markInvalid = (itemKey: string, message: string) => {
      if (settledItemKeys.has(itemKey)) return;
      settledItemKeys.add(itemKey);
      invalidCount += 1;
      details.push({ key: itemKey, status: "invalid", message });
    };

    const markSkipped = (itemKey: string, message: string) => {
      if (settledItemKeys.has(itemKey)) return;
      settledItemKeys.add(itemKey);
      skippedCount += 1;
      details.push({ key: itemKey, status: "skipped", message });
    };

    const markFailed = (itemKey: string, message: string) => {
      if (settledItemKeys.has(itemKey)) return;
      settledItemKeys.add(itemKey);
      failedCount += 1;
      details.push({ key: itemKey, status: "failed", message });
    };

    const markSaved = (itemKey: string) => {
      if (settledItemKeys.has(itemKey)) return;
      settledItemKeys.add(itemKey);
      successfulItemKeys.add(itemKey);
      savedCount += 1;
      details.push({ key: itemKey, status: "saved" });
    };

    for (const item of listSnapshot) {
      const formRef = formRefs.current[item.key];
      if (!formRef) {
        if (canShowValidationUi) {
          setOpenItemKey(item.key);
        }
        const message = "결과 화면 폼이 준비되지 않았습니다. 다시 시도해주세요.";
        if (strictMode) {
          return { status: "failed", message };
        }
        markFailed(item.key, message);
        continue;
      }

      if (formRef.isUploading()) {
        if (canShowValidationUi) {
          setOpenItemKey(item.key);
        }
        const message = "이미지 업로드가 완료된 뒤 저장해주세요.";
        if (strictMode) {
          return { status: "failed", message };
        }
        markSkipped(item.key, message);
        continue;
      }

      const values = formRef.validateAndGetValues({ showErrors: canShowValidationUi });
      if (!values) {
        if (canShowValidationUi) {
          setOpenItemKey(item.key);
        }
        const message = "결과 화면 입력값을 확인해주세요.";
        if (strictMode) {
          return { status: "invalid", message };
        }
        markInvalid(item.key, message);
        continue;
      }

      valuesByItemKey.set(item.key, values);
      if (item.kind === "existing") {
        if (isCompletionChanged(item.completion, values)) {
          changedExisting.push(item.completion);
        }
      } else {
        draftsToCreate.push(item.draft);
      }
    }

    if (changedExisting.length === 0 && draftsToCreate.length === 0 && removedSnapshot.size === 0) {
      if (savedCount === 0 && skippedCount === 0 && failedCount === 0 && invalidCount === 0) {
        return { status: "no_changes" };
      }

      return {
        status: failedCount > 0 ? "failed" : "invalid",
        message:
          failedCount > 0
            ? "결과 화면 설정의 일부 저장에 실패했습니다."
            : "결과 화면 설정의 일부 입력값을 확인해주세요.",
        savedCount,
        skippedCount,
        failedCount,
        invalidCount,
        details,
      };
    }

    setIsSaving(true);
    try {
      for (const completion of changedExisting) {
        const itemKey = getExistingItemKey(completion.id);
        if (settledItemKeys.has(itemKey)) {
          continue;
        }

        const values = valuesByItemKey.get(itemKey);
        if (!values) {
          continue;
        }

        try {
          const updated = await updateMissionCompletion(completion.id, {
            title: values.title,
            description: values.description,
            imageUrl: values.imageUrl ?? null,
            imageFileUploadId: values.imageFileUploadId ?? null,
          });
          didMutateServer = true;
          if (updated?.data) {
            cacheUpsertByCompletionId.set(
              completion.id,
              buildPatchedCompletionForCache({
                currentCompletion: completion,
                serverData: updated.data,
                missionId,
                missionMeta,
              }),
            );
          }
          markSaved(itemKey);
        } catch (error) {
          const message =
            error instanceof Error ? error.message : "결과 화면 저장 중 오류가 발생했습니다.";
          if (strictMode) {
            return { status: "failed", message };
          }
          markFailed(itemKey, message);
        }
      }

      for (const draft of draftsToCreate) {
        const itemKey = getDraftItemKey(draft.key);
        if (settledItemKeys.has(itemKey)) {
          continue;
        }

        const values = valuesByItemKey.get(itemKey);
        if (!values) {
          continue;
        }

        try {
          const created = await createMissionCompletion({
            missionId,
            title: values.title,
            description: values.description,
            imageUrl: values.imageUrl ?? undefined,
            imageFileUploadId: values.imageFileUploadId ?? undefined,
          });
          didMutateServer = true;
          if (created?.data) {
            cacheUpsertByCompletionId.set(
              created.data.id,
              buildPatchedCompletionForCache({
                currentCompletion: null,
                serverData: created.data,
                missionId,
                missionMeta,
              }),
            );
          }
          markSaved(itemKey);
        } catch (error) {
          const message =
            error instanceof Error ? error.message : "결과 화면 저장 중 오류가 발생했습니다.";
          if (strictMode) {
            return { status: "failed", message };
          }
          markFailed(itemKey, message);
        }
      }

      for (const completionId of removedSnapshot) {
        try {
          await deleteMissionCompletion(completionId);
          didMutateServer = true;
          successfulRemovedIds.add(completionId);
          savedCount += 1;
          details.push({ key: getExistingItemKey(completionId), status: "saved" });
        } catch (error) {
          if (isMissingCompletionError(error)) {
            successfulRemovedIds.add(completionId);
            savedCount += 1;
            details.push({ key: getExistingItemKey(completionId), status: "saved" });
            continue;
          }

          const message =
            error instanceof Error ? error.message : "결과 화면 삭제 중 오류가 발생했습니다.";
          if (strictMode) {
            return { status: "failed", message };
          }
          failedCount += 1;
          details.push({ key: getExistingItemKey(completionId), status: "failed", message });
        }
      }

      for (const key of successfulItemKeys) {
        formRefs.current[key]?.deleteMarkedInitial();
      }

      const successfulExistingIds = changedExisting
        .map(item => item.id)
        .filter(id => successfulItemKeys.has(getExistingItemKey(id)));
      const successfulDraftKeys = draftsToCreate
        .map(item => item.key)
        .filter(key => successfulItemKeys.has(getDraftItemKey(key)));

      if (cacheUpsertByCompletionId.size > 0 || successfulRemovedIds.size > 0) {
        queryClient.setQueryData<GetMissionCompletionsResponse | undefined>(
          missionCompletionQueryKeys.missionCompletion(missionId),
          previous =>
            patchCompletionsQueryData(previous, {
              upserts: [...cacheUpsertByCompletionId.values()],
              removeIds: successfulRemovedIds,
            }),
        );
      }

      dispatchResetAfterSave({
        successfulItemKeys,
        successfulDraftKeys,
        successfulRemovedIds,
        successfulExistingIds,
      });

      for (const draftKey of successfulDraftKeys) {
        registerCompletionDraftForm(draftKey, null);
      }

      if (didMutateServer) {
        await Promise.all([
          queryClient.invalidateQueries({
            queryKey: missionCompletionQueryKeys.missionCompletion(missionId),
          }),
          queryClient.invalidateQueries({
            queryKey: actionQueryKeys.actions({ missionId }),
          }),
        ]);
      }

      const message =
        failedCount > 0
          ? "결과 화면 설정의 일부 저장에 실패했습니다."
          : invalidCount > 0 || skippedCount > 0
            ? "결과 화면 설정의 일부 항목이 저장에서 제외되었습니다."
            : "결과 화면 설정이 저장되었습니다.";

      if (!silent && (savedCount > 0 || skippedCount > 0 || failedCount > 0 || invalidCount > 0)) {
        if (failedCount > 0) {
          toast({
            message,
            icon: AlertCircle,
            iconClassName: "text-red-500",
          });
        } else {
          toast({ message });
        }
      }

      if (savedCount === 0 && skippedCount === 0 && failedCount === 0 && invalidCount === 0) {
        return { status: "no_changes" };
      }

      return {
        status:
          failedCount > 0 ? "failed" : invalidCount > 0 || skippedCount > 0 ? "invalid" : "saved",
        message,
        savedCount,
        skippedCount,
        failedCount,
        invalidCount,
        details,
      };
    } finally {
      setIsSaving(false);
    }
  };

  const saveHandle = useMemo<SectionSaveHandle>(
    () => ({
      save: executeSave,
      hasPendingChanges: () => hasPendingChanges,
      isBusy: () => isSaving || isLoading,
      exportDraftSnapshot: (): CompletionSectionDraftSnapshot => {
        return getCompletionDraftSnapshot();
      },
      importDraftSnapshot: async (snapshot: unknown) => {
        if (!snapshot || typeof snapshot !== "object") {
          return;
        }

        const next = snapshot as Partial<CompletionSectionDraftSnapshot>;
        const nextDraftItems = Array.isArray(next.draftItems)
          ? next.draftItems
              .filter(
                (item): item is { key: string; title: string } =>
                  Boolean(item) &&
                  typeof item === "object" &&
                  typeof (item as { key?: unknown }).key === "string",
              )
              .map(item => ({
                key: item.key,
                title: typeof item.title === "string" ? item.title : "새 결과 화면",
              }))
          : [];
        const nextRemovedIds = Array.isArray(next.removedExistingIds)
          ? next.removedExistingIds.filter((id): id is string => typeof id === "string")
          : [];
        const nextDirtyByKey =
          next.dirtyByItemKey && typeof next.dirtyByItemKey === "object"
            ? (next.dirtyByItemKey as Record<string, boolean>)
            : {};
        const nextFormSnapshots =
          next.formSnapshotByItemKey && typeof next.formSnapshotByItemKey === "object"
            ? (next.formSnapshotByItemKey as Record<string, CompletionFormRawSnapshot>)
            : {};

        dispatchClear();
        for (const item of nextDraftItems) {
          if (!item || typeof item.key !== "string") {
            continue;
          }
          dispatchAddDraft({
            draftKey: item.key,
            title: typeof item.title === "string" ? item.title : "새 결과 화면",
          });
        }

        setRemovedExistingIds(new Set(nextRemovedIds));
        setDirtyByItemKey(nextDirtyByKey);
        setOpenItemKey(typeof next.openItemKey === "string" ? next.openItemKey : null);
        setDraftFormSnapshotByItemKey(nextFormSnapshots);
        setDraftHydrationVersion(prev => prev + 1);
      },
    }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [
      dispatchAddDraft,
      dispatchClear,
      executeSave,
      getCompletionDraftSnapshot,
      hasPendingChanges,
      isLoading,
      isSaving,
      setDirtyByItemKey,
      setDraftFormSnapshotByItemKey,
      setDraftHydrationVersion,
      setOpenItemKey,
      setRemovedExistingIds,
    ],
  );

  return {
    viewState: {
      isSaving,
      isLoading,
      hasPendingChanges,
      hasValidationIssues,
      validationIssueCount,
    },
    listState: {
      completionItems,
      openItemKey,
      draftFormSnapshotByItemKey,
      existingFormVersionById,
      draftHydrationVersion,
    },
    formRefs,
    handlers: {
      handleAddDraft,
      handleRemoveDraft,
      handleRemoveExisting,
      handleToggleItem,
      handleItemDirtyChange,
      handleItemValidationChange,
      handleItemRawSnapshotChange,
      setCompletionDraftTitle,
      registerCompletionDraftForm,
    },
    saveHandle,
  };
}
