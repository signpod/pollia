"use client";

import { useAtomValue } from "jotai";
import { selectAtom } from "jotai/utils";
import { memo, useCallback, useMemo } from "react";
import { EditorAccordion } from "../../../components/view/EditorAccordion";
import { EditorItemMenuSlot } from "../../../components/view/EditorItemMenuSlot";
import { completionFormSnapshotByItemKeyAtom } from "../atoms/editorCompletionAtoms";
import {
  CompletionForm,
  type CompletionFormHandle,
  type CompletionFormRawSnapshot,
  type CompletionFormValues,
} from "./CompletionForm";
import type { CompletionListItem } from "./completionSettingsCard.types";
import { mapEditInitialValues } from "./completionSettingsCard.utils";

const NOOP = () => {};

interface CompletionItemProps {
  item: CompletionListItem;
  itemKey: string;
  index: number;
  isOpen: boolean;
  isSaving: boolean;
  missionId: string;
  formKey: string;
  scoreRangeLabel?: string;
  onFormRef: (itemKey: string, instance: CompletionFormHandle | null) => void;
  onRegisterDraftForm: (draftKey: string, instance: CompletionFormHandle | null) => void;
  onToggle: (itemKey: string) => void;
  onRemoveDraft: (draftKey: string) => void;
  onRemoveExisting: (completionId: string) => void;
  onDirtyChange: (itemKey: string, isDirty: boolean) => void;
  onValidationStateChange: (itemKey: string, issueCount: number) => void;
  onRawSnapshotChange: (itemKey: string, snapshot: CompletionFormRawSnapshot) => void;
  onDraftTitleChange: (draftKey: string, titleValue: string) => void;
  onDuplicateItem: (itemKey: string) => void;
}

export const CompletionItem = memo(function CompletionItem({
  item,
  itemKey,
  index,
  isOpen,
  isSaving,
  missionId,
  formKey,
  scoreRangeLabel,
  onFormRef,
  onRegisterDraftForm,
  onToggle,
  onRemoveDraft,
  onRemoveExisting,
  onDirtyChange,
  onValidationStateChange,
  onRawSnapshotChange,
  onDraftTitleChange,
  onDuplicateItem,
}: CompletionItemProps) {
  const snapshotAtom = useMemo(
    () => selectAtom(completionFormSnapshotByItemKeyAtom, snapshots => snapshots[itemKey]),
    [itemKey],
  );
  const snapshot = useAtomValue(snapshotAtom);

  const snapshotTitle = snapshot?.title?.trim() ?? "";
  const title =
    item.kind === "existing"
      ? snapshotTitle || item.completion.title
      : snapshotTitle || (item.draft.title.trim() ?? "") || "새 결과 화면";
  const previewImageUrl =
    snapshot?.imageUrl ?? (item.kind === "existing" ? item.completion.imageUrl : null);

  const initialValues: CompletionFormValues | undefined =
    snapshot ?? (item.kind === "existing" ? mapEditInitialValues(item.completion) : undefined);
  const dirtyBaselineValues =
    item.kind === "existing" ? mapEditInitialValues(item.completion) : undefined;

  const existingCompletionId = item.kind === "existing" ? item.completion.id : null;
  const draftKey = item.kind === "draft" ? item.draft.key : null;

  const handleToggle = useCallback(() => onToggle(itemKey), [itemKey, onToggle]);
  const handleDuplicate = useCallback(() => onDuplicateItem(itemKey), [itemKey, onDuplicateItem]);

  const handleDelete = useCallback(() => {
    if (existingCompletionId) {
      onRemoveExisting(existingCompletionId);
    } else if (draftKey) {
      onRemoveDraft(draftKey);
    }
  }, [existingCompletionId, draftKey, onRemoveExisting, onRemoveDraft]);

  const handleFormRefCb = useCallback(
    (instance: CompletionFormHandle | null) => {
      onFormRef(itemKey, instance);
      if (draftKey) {
        onRegisterDraftForm(draftKey, instance);
      }
    },
    [itemKey, draftKey, onFormRef, onRegisterDraftForm],
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
    (snap: CompletionFormRawSnapshot) => onRawSnapshotChange(itemKey, snap),
    [itemKey, onRawSnapshotChange],
  );
  const handleTitleChange = useCallback(
    (titleValue: string) => {
      if (draftKey) onDraftTitleChange(draftKey, titleValue);
    },
    [draftKey, onDraftTitleChange],
  );

  return (
    <div data-editor-item-key={item.key} className="scroll-mt-28">
      <EditorAccordion
        isOpen={isOpen}
        onToggle={handleToggle}
        title={`${index + 1}. ${title}`}
        subtitle={scoreRangeLabel}
        previewImage={
          previewImageUrl ? { src: previewImageUrl, alt: `${title} 미리보기 이미지` } : null
        }
        rightSlot={
          <EditorItemMenuSlot
            onDelete={handleDelete}
            onDuplicate={handleDuplicate}
            deleteDisabled={isSaving}
            duplicateDisabled={isSaving}
          />
        }
      >
        <CompletionForm
          key={formKey}
          ref={handleFormRefCb}
          missionId={missionId}
          itemKey={itemKey}
          initialValues={initialValues}
          dirtyBaselineValues={dirtyBaselineValues}
          isLoading={isSaving}
          onSubmit={NOOP}
          onCancel={NOOP}
          hideTitle
          hideFooter
          onTitleChange={draftKey ? handleTitleChange : undefined}
          onDirtyChange={handleDirty}
          onValidationStateChange={handleValidation}
          onRawSnapshotChange={handleSnapshot}
        />
      </EditorAccordion>
    </div>
  );
});
