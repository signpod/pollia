"use client";

import { cn, formatFileSize } from "@/lib/utils";
import PdfIcon from "@public/svgs/pdf-icon.svg";
import { ButtonV2, Typo } from "@repo/ui/components";
import { Loader2Icon } from "lucide-react";

interface FileItemProps {
  fileName: string;
  fileSize: number;
  isUploading: boolean;
  onDelete: () => void;
  onClick?: () => void;
}

export function FileItem({ fileName, fileSize, isUploading, onDelete, onClick }: FileItemProps) {
  const handleClick = (e: React.MouseEvent) => {
    if (isUploading) return;
    if (onClick) {
      e.stopPropagation();
      onClick();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (isUploading) return;
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      e.stopPropagation();
      if (onClick) {
        onClick();
      }
    }
  };

  const handleDeleteClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onDelete();
  };

  return (
    <div
      className={cn(
        "flex flex-col items-center gap-3 p-4 border border-zinc-200 rounded-sm bg-white",
      )}
    >
      <div className="flex items-center gap-3 w-full ">
        <PdfIcon className="size-8 text-info shrink-0" />
        <div className="flex flex-col gap-1 flex-1 min-w-0">
          <div className="flex gap-1 flex-1 min-w-0">
            <Typo.SubTitle size="large" className="text-zinc-900 truncate">
              {fileName.split(".")[0]}
            </Typo.SubTitle>
            <Typo.SubTitle size="large">.pdf</Typo.SubTitle>
          </div>
          <Typo.Body size="medium" className="text-disabled">
            [{formatFileSize(fileSize)}]
          </Typo.Body>
        </div>
      </div>

      {isUploading ? (
        <div className="flex items-center justify-center w-full gap-1">
          <Loader2Icon className="size-4 text-icon-sub animate-spin shrink-0" />
          <Typo.Body size="medium" className="text-info">
            업로드 중...
          </Typo.Body>
        </div>
      ) : (
        <div className="flex items-center gap-2 w-full">
          <ButtonV2 variant="tertiary" className="flex-1" onClick={handleClick}>
            <div className="flex items-center justify-center w-full">
              <Typo.ButtonText size="medium">미리보기</Typo.ButtonText>
            </div>
          </ButtonV2>
          <ButtonV2 variant="tertiary" className="flex-1" onClick={handleDeleteClick}>
            <div className="flex items-center justify-center w-full">
              <Typo.ButtonText size="medium">삭제</Typo.ButtonText>
            </div>
          </ButtonV2>
        </div>
        // <button
        //   type="button"
        //   onClick={handleDeleteClick}
        //   className="flex items-center justify-center size-8 rounded-sm hover:bg-zinc-100 transition-colors shrink-0"
        // >
        //   <XIcon className="size-4 text-zinc-500" />
        // </button>
      )}
    </div>
  );
}
