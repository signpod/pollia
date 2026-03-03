"use client";

import {
  createMissionCompletion,
  deleteMissionCompletion,
  getCompletionsByMissionId,
  updateMissionCompletion,
} from "@/actions/mission-completion";
import { actionQueryKeys } from "@/constants/queryKeys/actionQueryKeys";
import { missionCompletionQueryKeys } from "@/constants/queryKeys/missionCompletionQueryKeys";
import type {
  GetMissionCompletionsResponse,
  MissionCompletionData,
  MissionCompletionWithMission,
} from "@/types/dto";
import { Typo, toast } from "@repo/ui/components";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { AlertCircle, ChevronDown, Plus, X } from "lucide-react";
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
import {
  CompletionForm,
  type CompletionFormHandle,
  type CompletionFormRawSnapshot,
  type CompletionFormValues,
} from "./CompletionForm";
import { getCompletionDraftItemKey, useEditorMissionDraft } from "./EditorMissionDraftContext";
import type {
  SectionSaveHandle,
  SectionSaveOptions,
  SectionSaveResult,
  SectionSaveStateChangeHandler,
} from "./editor-save.types";

interface CompletionSettingsCardProps {
  missionId: string;
  onSaveStateChange?: SectionSaveStateChangeHandler;
}

interface ExistingListItem {
  key: string;
  kind: "existing";
  completion: MissionCompletionWithMission;
}

interface DraftListItem {
  key: string;
  kind: "draft";
  draft: {
    key: string;
    title: string;
  };
}

type CompletionListItem = ExistingListItem | DraftListItem;

interface CompletionSectionDraftSnapshot {
  draftItems: Array<{ key: string; title: string }>;
  openItemKey: string | null;
  removedExistingIds: string[];
  dirtyByItemKey: Record<string, boolean>;
  formSnapshotByItemKey: Record<string, CompletionFormRawSnapshot>;
}

