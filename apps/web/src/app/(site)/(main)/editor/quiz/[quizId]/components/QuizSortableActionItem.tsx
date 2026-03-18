"use client";

import {
  ActionForm,
  type ActionFormHandle,
  type ActionFormRawSnapshot,
  type ActionFormValues,
} from "@/app/(site)/mission/[missionId]/manage/actions/components/ActionForm";
import { mapEditInitialValues } from "@/app/(site)/mission/[missionId]/manage/actions/logic";
import { ACTION_TYPE_LABELS } from "@/constants/action";
import type { ActionDetail } from "@/types/dto";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import type { ActionType } from "@prisma/client";
import { useAtomValue } from "jotai";
import { selectAtom } from "jotai/utils";
import { memo, useCallback, useMemo } from "react";
import { EditorAccordion } from "../../../components/view/EditorAccordion";
import { EditorDeleteSlot } from "../../../components/view/EditorDeleteSlot";
import { EditorSortControls } from "../../../components/view/EditorSortControls";
import type { ActionListItem } from "../../../missions/[missionId]/components/actionSettingsCard.types";
import { quizActionFormSnapshotByItemKeyAtom } from "../atoms/quizActionAtoms";

const NOOP = () => {};
const EMPTY_LINK_TARGETS: Array<{ id: string; title: string; order: number }> = [];
const EMPTY_SET = new Set<string>();
const EMPTY_COMPLETION_OPTIONS: Array<{ id: string; title: string }> = [];

interface QuizSortableActionItemProps {
  item: ActionListItem;
  itemKey: string;
  index: number;
  isOpen: boolean;
  isBusy: boolean;
  itemType: ActionType;
  formKey: string;
  dirtyBaselineValues?: ActionFormValues;
  onFormRef: (itemKey: string, instance: ActionFormHandle | null) => void;
  onToggle: (itemKey: string) => void;
  onRemoveDraft: (draftKey: string) => void;
  onDeleteExisting?: (action: ActionDetail) => void;
  onActionTypeChange: (itemKey: string, type: ActionType) => void;
  onDirtyChange: (itemKey: string, isDirty: boolean) => void;
  onValidationStateChange: (itemKey: string, issueCount: number) => void;
  onRawSnapshotChange: (itemKey: string, snapshot: ActionFormRawSnapshot) => void;
  onMoveItem: (itemKey: string, direction: "up" | "down") => void;
  isFirst: boolean;
  isLast: boolean;
}

export const QuizSortableActionItem = memo(function QuizSortableActionItem({
  item,
  itemKey,
  index,
  isOpen,
  isBusy,
  itemType,
  formKey,
  dirtyBaselineValues,
  onFormRef,
  onToggle,
  onRemoveDraft,
  onDeleteExisting,
  onActionTypeChange,
  onDirtyChange,
  onValidationStateChange,
  onRawSnapshotChange,
  onMoveItem,
  isFirst,
  isLast,
}: QuizSortableActionItemProps) {
  const snapshotAtom = useMemo(
    () => selectAtom(quizActionFormSnapshotByItemKeyAtom, snapshots => snapshots[itemKey]),
    [itemKey],
  );
  const snapshot = useAtomValue(snapshotAtom);

  const snapshotTitle = snapshot?.values?.title?.trim();
  const itemTitle =
    item.kind === "existing"
      ? snapshotTitle || item.action.title
      : snapshotTitle || `${ACTION_TYPE_LABELS[itemType]} 질문`;
  const previewImageUrl =
    snapshot?.values?.imageUrl ?? (item.kind === "existing" ? item.action.imageUrl : null);
  const initialValues: ActionFormValues | undefined =
    item.kind === "existing"
      ? (snapshot?.values ?? mapEditInitialValues(item.action))
      : snapshot?.values;

  const existingAction = item.kind === "existing" ? item.action : null;

  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: item.key,
    disabled: isBusy,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  const handleDelete = useCallback(() => {
    if (existingAction) {
      onDeleteExisting?.(existingAction);
    } else {
      onRemoveDraft(itemKey);
    }
  }, [existingAction, itemKey, onRemoveDraft, onDeleteExisting]);

  const handleFormRefCb = useCallback(
    (instance: ActionFormHandle | null) => onFormRef(itemKey, instance),
    [itemKey, onFormRef],
  );
  const handleToggle = useCallback(() => onToggle(itemKey), [itemKey, onToggle]);
  const handleTypeChange = useCallback(
    (type: ActionType) => onActionTypeChange(itemKey, type),
    [itemKey, onActionTypeChange],
  );
  const handleDirty = useCallback(
    (isDirty: boolean) => onDirtyChange(itemKey, isDirty),
    [itemKey, onDirtyChange],
  );
  const handleValidation = useCallback(
    (issueCount: number) => onValidationStateChange(itemKey, issueCount),
    [itemKey, onValidationStateChange],
  );
  const handleSnapshot = useCallback(
    (snap: ActionFormRawSnapshot) => onRawSnapshotChange(itemKey, snap),
    [itemKey, onRawSnapshotChange],
  );
  const handleMoveUp = useCallback(() => onMoveItem(itemKey, "up"), [itemKey, onMoveItem]);
  const handleMoveDown = useCallback(() => onMoveItem(itemKey, "down"), [itemKey, onMoveItem]);

  return (
    <div ref={setNodeRef} style={style} data-editor-item-key={item.key} className="scroll-mt-28">
      <EditorAccordion
        isOpen={isOpen}
        onToggle={handleToggle}
        title={`${index + 1}. ${itemTitle}`}
        subtitle={ACTION_TYPE_LABELS[itemType]}
        badge={null}
        previewImage={
          previewImageUrl ? { src: previewImageUrl, alt: `${itemTitle} 미리보기 이미지` } : null
        }
        leftSlot={
          <EditorSortControls
            onMoveUp={handleMoveUp}
            onMoveDown={handleMoveDown}
            isFirst={isFirst}
            isLast={isLast}
            disabled={isBusy}
            attributes={attributes}
            listeners={listeners}
          />
        }
        rightSlot={
          <EditorDeleteSlot
            onDelete={handleDelete}
            disabled={item.kind !== "draft" && isBusy}
            ariaLabel="질문 삭제"
          />
        }
      >
        <ActionForm
          key={formKey}
          ref={handleFormRefCb}
          actionType={itemType}
          editingAction={item.kind === "existing" ? item.action : undefined}
          initialValues={initialValues}
          dirtyBaselineValues={dirtyBaselineValues}
          allActions={EMPTY_LINK_TARGETS}
          disabledActionIds={EMPTY_SET}
          completionOptions={EMPTY_COMPLETION_OPTIONS}
          allowCompletionLink={false}
          isLoading={isBusy}
          onSubmit={NOOP}
          onCancel={NOOP}
          hideTitle
          hideFooter
          enableTypeSelect
          wordingMode="question"
          isQuizMode
          onActionTypeChange={handleTypeChange}
          onDirtyChange={handleDirty}
          onValidationStateChange={handleValidation}
          onRawSnapshotChange={handleSnapshot}
        />
      </EditorAccordion>
    </div>
  );
});
