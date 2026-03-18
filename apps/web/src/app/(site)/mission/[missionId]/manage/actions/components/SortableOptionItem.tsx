"use client";

import { EditorAccordion } from "@/app/(site)/(main)/editor/components/view/EditorAccordion";
import { EditorDeleteSlot } from "@/app/(site)/(main)/editor/components/view/EditorDeleteSlot";
import { EditorSortControls } from "@/app/(site)/(main)/editor/components/view/EditorSortControls";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { ImageSelector, Input, LabelText, Textarea, Toggle, Typo } from "@repo/ui/components";
import type { ReactNode } from "react";

interface SortableOptionItemProps {
  optionKey: string;
  index: number;
  title: string;
  description: string | null;
  previewImageUrl: string | undefined;
  isOpen: boolean;
  isFirst: boolean;
  isLast: boolean;
  showDescription: boolean;
  showImage: boolean;
  showDelete: boolean;
  showIsCorrect?: boolean;
  isCorrect?: boolean;
  disabled: boolean;
  isImageUploading: boolean;
  titleMaxLength: number;
  descriptionMaxLength: number;
  onToggle: () => void;
  onTitleChange: (value: string) => void;
  onDescriptionChange: (value: string) => void;
  onIsCorrectChange?: (checked: boolean) => void;
  onImageSelect: (file: File) => void;
  onImageDelete: () => void;
  onDelete: () => void;
  onMoveUp: () => void;
  onMoveDown: () => void;
  branchSlot?: ReactNode;
}

export function SortableOptionItem({
  optionKey,
  index,
  title,
  description,
  previewImageUrl,
  isOpen,
  isFirst,
  isLast,
  showDescription,
  showImage,
  showDelete,
  showIsCorrect,
  isCorrect,
  disabled,
  isImageUploading,
  titleMaxLength,
  descriptionMaxLength,
  onToggle,
  onTitleChange,
  onDescriptionChange,
  onIsCorrectChange,
  onImageSelect,
  onImageDelete,
  onDelete,
  onMoveUp,
  onMoveDown,
  branchSlot,
}: SortableOptionItemProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: optionKey,
    disabled,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div ref={setNodeRef} style={style}>
      <EditorAccordion
        isOpen={isOpen}
        onToggle={onToggle}
        title={`${index + 1}. ${title || "제목 없음"}`}
        headerHeight="h-[70px]"
        leftSlot={
          <EditorSortControls
            onMoveUp={onMoveUp}
            onMoveDown={onMoveDown}
            isFirst={isFirst}
            isLast={isLast}
            disabled={disabled}
            attributes={attributes}
            listeners={listeners}
          />
        }
        rightSlot={
          showDelete ? (
            <EditorDeleteSlot onDelete={onDelete} disabled={disabled} ariaLabel="항목 삭제" />
          ) : undefined
        }
      >
        <div className="flex flex-col gap-4 p-4">
          <Input
            label="제목"
            required
            placeholder="항목 제목"
            maxLength={titleMaxLength}
            value={title}
            onChange={e => onTitleChange(e.target.value)}
          />

          {showDescription && (
            <Textarea
              label="설명"
              placeholder="항목 설명 (선택)"
              maxLength={descriptionMaxLength}
              rows={2}
              value={description ?? ""}
              onChange={e => onDescriptionChange(e.target.value)}
            />
          )}

          {showIsCorrect && (
            <div className="flex items-center justify-between">
              <LabelText required={false}>정답</LabelText>
              <Toggle
                checked={isCorrect ?? false}
                onCheckedChange={val => onIsCorrectChange?.(val)}
              />
            </div>
          )}

          {showImage && (
            <div className="rounded-lg border border-zinc-200 bg-white px-4 py-4">
              <div className="flex items-center justify-between gap-4">
                <div className="flex flex-col gap-1">
                  <Typo.Body size="medium" className="font-semibold text-zinc-800">
                    항목 이미지
                  </Typo.Body>
                  <Typo.Body size="small" className="text-zinc-500">
                    {isImageUploading
                      ? "업로드 중..."
                      : "항목에 노출할 이미지를 설정합니다. (선택)"}
                  </Typo.Body>
                </div>
                <ImageSelector
                  size="medium"
                  imageUrl={previewImageUrl}
                  onImageSelect={onImageSelect}
                  onImageDelete={onImageDelete}
                  disabled={disabled || isImageUploading}
                />
              </div>
            </div>
          )}

          {branchSlot}
        </div>
      </EditorAccordion>
    </div>
  );
}
