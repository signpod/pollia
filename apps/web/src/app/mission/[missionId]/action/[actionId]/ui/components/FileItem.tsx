"use client";

import { formatFileSize } from "@/lib/utils";
import PdfIcon from "@public/svgs/pdf-color-icon.svg";
import { Typo } from "@repo/ui/components";
import { Loader2Icon, XIcon } from "lucide-react";

interface FileItemProps {
  fileName: string;
  fileSize: number;
  isUploading: boolean;
  onDelete: () => void;
  onClick?: () => void;
}

export function FileItem({ fileName, fileSize, isUploading, onDelete }: FileItemProps) {
  const handleDeleteClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onDelete();
  };

  return (
    <div className="flex items-center gap-2 p-4 pr-3 border border-zinc-200 rounded-2xl bg-white">
      <div className="flex items-center justify-center p-3 aspect-square bg-light rounded-full shrink-0">
        <PdfIcon className="size-7" />
      </div>
      <div className="flex flex-col gap-3 flex-1 min-w-0">
        <Typo.Body size="large" className="text-zinc-900 truncate">
          {fileName}
        </Typo.Body>
        <Typo.Body size="small" className="text-disabled">
          PDF · {formatFileSize(fileSize)}
        </Typo.Body>
      </div>
      <div className="h-full self-start">
        {isUploading ? (
          <Loader2Icon className="size-6 text-zinc-400 animate-spin shrink-0" />
        ) : (
          <button
            type="button"
            onClick={handleDeleteClick}
            className="flex justify-center size-6 shrink-0"
          >
            <XIcon className="size-6 icon-default" />
          </button>
        )}
      </div>
    </div>
  );
}
