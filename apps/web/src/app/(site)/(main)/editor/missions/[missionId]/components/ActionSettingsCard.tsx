"use client";

import { getCompletionsByMissionId } from "@/actions/mission-completion";
import { updateMission } from "@/actions/mission/update";
import {
  ActionForm,
  type ActionFormHandle,
  type ActionFormValues,
} from "@/app/(site)/mission/[missionId]/manage/actions/components/ActionForm";
import {
  useManageCreateAction,
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
import { missionCompletionQueryKeys } from "@/constants/queryKeys/missionCompletionQueryKeys";
import { useReadActionsDetail } from "@/hooks/action";
import type { ActionDetail } from "@/types/dto";
import { ActionType } from "@prisma/client";
import { Button, Typo, toast } from "@repo/ui/components";
import { useQuery } from "@tanstack/react-query";
import { AlertCircle, ChevronDown, Plus, X } from "lucide-react";
import { useMemo, useRef, useState } from "react";

interface ActionSettingsCardProps {
  missionId: string;
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
    isRequired: values.isRequired,
  };

  if (ACTION_TYPES_WITH_MAX_SELECTIONS.has(type)) {
    normalized.maxSelections = values.maxSelections ?? 1;
  }

  if (type === ActionType.MULTIPLE_CHOICE || type === ActionType.TAG) {
    normalized.hasOther = Boolean(values.hasOther);
  }

  if (ACTION_TYPES_WITH_OPTIONS.has(type)) {
    normalized.options = (values.options ?? []).map((option, index) => ({
      title: option.title.trim(),
      description: option.description?.trim() || null,
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

const NOOP = () => {};

export function ActionSettingsCard({ missionId }: ActionSettingsCardProps) {
  const formRefs = useRef<Record<string, ActionFormHandle | null>>({});
  const [draftItems, setDraftItems] = useState<DraftActionItem[]>([]);
  const [openItemKey, setOpenItemKey] = useState<string | null>(null);
  const [isUpdatingEntryAction, setIsUpdatingEntryAction] = useState(false);
  const [actionTypeByItemKey, setActionTypeByItemKey] = useState<Record<string, ActionType>>({});

  const { data: actionsData, isLoading: isActionsLoading } = useReadActionsDetail(missionId);
  const { data: completionsData } = useQuery({
    queryKey: missionCompletionQueryKeys.missionCompletion(missionId),
    queryFn: () => getCompletionsByMissionId(missionId),
    staleTime: 5 * 60 * 1000,
  });

  const createAction = useManageCreateAction();
  const updateAction = useManageUpdateAction();

  const isSaving = createAction.isPending || updateAction.isPending || isUpdatingEntryAction;

  const existingActions = useMemo(() => {
    const list = actionsData?.data ?? [];
    return [...list].sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
  }, [actionsData]);

  const completionOptions = useMemo(
    () =>
      (completionsData?.data ?? []).map(completion => ({
        id: completion.id,
        title: completion.title ?? "완료 화면",
      })),
    [completionsData],
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
    delete formRefs.current[itemKey];
    setOpenItemKey(prev => (prev === itemKey ? null : prev));
  };

  const handleToggleItem = (itemKey: string) => {
    setOpenItemKey(prev => (prev === itemKey ? null : itemKey));
  };

  const handleActionTypeChange = (itemKey: string, actionType: ActionType) => {
    setActionTypeByItemKey(prev => ({ ...prev, [itemKey]: actionType }));
  };

  const handleSave = async () => {
    if (isActionsLoading || isSaving) return;

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
      toast({ message: "저장할 액션이 없습니다." });
      return;
    }

    const submissionsByKey = new Map<string, ActionSubmission>();

    for (const item of listSnapshot) {
      const formRef = formRefs.current[item.key];
      if (!formRef) {
        setOpenItemKey(item.key);
        toast({
          message: "액션 폼이 준비되지 않았습니다. 다시 시도해주세요.",
          icon: AlertCircle,
          iconClassName: "text-red-500",
        });
        return;
      }

      const submission = formRef.validateAndGetSubmission();
      if (!submission) {
        setOpenItemKey(item.key);
        return;
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
      toast({ message: "변경된 액션이 없습니다." });
      return;
    }

    try {
      let firstCreatedActionId: string | null = null;
      const tempToRealActionIdMap = new Map<string, string>();
      const createdDraftRecords: Array<{
        createdId: string;
        submission: ActionSubmission;
        hasDraftReference: boolean;
      }> = [];

      for (const [index, draft] of draftSnapshot.entries()) {
        const key = getDraftItemKey(draft.key);
        const submission = submissionsByKey.get(key);
        if (!submission) continue;

        const hasDraftReference = hasDraftActionReference(submission.values);
        const sanitizedValues = resolveDraftActionReferences(
          submission.values,
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

        const resolvedValues = resolveDraftActionReferences(
          submission.values,
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

        const resolvedValues = resolveDraftActionReferences(
          createdDraft.submission.values,
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

      if (existingSnapshot.length === 0 && firstCreatedActionId) {
        setIsUpdatingEntryAction(true);
        try {
          await updateMission(missionId, { entryActionId: firstCreatedActionId });
        } catch {
          toast({
            message: "시작 액션 설정 중 오류가 발생했습니다.",
            icon: AlertCircle,
            iconClassName: "text-red-500",
          });
        } finally {
          setIsUpdatingEntryAction(false);
        }
      }

      setDraftItems([]);
      setActionTypeByItemKey(prev => {
        const next = { ...prev };
        for (const draft of draftSnapshot) {
          delete next[getDraftItemKey(draft.key)];
        }
        return next;
      });
      toast({ message: "액션 설정이 저장되었습니다." });
    } catch (error) {
      toast({
        message: error instanceof Error ? error.message : "액션 설정 저장에 실패했습니다.",
        icon: AlertCircle,
        iconClassName: "text-red-500",
      });
    } finally {
      setIsUpdatingEntryAction(false);
    }
  };

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
                    ) : null}
                  </div>

                  <div className={isOpen ? "block border-t border-zinc-200" : "hidden"}>
                    {item.kind === "existing" ? (
                      <ActionForm
                        ref={instance => {
                          formRefs.current[item.key] = instance;
                        }}
                        actionType={itemType}
                        editingAction={item.action}
                        initialValues={mapEditInitialValues(item.action)}
                        allActions={formLinkTargets}
                        completionOptions={completionOptions}
                        isLoading={isSaving}
                        onSubmit={NOOP}
                        onCancel={NOOP}
                        hideTitle
                        hideFooter
                        enableTypeSelect
                        onActionTypeChange={type => handleActionTypeChange(item.key, type)}
                      />
                    ) : (
                      <ActionForm
                        ref={instance => {
                          formRefs.current[item.key] = instance;
                        }}
                        actionType={itemType}
                        allActions={formLinkTargets}
                        completionOptions={completionOptions}
                        isLoading={isSaving}
                        onSubmit={NOOP}
                        onCancel={NOOP}
                        hideTitle
                        hideFooter
                        enableTypeSelect
                        onActionTypeChange={type => handleActionTypeChange(item.key, type)}
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
          disabled={isSaving || isActionsLoading}
          className="flex items-center justify-center gap-2 rounded-xl border-2 border-dashed border-zinc-200 bg-white py-4 text-zinc-500 transition-colors hover:border-violet-300 hover:text-violet-500 disabled:cursor-not-allowed disabled:opacity-50"
        >
          <Plus className="size-5" />
          <Typo.Body size="medium" className="font-medium">
            액션 추가
          </Typo.Body>
        </button>

        <div className="flex justify-end">
          <Button onClick={handleSave} loading={isSaving} disabled={isSaving || isActionsLoading}>
            저장
          </Button>
        </div>
      </div>
    </div>
  );
}
