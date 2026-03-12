"use client";

import { EditorAccordion } from "@/app/(site)/(main)/editor/components/view/EditorAccordion";
import { EditorDeleteSlot } from "@/app/(site)/(main)/editor/components/view/EditorDeleteSlot";
import { MISSION_COMPLETION_LINK_NAME_MAX_LENGTH } from "@/schemas/mission-completion";
import { ImageSelector, Input } from "@repo/ui/components";

interface CompletionLinkItemProps {
  index: number;
  name: string;
  url: string;
  previewImageUrl: string | undefined;
  isOpen: boolean;
  disabled: boolean;
  isImageUploading: boolean;
  nameError?: string;
  urlError?: string;
  onToggle: () => void;
  onNameChange: (value: string) => void;
  onUrlChange: (value: string) => void;
  onImageSelect: (file: File) => void;
  onImageDelete: () => void;
  onDelete: () => void;
}

export function CompletionLinkItem({
  index,
  name,
  url,
  previewImageUrl,
  isOpen,
  disabled,
  isImageUploading,
  nameError,
  urlError,
  onToggle,
  onNameChange,
  onUrlChange,
  onImageSelect,
  onImageDelete,
  onDelete,
}: CompletionLinkItemProps) {
  return (
    <EditorAccordion
      isOpen={isOpen}
      onToggle={onToggle}
      title={`${index + 1}. ${name || "링크 이름 없음"}`}
      headerHeight="h-[60px]"
      previewImage={
        previewImageUrl ? { src: previewImageUrl, alt: `링크 ${index + 1} 이미지` } : null
      }
      rightSlot={<EditorDeleteSlot onDelete={onDelete} disabled={disabled} ariaLabel="링크 삭제" />}
    >
      <div className="flex flex-col gap-4 p-4">
        <Input
          label="링크 이름"
          required
          placeholder="예: 공식 홈페이지"
          maxLength={MISSION_COMPLETION_LINK_NAME_MAX_LENGTH}
          value={name}
          onChange={e => onNameChange(e.target.value)}
          errorMessage={nameError}
        />

        <Input
          label="URL"
          required
          placeholder="https://example.com"
          value={url}
          onChange={e => onUrlChange(e.target.value)}
          errorMessage={urlError}
        />

        <div className="rounded-lg border border-zinc-200 bg-white px-4 py-3">
          <div className="flex items-center justify-between gap-4">
            <span className="text-sm text-zinc-600">
              {isImageUploading ? "업로드 중..." : "링크 이미지 (선택)"}
            </span>
            <ImageSelector
              size="medium"
              imageUrl={previewImageUrl}
              onImageSelect={onImageSelect}
              onImageDelete={onImageDelete}
              disabled={disabled || isImageUploading}
            />
          </div>
        </div>
      </div>
    </EditorAccordion>
  );
}
