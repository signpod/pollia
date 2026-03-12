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
import { ChevronDown, ChevronUp, GripVertical, Trash2 } from "lucide-react";
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

  return (
    <div
      ref={setNodeRef}
      style={style}
      data-editor-item-key={item.key}
      className="scroll-mt-28 overflow-hidden rounded-xl border border-zinc-200 transition-shadow duration-500"
    >
      <div className="flex h-[88px] items-stretch bg-zinc-50">
        <div
          className="flex shrink-0 cursor-grab items-center border-r border-zinc-200 px-3 text-zinc-400 hover:text-zinc-600 active:cursor-grabbing"
          style={{ touchAction: "none" }}
          {...attributes}
          {...listeners}
        >
          <GripVertical className="size-5" />
        </div>

        <div className="flex shrink-0 flex-col border-r border-zinc-200">
          <button
            type="button"
            aria-label="위로 이동"
            onClick={onMoveUp}
            disabled={isFirst || isBusy}
            className="flex flex-1 items-center justify-center border-b border-zinc-200 px-3 text-zinc-400 transition-colors hover:bg-zinc-100 hover:text-zinc-700 disabled:cursor-not-allowed disabled:text-zinc-200 disabled:hover:bg-transparent"
          >
            <ChevronUp className="size-5" />
          </button>
          <button
            type="button"
            aria-label="아래로 이동"
            onClick={onMoveDown}
            disabled={isLast || isBusy}
            className="flex flex-1 items-center justify-center px-3 text-zinc-400 transition-colors hover:bg-zinc-100 hover:text-zinc-700 disabled:cursor-not-allowed disabled:text-zinc-200 disabled:hover:bg-transparent"
          >
            <ChevronDown className="size-5" />
          </button>
        </div>

        <button
          type="button"
          onClick={onToggle}
          className="flex min-w-0 flex-1 items-center justify-between gap-3 px-4 py-3 text-left"
        >
          <div className="min-w-0 overflow-hidden">
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
            <Typo.Body size="small" className="mt-1 truncate text-zinc-500">
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
              className={`size-5 shrink-0 text-zinc-500 transition-transform ${
                isOpen ? "rotate-180" : ""
              }`}
            />
          </div>
        </button>

        <div className="flex shrink-0 items-center border-l border-zinc-200 px-2.5">
          <button
            type="button"
            aria-label="질문 삭제"
            onClick={event => {
              event.stopPropagation();
              if (item.kind === "draft") {
                onRemoveDraft?.();
              } else {
                onDeleteExisting?.(item.action);
              }
            }}
            disabled={item.kind !== "draft" && isBusy}
            className="rounded p-1.5 text-red-500 transition-colors hover:bg-red-50 hover:text-red-600 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <Trash2 className="size-5" />
          </button>
        </div>
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
