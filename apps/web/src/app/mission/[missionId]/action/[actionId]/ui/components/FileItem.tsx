"use client";

import { cn } from "@/lib/utils";
import { formatFileSize } from "@/lib/utils";
import { Typo } from "@repo/ui/components";
import { FileIcon, Loader2Icon, XIcon } from "lucide-react";

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

  return (
    <div
      className={cn(
        "flex items-center gap-3 p-3 border border-zinc-200 rounded-sm bg-white",
        isUploading && "opacity-50",
        !isUploading && onClick && "cursor-pointer hover:bg-zinc-50 transition-colors",
      )}
      onClick={handleClick}
    >
      <div className="flex items-center justify-center size-10 bg-light rounded-sm flex-shrink-0">
        <FileIcon className="size-5 text-info" />
      </div>

      <div className="flex-1 min-w-0">
        <Typo.Body size="medium" className="text-zinc-900 truncate">
          {fileName}
        </Typo.Body>
        <Typo.Body size="small" className="text-zinc-500">
          {formatFileSize(fileSize)}
        </Typo.Body>
      </div>

      {isUploading ? (
        <Loader2Icon className="size-5 text-info animate-spin flex-shrink-0" />
      ) : (
        <button
          type="button"
          onClick={handleDeleteClick}
          className="flex items-center justify-center size-8 rounded-sm hover:bg-zinc-100 transition-colors flex-shrink-0"
        >
          <XIcon className="size-4 text-zinc-500" />
        </button>
      )}
    </div>
  );
}

