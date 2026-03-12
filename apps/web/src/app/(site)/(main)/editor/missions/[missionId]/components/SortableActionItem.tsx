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
import { Typo } from "@repo/ui/components";
import { ChevronDown, GripVertical, Trash2, X } from "lucide-react";
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

  return (
    <div
      ref={setNodeRef}
      style={style}
      data-editor-item-key={item.key}
      className="scroll-mt-28 overflow-hidden rounded-xl border border-zinc-200 transition-shadow duration-500"
    >
      <div className="flex items-center justify-between bg-zinc-50 px-4 py-3">
        <div
          className="mr-2 flex shrink-0 cursor-grab items-center rounded p-1 text-zinc-500 hover:text-zinc-700 active:cursor-grabbing"
          style={{ touchAction: "none" }}
          {...attributes}
          {...listeners}
        >
          <GripVertical className="size-4" />
        </div>
        <button
          type="button"
          onClick={onToggle}
          className="flex min-w-0 flex-1 items-center justify-between gap-3 text-left"
        >
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <Typo.Body size="medium" className="truncate font-semibold text-zinc-800">
                {index + 1}. {itemTitle}
              </Typo.Body>
              {index === 0 ? (
                <span className="shrink-0 rounded-full bg-zinc-200 px-2 py-0.5 text-xs font-medium text-zinc-700">
                  시작 질문
                </span>
              ) : null}
            </div>
            <Typo.Body size="small" className="mt-1 text-zinc-500">
              {ACTION_TYPE_LABELS[itemType]}
            </Typo.Body>
          </div>
          <div className="flex shrink-0 items-center gap-2">
            {previewImageUrl ? (
              <img
                src={previewImageUrl}
                alt={`${itemTitle} 미리보기 이미지`}
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

        {item.kind === "draft" ? (
          <button
            type="button"
            aria-label="신규 질문 제거"
            onClick={() => onRemoveDraft?.()}
            className="ml-2 rounded p-1 text-zinc-400 transition-colors hover:text-red-500"
          >
            <X className="size-4" />
          </button>
        ) : (
          <button
            type="button"
            aria-label="저장된 질문 삭제"
            onClick={event => {
              event.stopPropagation();
              onDeleteExisting?.(item.action);
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
            key={formKey}
            ref={formRef}
            actionType={itemType}
            editingAction={item.action}
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
        ) : (
          <ActionForm
            key={formKey}
            ref={formRef}
            actionType={itemType}
            initialValues={initialValues}
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
        )}
      </div>
    </div>
  );
}
