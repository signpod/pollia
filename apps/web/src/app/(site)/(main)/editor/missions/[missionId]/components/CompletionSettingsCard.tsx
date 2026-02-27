"use client";

import {
  createMissionCompletion,
  deleteMissionCompletion,
  getCompletionsByMissionId,
  updateMissionCompletion,
} from "@/actions/mission-completion";
import { actionQueryKeys } from "@/constants/queryKeys/actionQueryKeys";
import { missionCompletionQueryKeys } from "@/constants/queryKeys/missionCompletionQueryKeys";
import type { MissionCompletionWithMission } from "@/types/dto";
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
  type CompletionFormValues,
} from "./CompletionForm";
import { getCompletionDraftItemKey, useEditorMissionDraft } from "./EditorMissionDraftContext";
import type {
  SectionSaveHandle,
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
  }, [completionItems]);

  const hasPendingChanges = useMemo(() => {
    if (completionDrafts.length > 0 || removedExistingIds.size > 0) {
      return true;
    }

    return visibleExistingCompletions.some(
      completion => dirtyByItemKey[getExistingItemKey(completion.id)],
    );
  }, [completionDrafts.length, removedExistingIds, visibleExistingCompletions, dirtyByItemKey]);

  useEffect(() => {
    onSaveStateChange?.({
      hasPendingChanges,
      isBusy: isSaving || isLoading,
    });
  }, [hasPendingChanges, isLoading, isSaving, onSaveStateChange]);

  const handleItemDirtyChange = useCallback((itemKey: string, isDirty: boolean) => {
    setDirtyByItemKey(prev => {
      if (prev[itemKey] === isDirty) {
        return prev;
      }

      return { ...prev, [itemKey]: isDirty };
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
  }: { silent?: boolean } = {}): Promise<SectionSaveResult> => {
    if (isLoading || isSaving) {
      return { status: "failed", message: "결과 화면 저장이 진행 중입니다." };
    }

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

    const valuesByItemKey = new Map<string, CompletionFormValues>();
    for (const item of listSnapshot) {
      const formRef = formRefs.current[item.key];
      if (!formRef) {
        setOpenItemKey(item.key);
        return {
          status: "failed",
          message: "결과 화면 폼이 준비되지 않았습니다. 다시 시도해주세요.",
        };
      }

      if (formRef.isUploading()) {
        setOpenItemKey(item.key);
        return {
          status: "failed",
          message: "이미지 업로드가 완료된 뒤 저장해주세요.",
        };
      }

      const values = formRef.validateAndGetValues();
      if (!values) {
        setOpenItemKey(item.key);
        return {
          status: "failed",
          message: "결과 화면 입력값을 확인해주세요.",
        };
      }

      valuesByItemKey.set(item.key, values);
    }

    const changedExisting = existingSnapshot.filter(completion => {
      const values = valuesByItemKey.get(getExistingItemKey(completion.id));
      if (!values) {
        return false;
      }

      return isCompletionChanged(completion, values);
    });

    if (changedExisting.length === 0 && draftSnapshot.length === 0 && removedSnapshot.size === 0) {
      return { status: "no_changes" };
    }

    setIsSaving(true);
    try {
      for (const completion of changedExisting) {
        const itemKey = getExistingItemKey(completion.id);
        const values = valuesByItemKey.get(itemKey);
        if (!values) {
          continue;
        }

        await updateMissionCompletion(completion.id, {
          title: values.title,
          description: values.description,
          imageUrl: values.imageUrl ?? null,
          imageFileUploadId: values.imageFileUploadId ?? null,
        });
        formRefs.current[itemKey]?.deleteMarkedInitial();
      }

      for (const draft of draftSnapshot) {
        const itemKey = getDraftItemKey(draft.key);
        const values = valuesByItemKey.get(itemKey);
        if (!values) {
          continue;
        }

        await createMissionCompletion({
          missionId,
          title: values.title,
          description: values.description,
          imageUrl: values.imageUrl ?? undefined,
          imageFileUploadId: values.imageFileUploadId ?? undefined,
        });
        formRefs.current[itemKey]?.deleteMarkedInitial();
      }

      for (const completionId of removedSnapshot) {
        await deleteMissionCompletion(completionId);
      }

      setExistingFormVersionById(prev => {
        const next = { ...prev };
        for (const completion of changedExisting) {
          next[completion.id] = (next[completion.id] ?? 0) + 1;
        }
        for (const completionId of removedSnapshot) {
          delete next[completionId];
        }
        return next;
      });
      setDirtyByItemKey(prev => {
        const next = { ...prev };
        for (const completion of changedExisting) {
          delete next[getExistingItemKey(completion.id)];
        }
        for (const draft of draftSnapshot) {
          delete next[getDraftItemKey(draft.key)];
        }
        return next;
      });
      clearCompletionDrafts();
      setRemovedExistingIds(new Set());
      setOpenItemKey(null);

      await Promise.all([
        queryClient.invalidateQueries({
          queryKey: missionCompletionQueryKeys.missionCompletion(missionId),
        }),
        queryClient.invalidateQueries({
          queryKey: actionQueryKeys.actions({ missionId }),
        }),
      ]);

      if (!silent) {
        toast({ message: "결과 화면 설정이 저장되었습니다." });
      }
      return { status: "saved" };
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "결과 화면 저장 중 오류가 발생했습니다.";
      if (!silent) {
        toast({
          message,
          icon: AlertCircle,
          iconClassName: "text-red-500",
        });
      }
      return { status: "failed", message };
    } finally {
      setIsSaving(false);
    }

    return { status: "failed", message: "결과 화면 저장 중 오류가 발생했습니다." };
  };

  useImperativeHandle(
    ref,
    () => ({
      save: executeSave,
      hasPendingChanges: () => hasPendingChanges,
      isBusy: () => isSaving || isLoading,
    }),
    [executeSave, hasPendingChanges, isLoading, isSaving],
  );

  return (
    <div className="border border-zinc-200 bg-white">
      <div className="border-b border-zinc-100 px-5 py-4">
        <Typo.SubTitle>결과 화면 수정</Typo.SubTitle>
        <Typo.Body size="medium" className="mt-1 text-zinc-500">
          미션 완료 후 노출될 결과 화면을 추가하고 수정합니다.
        </Typo.Body>
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

              return (
                <div key={item.key} className="overflow-hidden rounded-xl border border-zinc-200">
                  <div className="flex items-center justify-between bg-zinc-50 px-4 py-3">
                    <button
                      type="button"
                      onClick={() => handleToggleItem(item.key)}
                      className="flex min-w-0 flex-1 items-center justify-between gap-3 text-left"
                    >
                      <Typo.Body size="medium" className="truncate font-semibold text-zinc-800">
                        {index + 1}. {title}
                      </Typo.Body>
                      <ChevronDown
                        className={`size-4 shrink-0 text-zinc-500 transition-transform ${
                          isOpen ? "rotate-180" : ""
                        }`}
                      />
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
                          ? `${item.key}:${existingFormVersionById[item.completion.id] ?? 0}`
                          : item.key
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