function createDraftKey() {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }

  return `completion-draft-${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

function getExistingItemKey(completionId: string) {
  return `existing:${completionId}`;
}

function getDraftItemKey(draftKey: string) {
  return getCompletionDraftItemKey(draftKey);
}

function mapEditInitialValues(completion: MissionCompletionWithMission): CompletionFormValues {
  return {
    title: completion.title,
    description: completion.description,
    imageUrl: completion.imageUrl ?? null,
    imageFileUploadId: completion.imageFileUploadId ?? null,
  };
}

function normalizeValues(values: CompletionFormValues) {
  return {
    title: values.title.trim(),
    description: values.description.trim(),
    imageUrl: values.imageUrl ?? null,
    imageFileUploadId: values.imageFileUploadId ?? null,
  };
}

function isCompletionChanged(
  completion: MissionCompletionWithMission,
  values: CompletionFormValues,
): boolean {
  const current = normalizeValues(values);
  const initial = normalizeValues(mapEditInitialValues(completion));
  return JSON.stringify(current) !== JSON.stringify(initial);
}

function toDateOrFallback(value: unknown, fallback: Date): Date {
  if (value instanceof Date && !Number.isNaN(value.getTime())) {
    return value;
  }

  if (typeof value === "string" || typeof value === "number") {
    const parsed = new Date(value);
    if (!Number.isNaN(parsed.getTime())) {
      return parsed;
    }
  }

  return fallback;
}

function buildPatchedCompletionForCache(params: {
  currentCompletion: MissionCompletionWithMission | null;
  serverData: MissionCompletionData;
  missionId: string;
  missionMeta: MissionCompletionWithMission["mission"] | null;
}): MissionCompletionWithMission {
  const { currentCompletion, serverData, missionId, missionMeta } = params;
  const now = new Date();

  return {
    id: serverData.id,
    title: serverData.title,
    description: serverData.description,
    imageUrl: serverData.imageUrl ?? null,
    links: serverData.links ?? null,
    missionId: serverData.missionId ?? currentCompletion?.missionId ?? missionId,
    imageFileUploadId: serverData.imageFileUploadId ?? null,
    createdAt: toDateOrFallback(serverData.createdAt ?? currentCompletion?.createdAt, now),
    updatedAt: toDateOrFallback(serverData.updatedAt ?? currentCompletion?.updatedAt, now),
    imageFileUpload: serverData.imageFileUpload ?? currentCompletion?.imageFileUpload ?? null,
    mission: currentCompletion?.mission ?? missionMeta ?? { id: missionId, creatorId: "" },
  };
}

function patchCompletionsQueryData(
  previous: GetMissionCompletionsResponse | undefined,
  params: {
    upserts: MissionCompletionWithMission[];
    removeIds: Set<string>;
  },
): GetMissionCompletionsResponse | undefined {
  const { upserts, removeIds } = params;
  if (
    !previous ||
    !Array.isArray(previous.data) ||
    (upserts.length === 0 && removeIds.size === 0)
  ) {
    return previous;
  }

  const byId = new Map(previous.data.map(completion => [completion.id, completion]));
  for (const completionId of removeIds) {
    byId.delete(completionId);
  }
  for (const completion of upserts) {
    byId.set(completion.id, completion);
  }

  const nextData = [...byId.values()].sort(
    (left, right) =>
      toDateOrFallback(left.createdAt, new Date(0)).getTime() -
      toDateOrFallback(right.createdAt, new Date(0)).getTime(),
  );

  return { ...previous, data: nextData };
}

const NOOP = () => {};

function CompletionSettingsCardComponent(
  { missionId, onSaveStateChange }: CompletionSettingsCardProps,
  ref: ForwardedRef<SectionSaveHandle>,
) {
  const queryClient = useQueryClient();
  const formRefs = useRef<Record<string, CompletionFormHandle | null>>({});
  const [removedExistingIds, setRemovedExistingIds] = useState<Set<string>>(new Set());
  const [openItemKey, setOpenItemKey] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [dirtyByItemKey, setDirtyByItemKey] = useState<Record<string, boolean>>({});
  const [existingFormVersionById, setExistingFormVersionById] = useState<Record<string, number>>(
    {},
  );
  const [draftFormSnapshotByItemKey, setDraftFormSnapshotByItemKey] = useState<
    Record<string, CompletionFormRawSnapshot>
  >({});
  const [validationIssueCountByItemKey, setValidationIssueCountByItemKey] = useState<
    Record<string, number>
  >({});
  const [draftHydrationVersion, setDraftHydrationVersion] = useState(0);
  const {
    completionDrafts,
    addCompletionDraft,
    removeCompletionDraft,
    setCompletionDraftTitle,
    clearCompletionDrafts,
    registerCompletionDraftForm,
    setCompletionOpenHandler,
  } = useEditorMissionDraft();

  useEffect(() => {
    setCompletionOpenHandler(itemKey => {
      setOpenItemKey(itemKey);
    });

    return () => {
      setCompletionOpenHandler(null);
    };
  }, [setCompletionOpenHandler]);

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
  }, [completionItems]);

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

  const handleAddDraft = () => {
    if (isSaving) {
      return;
    }

    const draftKey = createDraftKey();
    addCompletionDraft(draftKey);
    setOpenItemKey(getDraftItemKey(draftKey));
  };

  const handleToggleItem = (itemKey: string) => {
    setOpenItemKey(prev => (prev === itemKey ? null : itemKey));
  };

  const handleRemoveDraft = (draftKey: string) => {
    const itemKey = getDraftItemKey(draftKey);
    removeCompletionDraft(draftKey);
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
  };

  const handleRemoveExisting = (completionId: string) => {
    const confirmed = window.confirm(
      "결과 화면을 제거하면 저장 시 실제 삭제됩니다.\n액션에서 연결된 완료 화면 설정은 비워질 수 있습니다.\n계속하시겠습니까?",
    );
    if (!confirmed) {
      return;
    }

    setRemovedExistingIds(prev => new Set(prev).add(completionId));
    setOpenItemKey(prev => (prev === getExistingItemKey(completionId) ? null : prev));
  };

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

      if (successfulExistingIds.length > 0 || successfulRemovedIds.size > 0) {
        setExistingFormVersionById(prev => {
          const next = { ...prev };
          for (const completionId of successfulExistingIds) {
            next[completionId] = (next[completionId] ?? 0) + 1;
          }
          for (const completionId of successfulRemovedIds) {
            delete next[completionId];
          }
          return next;
        });
      }

      if (successfulItemKeys.size > 0) {
        setDirtyByItemKey(prev => {
          const next = { ...prev };
          for (const key of successfulItemKeys) {
            delete next[key];
          }
          return next;
        });
        setValidationIssueCountByItemKey(prev => {
          const next = { ...prev };
          for (const key of successfulItemKeys) {
            delete next[key];
          }
          return next;
        });
        setDraftFormSnapshotByItemKey(prev => {
          const next = { ...prev };
          for (const key of successfulItemKeys) {
            delete next[key];
          }
          return next;
        });
      }

      if (successfulDraftKeys.length > 0) {
        for (const draftKey of successfulDraftKeys) {
          removeCompletionDraft(draftKey);
          registerCompletionDraftForm(draftKey, null);
        }
      }

      if (successfulRemovedIds.size > 0) {
        setRemovedExistingIds(prev => {
          const next = new Set(prev);
          for (const id of successfulRemovedIds) {
            next.delete(id);
          }
          return next;
        });
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

  useImperativeHandle(
    ref,
    () => ({
      save: executeSave,
      hasPendingChanges: () => hasPendingChanges,
      isBusy: () => isSaving || isLoading,
      exportDraftSnapshot: (): CompletionSectionDraftSnapshot => {
        const formSnapshotByItemKey: Record<string, CompletionFormRawSnapshot> = {};

        for (const item of completionItems) {
          const snapshot = formRefs.current[item.key]?.getRawSnapshot();
          if (snapshot) {
            formSnapshotByItemKey[item.key] = snapshot;
          }
        }

        return {
          draftItems: completionDrafts.map(item => ({ key: item.key, title: item.title })),
          openItemKey,
          removedExistingIds: [...removedExistingIds],
          dirtyByItemKey,
          formSnapshotByItemKey,
        };
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

        clearCompletionDrafts();
        for (const item of nextDraftItems) {
          if (!item || typeof item.key !== "string") {
            continue;
          }
          addCompletionDraft(
            item.key,
            typeof item.title === "string" ? item.title : "새 결과 화면",
          );
        }

        setRemovedExistingIds(new Set(nextRemovedIds));
        setDirtyByItemKey(nextDirtyByKey);
        setOpenItemKey(typeof next.openItemKey === "string" ? next.openItemKey : null);
        setDraftFormSnapshotByItemKey(nextFormSnapshots);
        setDraftHydrationVersion(prev => prev + 1);
      },
    }),
    [
      addCompletionDraft,
      clearCompletionDrafts,
      completionDrafts,
      completionItems,
      dirtyByItemKey,
      executeSave,
      hasPendingChanges,
      isLoading,
      isSaving,
      openItemKey,
      removedExistingIds,
    ],
  );

  return (
    <div className="border border-zinc-200 bg-white">
      <div className="border-b border-zinc-100 px-5 py-4">
        <div className="flex items-start justify-between gap-4">
          <div>
            <Typo.SubTitle>결과 화면 수정</Typo.SubTitle>
            <Typo.Body size="medium" className="mt-1 text-zinc-500">
              미션 완료 후 노출될 결과 화면을 추가하고 수정합니다.
            </Typo.Body>
          </div>
          {hasValidationIssues ? (
            <div
              className="flex shrink-0 items-center gap-1 text-red-500"
              title="입력 확인 필요"
              aria-label="입력 확인 필요"
            >
              <AlertCircle className="size-4" />
              <Typo.Body size="small" className="font-semibold text-red-500">
                {validationIssueCount}
              </Typo.Body>
            </div>
          ) : null}
        </div>
      </div>

      <div className="flex flex-col gap-4 px-5 py-5">
        {isLoading ? (
          <div className="rounded-xl border border-zinc-200 bg-zinc-50 px-4 py-10 text-center">
            <Typo.Body size="medium" className="text-zinc-500">
              로딩 중...
            </Typo.Body>
          </div>
        ) : completionItems.length === 0 ? (
          <div className="rounded-xl border border-zinc-200 bg-zinc-50 px-4 py-10 text-center">
            <Typo.SubTitle>아직 결과 화면이 없습니다</Typo.SubTitle>
            <Typo.Body size="medium" className="mt-2 text-zinc-500">
              결과 화면 추가 버튼으로 첫 결과 화면을 생성해주세요.
            </Typo.Body>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {completionItems.map((item, index) => {
              const isOpen = openItemKey === item.key;
              const title =
                item.kind === "existing"
                  ? item.completion.title
                  : (item.draft.title.trim() ?? "") || "새 결과 화면";
              const previewImageUrl =
                formRefs.current[item.key]?.getRawSnapshot().imageUrl ??
                draftFormSnapshotByItemKey[item.key]?.imageUrl ??
                (item.kind === "existing" ? item.completion.imageUrl : null);

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
                          {index + 1}. {title}
                        </Typo.Body>
                      </div>
                      <div className="flex shrink-0 items-center gap-2">
                        {previewImageUrl ? (
                          <img
                            src={previewImageUrl}
                            alt={`${title} 미리보기 이미지`}
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

                    <button
                      type="button"
                      aria-label={
                        item.kind === "existing" ? "결과 화면 제거" : "신규 결과 화면 제거"
                      }
                      onClick={() =>
                        item.kind === "existing"
                          ? handleRemoveExisting(item.completion.id)
                          : handleRemoveDraft(item.draft.key)
                      }
                      className="ml-2 rounded p-1 text-zinc-400 transition-colors hover:text-red-500"
                    >
                      <X className="size-4" />
                    </button>
                  </div>

                  <div className={isOpen ? "block border-t border-zinc-200" : "hidden"}>
                    <CompletionForm
                      key={
                        item.kind === "existing"
                          ? `${item.key}:${existingFormVersionById[item.completion.id] ?? 0}:${draftHydrationVersion}`
                          : `${item.key}:${draftHydrationVersion}`
                      }
                      ref={instance => {
                        formRefs.current[item.key] = instance;
                        if (item.kind === "draft") {
                          registerCompletionDraftForm(item.draft.key, instance);
                        }
                      }}
                      missionId={missionId}
                      itemKey={item.key}
                      initialValues={
                        draftFormSnapshotByItemKey[item.key] ??
                        (item.kind === "existing"
                          ? mapEditInitialValues(item.completion)
                          : undefined)
                      }
                      dirtyBaselineValues={
                        item.kind === "existing" ? mapEditInitialValues(item.completion) : undefined
                      }
                      isLoading={isSaving}
                      onSubmit={NOOP}
                      onCancel={NOOP}
                      hideTitle
                      hideFooter
                      onTitleChange={
                        item.kind === "draft"
                          ? titleValue => setCompletionDraftTitle(item.draft.key, titleValue)
                          : undefined
                      }
                      onDirtyChange={isDirty => {
                        handleItemDirtyChange(item.key, isDirty);
                      }}
                      onValidationStateChange={issueCount => {
                        handleItemValidationChange(item.key, issueCount);
                      }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        )}

        <button
          type="button"
          onClick={handleAddDraft}
          disabled={isSaving || isLoading}
          className="flex items-center justify-center gap-2 rounded-xl border-2 border-dashed border-zinc-200 bg-white py-4 text-zinc-500 transition-colors hover:border-violet-300 hover:text-violet-500 disabled:cursor-not-allowed disabled:opacity-50"
        >
          <Plus className="size-5" />
          <Typo.Body size="medium" className="font-medium">
            결과 화면 추가
          </Typo.Body>
        </button>
      </div>
    </div>
  );
}

export const CompletionSettingsCard = forwardRef<SectionSaveHandle, CompletionSettingsCardProps>(
  CompletionSettingsCardComponent,
);
CompletionSettingsCard.displayName = "CompletionSettingsCard";
