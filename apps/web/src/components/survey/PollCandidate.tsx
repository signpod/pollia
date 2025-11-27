"use client";

import { Button, ImageSelector, Input, Typo } from "@repo/ui/components";
import { EllipsisVertical } from "lucide-react";

export interface PollCandidateProps {
  imageUrl?: string;
  name?: string;
  link?: string;
  onImageSelect?: (file: File) => void;
  onImageDelete?: () => void;
  onNameChange?: (name: string) => void;
  onOptionsClick?: () => void;
  placeholder?: string;
}

export default function PollCandidate({
  imageUrl,
  name = "",
  link,
  onImageSelect,
  onImageDelete,
  onNameChange,
  onOptionsClick,
  placeholder = "후보자명을 입력해주세요",
}: PollCandidateProps) {
  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onNameChange?.(e.target.value);
  };

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center gap-3">
        {/* 이미지 선택기 */}
        <ImageSelector
          size="medium"
          imageUrl={imageUrl}
          onImageSelect={onImageSelect}
          onImageDelete={onImageDelete}
        />

        {/* 후보자명 입력 */}
        <Input
          value={name}
          onChange={handleNameChange}
          placeholder={placeholder}
          containerClassName="flex-1"
        />

        {/* 옵션 버튼 */}
        <Button
          variant="ghost"
          onClick={onOptionsClick}
          className="size-6 p-0 hover:bg-zinc-100"
          aria-label="옵션 메뉴"
        >
          <EllipsisVertical className="size-6 text-zinc-400" />
        </Button>
      </div>

      {/* 링크 표시 (link가 있을 때만) */}
      {link !== undefined && link && (
        <div className="rounded-sm bg-zinc-50 px-4 py-2">
          <Typo.Body size="small">{link}</Typo.Body>
        </div>
      )}
    </div>
  );
}
