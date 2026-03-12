"use client";

import {
  ActionForm,
  type ActionFormHandle,
  type ActionFormRawSnapshot,
  type ActionFormValues,
} from "@/app/(site)/mission/[missionId]/manage/actions/components/ActionForm";
import { ACTION_TYPE_LABELS } from "@/constants/action";
import type { ActionDetail } from "@/types/dto";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import type { ActionType } from "@prisma/client";
import { EditorAccordion } from "../../../components/view/EditorAccordion";
import { EditorDeleteSlot } from "../../../components/view/EditorDeleteSlot";
import { EditorSortControls } from "../../../components/view/EditorSortControls";
import type { ActionListItem } from "./actionSettingsCard.types";

const NOOP = () => {};

interface SortableActionItemProps {
  item: ActionListItem;
  index: number;
  isOpen: boolean;
  isBusy: boolean;
  itemType: ActionType;
  itemTitle: string;
  previewImageUrl: string | null;
  formRef: (instance: ActionFormHandle | null) => void;
  formKey: string;
  initialValues: ActionFormValues | undefined;
  dirtyBaselineValues?: ActionFormValues;
  formLinkTargets: Array<{ id: string; title: string; order: number }>;
  disabledActionIds: Set<string>;
  completionOptions: Array<{ id: string; title: string }>;
  allowCompletionLink: boolean;
  isAiCompletionEnabled: boolean;
  onToggle: () => void;
  onRemoveDraft?: () => void;
  onDeleteExisting?: (action: ActionDetail) => void;
  onActionTypeChange: (type: ActionType) => void;
  onDirtyChange: (isDirty: boolean) => void;
  onValidationStateChange: (issueCount: number) => void;
  onRawSnapshotChange: (snapshot: ActionFormRawSnapshot) => void;
  onMoveUp: () => void;
  onMoveDown: () => void;
  isFirst: boolean;
  isLast: boolean;
  onCreateLinkedAction?: () => string;
  onCreateLinkedCompletion?: () => string;
}

export function SortableActionItem({
  item,
  index,
  isOpen,
  isBusy,
  itemType,
  itemTitle,
  previewImageUrl,
  formRef,
  formKey,
  initialValues,
  dirtyBaselineValues,
  formLinkTargets,
  disabledActionIds,
  completionOptions,
  allowCompletionLink,
  isAiCompletionEnabled,
  onToggle,
  onRemoveDraft,
  onDeleteExisting,
  onActionTypeChange,
  onDirtyChange,
  onValidationStateChange,
  onRawSnapshotChange,
  onMoveUp,
  onMoveDown,
  isFirst,
  isLast,
  onCreateLinkedAction,
  onCreateLinkedCompletion,
}: SortableActionItemProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: item.key,
    disabled: isBusy,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  const handleDelete = () => {
    if (item.kind === "draft") {
      onRemoveDraft?.();
    } else {
      onDeleteExisting?.(item.action);
    }
  };

  return (
    <div ref={setNodeRef} style={style} data-editor-item-key={item.key} className="scroll-mt-28">
      <EditorAccordion
        isOpen={isOpen}
        onToggle={onToggle}
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
            onMoveUp={onMoveUp}
            onMoveDown={onMoveDown}
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
          ref={formRef}
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
          onActionTypeChange={onActionTypeChange}
          onDirtyChange={onDirtyChange}
          onValidationStateChange={onValidationStateChange}
          onRawSnapshotChange={onRawSnapshotChange}
          onCreateLinkedAction={onCreateLinkedAction}
          onCreateLinkedCompletion={isAiCompletionEnabled ? undefined : onCreateLinkedCompletion}
        />
      </EditorAccordion>
    </div>
  );
}
