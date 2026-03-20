"use client";

import {
  ActionForm,
  type ActionFormHandle,
  type ActionFormRawSnapshot,
  type ActionFormValues,
} from "@/app/(site)/mission/[missionId]/manage/actions/components/ActionForm";
import { mapEditInitialValues } from "@/app/(site)/mission/[missionId]/manage/actions/logic";
import { ACTION_TYPE_LABELS } from "@/constants/action";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import type { ActionType } from "@prisma/client";
import { useAtomValue } from "jotai";
import { selectAtom } from "jotai/utils";
import { memo, useCallback, useMemo } from "react";
import { EditorAccordion } from "../../../components/view/EditorAccordion";
import { EditorItemMenuSlot } from "../../../components/view/EditorItemMenuSlot";
import { EditorSortControls } from "../../../components/view/EditorSortControls";
import { actionFormSnapshotByItemKeyAtom } from "../atoms/editorActionAtoms";
import type { ActionListItem } from "./actionSettingsCard.types";

const NOOP = () => {};

interface SortableActionItemProps {
  item: ActionListItem;
  itemKey: string;
  index: number;
  isOpen: boolean;
  isBusy: boolean;
  itemType: ActionType;
  formKey: string;
  dirtyBaselineValues?: ActionFormValues;
  formLinkTargets: Array<{ id: string; title: string; order: number }>;
  disabledActionIds: Set<string>;
  completionOptions: Array<{ id: string; title: string }>;
  allowCompletionLink: boolean;
  isAiCompletionEnabled: boolean;
  onFormRef: (itemKey: string, instance: ActionFormHandle | null) => void;
  onToggle: (itemKey: string) => void;
  onRemoveDraft: (draftKey: string) => void;
  onRemoveExisting?: (actionId: string) => void;
  onActionTypeChange: (itemKey: string, type: ActionType) => void;
  onDirtyChange: (itemKey: string, isDirty: boolean) => void;
  onValidationStateChange: (itemKey: string, issueCount: number) => void;
  onRawSnapshotChange: (itemKey: string, snapshot: ActionFormRawSnapshot) => void;
  onMoveItem: (itemKey: string, direction: "up" | "down") => void;
  onDuplicateItem: (itemKey: string) => void;
  isFirst: boolean;
  isLast: boolean;
  onCreateLinkedAction?: () => string;
  onCreateLinkedCompletion?: () => string;
}

export const SortableActionItem = memo(function SortableActionItem({
  item,
  itemKey,
  index,
  isOpen,
  isBusy,
  itemType,
  formKey,
  dirtyBaselineValues,
  formLinkTargets,
  disabledActionIds,
  completionOptions,
  allowCompletionLink,
  isAiCompletionEnabled,
  onFormRef,
  onToggle,
  onRemoveDraft,
  onRemoveExisting,
  onActionTypeChange,
  onDirtyChange,
  onValidationStateChange,
  onRawSnapshotChange,
  onMoveItem,
  onDuplicateItem,
  isFirst,
  isLast,
  onCreateLinkedAction,
  onCreateLinkedCompletion,
}: SortableActionItemProps) {
  const snapshotAtom = useMemo(
    () => selectAtom(actionFormSnapshotByItemKeyAtom, snapshots => snapshots[itemKey]),
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
      onRemoveExisting?.(existingAction.id);
    } else if (item.kind === "draft") {
      onRemoveDraft(item.draft.key);
    }
  }, [existingAction, item, onRemoveDraft, onRemoveExisting]);

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
  const handleDuplicate = useCallback(() => onDuplicateItem(itemKey), [itemKey, onDuplicateItem]);

  return (
    <div ref={setNodeRef} style={style} data-editor-item-key={item.key} className="scroll-mt-28">
      <EditorAccordion
        isOpen={isOpen}
        onToggle={handleToggle}
        title={`${index + 1}. ${itemTitle}`}
        subtitle={ACTION_TYPE_LABELS[itemType]}
        badge={
          index === 0 ? (
            <span className="shrink-0 rounded-full bg-zinc-200 px-2 py-0.5 text-xs font-medium text-zinc-700">
              시작 질문
            </span>
          ) : null
        }
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
          <EditorItemMenuSlot
            onDelete={handleDelete}
            onDuplicate={handleDuplicate}
            deleteDisabled={item.kind !== "draft" && isBusy}
            duplicateDisabled={isBusy}
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
          allActions={formLinkTargets}
          disabledActionIds={disabledActionIds}
          completionOptions={completionOptions}
          allowCompletionLink={allowCompletionLink}
          isLoading={isBusy}
          onSubmit={NOOP}
          onCancel={NOOP}
          hideTitle
          hideFooter
          enableTypeSelect
          enforceExclusiveNextLink
          wordingMode="question"
          onActionTypeChange={handleTypeChange}
          onDirtyChange={handleDirty}
          onValidationStateChange={handleValidation}
          onRawSnapshotChange={handleSnapshot}
          onCreateLinkedAction={onCreateLinkedAction}
          onCreateLinkedCompletion={isAiCompletionEnabled ? undefined : onCreateLinkedCompletion}
        />
      </EditorAccordion>
    </div>
  );
});
