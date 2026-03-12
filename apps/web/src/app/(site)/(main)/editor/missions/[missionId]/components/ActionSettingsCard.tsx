"use client";

import type { ActionFormHandle } from "@/app/(site)/mission/[missionId]/manage/actions/components/ActionForm";
import {
  makeDraftActionId,
  mapEditInitialValues,
} from "@/app/(site)/mission/[missionId]/manage/actions/logic";
import {
  DndContext,
  KeyboardSensor,
  PointerSensor,
  TouchSensor,
  closestCenter,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { ActionType } from "@prisma/client";
import { Button, Typo } from "@repo/ui/components";
import { useAtom } from "jotai";
import { AlertCircle, GitBranch, Plus } from "lucide-react";
import {
  type ForwardedRef,
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useMemo,
  useRef,
} from "react";
import { actionScrollTargetItemKeyAtom } from "../atoms/editorActionAtoms";
import { ActionDeleteConfirmDialog } from "./ActionDeleteConfirmDialog";
import { FlowOverviewDialog } from "./FlowOverviewDialog";
import { SortableActionItem } from "./SortableActionItem";
import type { ActionSettingsCardProps } from "./actionSettingsCard.types";
import type { SectionSaveHandle } from "./editor-save.types";
import { useActionSettingsCard } from "./useActionSettingsCard";
import { useCreateLinkedItem } from "./useCreateLinkedItem";

export type { ActionSectionDraftSnapshot } from "./actionSettingsCard.types";

const EMPTY_SET = new Set<string>();
const EMPTY_LINK_TARGETS: Array<{ id: string; title: string; order: number }> = [];

function ActionSettingsCardComponent(
  props: ActionSettingsCardProps,
  ref: ForwardedRef<SectionSaveHandle>,
) {
  const {
    viewState,
    listState,
    derived,
    formRefs,
    deleteDialog,
    flowDialog,
    handlers,
    saveHandle,
  } = useActionSettingsCard(props);

  const { createLinkedAction, createLinkedCompletion } = useCreateLinkedItem();

  useImperativeHandle(ref, () => saveHandle, [saveHandle]);

  const {
    isBusy,
    isActionsLoading,
    isFlowLoading,
    hasValidationIssues,
    validationIssueCount,
    isAiCompletionEnabled,
  } = viewState;

  const {
    orderedActionItems,
    openItemKey,
    actionTypeByItemKey,
    existingFormVersionById,
    draftHydrationVersion,
  } = listState;

  const {
    completionOptions,
    linkTargets,
    entryActionId,
    referencedActionIdsBySource,
    flowAnalysis,
  } = derived;

  const {
    handleAddDraft,
    handleRemoveDraft,
    handleToggleItem,
    handleActionTypeChange,
    handleDragEnd,
    handleMoveItem,
    handleItemDirtyChange,
    handleItemValidationChange,
    handleItemRawSnapshotChange,
  } = handlers;

  const handleFormRef = useCallback(
    (itemKey: string, instance: ActionFormHandle | null) => {
      formRefs.current[itemKey] = instance;
    },
    [formRefs],
  );

  const precomputedByItemKey = useMemo(() => {
    const disabledActionIds: Record<string, Set<string>> = {};
    const formLinkTargets: Record<string, typeof linkTargets> = {};

    for (const item of orderedActionItems) {
      const currentActionId =
        item.kind === "existing" ? item.action.id : makeDraftActionId(item.draft.key);

      const disabled = new Set<string>();
      if (entryActionId) disabled.add(entryActionId);
      for (const [targetId, sources] of referencedActionIdsBySource) {
        if (targetId === currentActionId) continue;
        if (sources.has(item.key)) continue;
        disabled.add(targetId);
      }
      disabledActionIds[item.key] = disabled;
      formLinkTargets[item.key] = linkTargets.filter(t => t.id !== currentActionId);
    }

    return { disabledActionIds, formLinkTargets };
  }, [orderedActionItems, entryActionId, referencedActionIdsBySource, linkTargets]);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 200, tolerance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

  const listContainerRef = useRef<HTMLDivElement>(null);
  const prevHighlightRef = useRef<HTMLDivElement | null>(null);
  const [scrollTargetKey, setScrollTargetKey] = useAtom(actionScrollTargetItemKeyAtom);

  useEffect(() => {
    if (!scrollTargetKey) {
      return;
    }

    setScrollTargetKey(null);

    if (prevHighlightRef.current) {
      prevHighlightRef.current.classList.remove("action-item-highlight");
      prevHighlightRef.current = null;
    }

    if (openItemKey !== scrollTargetKey) {
      handleToggleItem(scrollTargetKey);
    }

    const targetEl = listContainerRef.current?.querySelector<HTMLDivElement>(
      `[data-editor-item-key="${CSS.escape(scrollTargetKey)}"]`,
    );
    if (!targetEl) {
      return;
    }

    prevHighlightRef.current = targetEl;
    targetEl.scrollIntoView({ behavior: "smooth", block: "start" });
    targetEl.classList.add("action-item-highlight");
    const timer = setTimeout(() => {
      targetEl.classList.remove("action-item-highlight");
      if (prevHighlightRef.current === targetEl) {
        prevHighlightRef.current = null;
      }
    }, 1500);

    return () => {
      clearTimeout(timer);
    };
  }, [scrollTargetKey, setScrollTargetKey, openItemKey, handleToggleItem]);

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
              onClick={() => flowDialog.onOpenChange(true)}
              disabled={isFlowLoading}
            >
              플로우
            </Button>
          </div>
        </div>
      </div>

      <div ref={listContainerRef} className="flex flex-col gap-4 px-5 py-5">
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
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
          >
            <SortableContext
              items={orderedActionItems.map(i => i.key)}
              strategy={verticalListSortingStrategy}
            >
              <div className="flex flex-col gap-3">
                {orderedActionItems.map((item, index) => {
                  const fallbackType =
                    item.kind === "existing" ? item.action.type : ActionType.SUBJECTIVE;
                  const itemType = actionTypeByItemKey[item.key] ?? fallbackType;

                  const formKey =
                    item.kind === "existing"
                      ? `${item.key}:${existingFormVersionById[item.action.id] ?? 0}:${draftHydrationVersion}:${isAiCompletionEnabled}`
                      : `${item.key}:${draftHydrationVersion}:${isAiCompletionEnabled}`;

                  const dirtyBaselineValues =
                    item.kind === "existing" ? mapEditInitialValues(item.action) : undefined;

                  return (
                    <SortableActionItem
                      key={item.key}
                      item={item}
                      itemKey={item.key}
                      index={index}
                      isOpen={openItemKey === item.key}
                      isBusy={isBusy}
                      itemType={itemType}
                      formKey={formKey}
                      dirtyBaselineValues={dirtyBaselineValues}
                      formLinkTargets={
                        precomputedByItemKey.formLinkTargets[item.key] ?? EMPTY_LINK_TARGETS
                      }
                      disabledActionIds={
                        precomputedByItemKey.disabledActionIds[item.key] ?? EMPTY_SET
                      }
                      completionOptions={completionOptions}
                      allowCompletionLink={!isAiCompletionEnabled}
                      isAiCompletionEnabled={isAiCompletionEnabled}
                      onFormRef={handleFormRef}
                      onToggle={handleToggleItem}
                      onRemoveDraft={handleRemoveDraft}
                      onDeleteExisting={item.kind === "existing" ? deleteDialog.onOpen : undefined}
                      onActionTypeChange={handleActionTypeChange}
                      onDirtyChange={handleItemDirtyChange}
                      onValidationStateChange={handleItemValidationChange}
                      onRawSnapshotChange={handleItemRawSnapshotChange}
                      onMoveItem={handleMoveItem}
                      isFirst={index === 0}
                      isLast={index === orderedActionItems.length - 1}
                      onCreateLinkedAction={createLinkedAction}
                      onCreateLinkedCompletion={createLinkedCompletion}
                    />
                  );
                })}
              </div>
            </SortableContext>
          </DndContext>
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
        open={flowDialog.isOpen}
        onOpenChange={flowDialog.onOpenChange}
        analysis={flowAnalysis}
        isLoading={isFlowLoading}
        errorMessage={viewState.flowErrorMessage}
      />

      <ActionDeleteConfirmDialog
        target={deleteDialog.target}
        isPending={deleteDialog.isPending}
        onClose={deleteDialog.onClose}
        onConfirm={deleteDialog.onConfirm}
      />
    </div>
  );
}

export const ActionSettingsCard = forwardRef<SectionSaveHandle, ActionSettingsCardProps>(
  ActionSettingsCardComponent,
);
ActionSettingsCard.displayName = "ActionSettingsCard";
