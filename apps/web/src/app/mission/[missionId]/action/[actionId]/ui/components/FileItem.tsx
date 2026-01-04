"use client";

import { cn } from "@/lib/utils";
import { formatFileSize } from "@/lib/utils";
import PdfIcon from "@public/svgs/pdf-icon.svg";
import { ButtonV2, Typo } from "@repo/ui/components";
import { Loader2Icon } from "lucide-react";

const FILE_ITEM_LABELS = {
  uploading: "업로드 중...",
  preview: "미리보기",
  delete: "삭제",
} as const;

const getFileNameWithoutExtension = (fileName: string): string => {
  const lastDotIndex = fileName.lastIndexOf(".");
  return lastDotIndex === -1 ? fileName : fileName.slice(0, lastDotIndex);
};

const getFileExtension = (fileName: string): string => {
  const lastDotIndex = fileName.lastIndexOf(".");
  return lastDotIndex === -1 ? "" : fileName.slice(lastDotIndex);
};

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

  const handleDeleteClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onDelete();
  };

  const fileNameWithoutExt = getFileNameWithoutExtension(fileName);
  const fileExtension = getFileExtension(fileName);

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
              {fileNameWithoutExt}
            </Typo.SubTitle>
            {fileExtension && <Typo.SubTitle size="large">{fileExtension}</Typo.SubTitle>}
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
            {FILE_ITEM_LABELS.uploading}
          </Typo.Body>
        </div>
      ) : (
        <div className="flex items-center gap-2 w-full">
          <ButtonV2 variant="tertiary" className="flex-1" onClick={handleClick}>
            <div className="flex items-center justify-center w-full">
              <Typo.ButtonText size="medium">{FILE_ITEM_LABELS.preview}</Typo.ButtonText>
            </div>
          </ButtonV2>
          <ButtonV2 variant="tertiary" className="flex-1" onClick={handleDeleteClick}>
            <div className="flex items-center justify-center w-full">
              <Typo.ButtonText size="medium">{FILE_ITEM_LABELS.delete}</Typo.ButtonText>
            </div>
          </ButtonV2>
        </div>
      )}
    </div>
  );
}
