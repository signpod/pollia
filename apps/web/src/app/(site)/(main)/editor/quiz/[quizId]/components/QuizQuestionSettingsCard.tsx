"use client";

import type { ActionFormHandle } from "@/app/(site)/mission/[missionId]/manage/actions/components/ActionForm";
import { mapEditInitialValues } from "@/app/(site)/mission/[missionId]/manage/actions/logic";
import { ActionType } from "@/types/domain/action";
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
import { Typo } from "@repo/ui/components";
import { useAtom } from "jotai";
import { AlertCircle, Plus } from "lucide-react";
import {
  type ForwardedRef,
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useRef,
} from "react";
import { ActionDeleteConfirmDialog } from "../../../missions/[missionId]/components/ActionDeleteConfirmDialog";
import type { SectionSaveHandle } from "../../../missions/[missionId]/components/editor-save.types";
import { quizActionScrollTargetItemKeyAtom } from "../atoms/quizActionAtoms";
import { QuizSortableActionItem } from "./QuizSortableActionItem";
import {
  type QuizQuestionSettingsCardProps,
  useQuizQuestionSettingsCard,
} from "./useQuizQuestionSettingsCard";

function QuizQuestionSettingsCardComponent(
  props: QuizQuestionSettingsCardProps,
  ref: ForwardedRef<SectionSaveHandle>,
) {
  const { viewState, listState, formRefs, deleteDialog, handlers, saveHandle } =
    useQuizQuestionSettingsCard(props);

  useImperativeHandle(ref, () => saveHandle, [saveHandle]);

  const { isBusy, isActionsLoading, hasValidationIssues, validationIssueCount } = viewState;

  const {
    orderedActionItems,
    openItemKey,
    actionTypeByItemKey,
    existingFormVersionById,
    draftHydrationVersion,
  } = listState;

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

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 200, tolerance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

  const listContainerRef = useRef<HTMLDivElement>(null);
  const prevHighlightRef = useRef<HTMLDivElement | null>(null);
  const highlightTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [scrollTargetKey, setScrollTargetKey] = useAtom(quizActionScrollTargetItemKeyAtom);

  const openItemKeyRef = useRef(openItemKey);
  openItemKeyRef.current = openItemKey;
  const handleToggleItemRef = useRef(handleToggleItem);
  handleToggleItemRef.current = handleToggleItem;

  useEffect(() => {
    if (!scrollTargetKey) return;

    setScrollTargetKey(null);

    if (highlightTimerRef.current) {
      clearTimeout(highlightTimerRef.current);
      highlightTimerRef.current = null;
    }

    if (prevHighlightRef.current) {
      prevHighlightRef.current.classList.remove("action-item-highlight");
      prevHighlightRef.current = null;
    }

    if (openItemKeyRef.current !== scrollTargetKey) {
      handleToggleItemRef.current(scrollTargetKey);
    }

    const targetEl = listContainerRef.current?.querySelector<HTMLDivElement>(
      `[data-editor-item-key="${CSS.escape(scrollTargetKey)}"]`,
    );
    if (!targetEl) return;

    prevHighlightRef.current = targetEl;
    targetEl.scrollIntoView({ behavior: "smooth", block: "start" });
    targetEl.classList.add("action-item-highlight");
    highlightTimerRef.current = setTimeout(() => {
      targetEl.classList.remove("action-item-highlight");
      if (prevHighlightRef.current === targetEl) {
        prevHighlightRef.current = null;
      }
      highlightTimerRef.current = null;
    }, 1500);
  }, [scrollTargetKey, setScrollTargetKey]);

  return (
    <div className="border border-zinc-200 bg-white">
      <div className="border-b border-zinc-100 px-5 py-4">
        <div className="flex items-start justify-between gap-4">
          <div>
            <Typo.SubTitle>질문 목록 수정</Typo.SubTitle>
            <Typo.Body size="medium" className="mt-1 text-zinc-500">
              퀴즈 질문을 추가하고 수정합니다.
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

      <div ref={listContainerRef} className="flex flex-col gap-4 px-5 py-5">
        {isActionsLoading ? (
          <div className="rounded-xl border border-zinc-200 bg-zinc-50 px-4 py-10 text-center">
            <Typo.Body size="medium" className="text-zinc-500">
              로딩 중...
            </Typo.Body>
          </div>
        ) : orderedActionItems.length === 0 ? (
          <div className="rounded-xl border border-zinc-200 bg-zinc-50 px-4 py-10 text-center">
            <Typo.SubTitle>아직 질문이 없습니다</Typo.SubTitle>
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
                    item.kind === "existing" ? item.action.type : ActionType.MULTIPLE_CHOICE;
                  const itemType = actionTypeByItemKey[item.key] ?? fallbackType;

                  const formKey =
                    item.kind === "existing"
                      ? `${item.key}:${existingFormVersionById[item.action.id] ?? 0}:${draftHydrationVersion}`
                      : `${item.key}:${draftHydrationVersion}`;

                  const dirtyBaselineValues =
                    item.kind === "existing" ? mapEditInitialValues(item.action) : undefined;

                  return (
                    <QuizSortableActionItem
                      key={item.key}
                      item={item}
                      itemKey={item.key}
                      index={index}
                      isOpen={openItemKey === item.key}
                      isBusy={isBusy}
                      itemType={itemType}
                      formKey={formKey}
                      dirtyBaselineValues={dirtyBaselineValues}
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

      <ActionDeleteConfirmDialog
        target={deleteDialog.target}
        isPending={deleteDialog.isPending}
        onClose={deleteDialog.onClose}
        onConfirm={deleteDialog.onConfirm}
      />
    </div>
  );
}

export const QuizQuestionSettingsCard = forwardRef<
  SectionSaveHandle,
  QuizQuestionSettingsCardProps
>(QuizQuestionSettingsCardComponent);
QuizQuestionSettingsCard.displayName = "QuizQuestionSettingsCard";
