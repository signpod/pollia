"use client";

import type { TempFileInfo } from "@/types/domain/file";
import { FileItem } from "./FileItem";

interface FileListProps {
  files: TempFileInfo[];
  uploadingFileUrl: string | null;
  isUploading: boolean;
  uploadProgress?: number;
  onFileDelete: (fileUrl: string) => void;
}

export function FileList({
  files,
  uploadingFileUrl,
  isUploading,
  uploadProgress,
  onFileDelete,
}: FileListProps) {
  if (files.length === 0) {
    return null;
  }

  return (
    <div className="flex flex-col gap-2 w-full">
      {files.map(file => {
        const isFileUploading = isUploading && uploadingFileUrl === file.fileUrl;
        return (
          <FileItem
            key={file.fileUrl}
            fileName={file.fileName}
            fileSize={file.fileSize}
            fileUrl={file.fileUrl}
            isUploading={isFileUploading}
            uploadProgress={isFileUploading ? uploadProgress : undefined}
            onDelete={() => onFileDelete(file.fileUrl)}
          />
        );
      })}
    </div>
  );
}
