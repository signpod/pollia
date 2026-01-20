"use client";

import { formatFileSize } from "@/lib/utils";
import PdfIcon from "@public/svgs/pdf-color-icon.svg";
import { Typo } from "@repo/ui/components";
import { XIcon } from "lucide-react";

interface CircularProgressProps {
  progress: number;
  size?: number;
  strokeWidth?: number;
}

function CircularProgress({ progress, size = 24, strokeWidth = 3 }: CircularProgressProps) {
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const offset = circumference - (progress / 100) * circumference;

  return (
    <svg
      width={size}
      height={size}
      className="transform -rotate-90"
      role="img"
      aria-label={`업로드 진행률 ${progress}%`}
    >
      <circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        fill="none"
        stroke="#f4f4f5"
        strokeWidth={strokeWidth}
      />
      <circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        fill="none"
        stroke="#27272a"
        strokeWidth={strokeWidth}
        strokeDasharray={circumference}
        strokeDashoffset={offset}
        strokeLinecap="round"
        className="transition-all duration-200 ease-out"
      />
    </svg>
  );
}

interface FileItemProps {
  fileName: string;
  fileSize: number;
  isUploading: boolean;
  uploadProgress?: number;
  onDelete: () => void;
  onClick?: () => void;
}

export function FileItem({
  fileName,
  fileSize,
  isUploading,
  uploadProgress = 0,
  onDelete,
}: FileItemProps) {
  const handleDeleteClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onDelete();
  };

  return (
    <div className="flex items-center gap-2 p-4 border border-zinc-200 rounded-2xl bg-white">
      <div className="flex items-center justify-center p-3 aspect-square bg-light rounded-full shrink-0">
        <PdfIcon className="size-7" />
      </div>
      <div className="flex flex-col gap-1 flex-1 min-w-0">
        <Typo.Body size="large" className="text-zinc-900 truncate">
          {fileName.split(".")[0]}
        </Typo.Body>
        <Typo.Body size="small" className="text-disabled">
          PDF · {formatFileSize(fileSize)}
        </Typo.Body>
      </div>
      <div className="h-full self-start">
        {isUploading ? (
          <CircularProgress progress={uploadProgress} />
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
