"use client";

import { FileItem } from "./FileItem";

interface FileInfo {
  fileName: string;
  fileSize: number;
  fileUrl: string;
}

interface FileListProps {
  files: FileInfo[];
  uploadingFileUrl: string | null;
  isUploading: boolean;
  onFileDelete: (fileUrl: string) => void;
  onFileClick?: (fileUrl: string) => void;
}

export function FileList({
  files,
  uploadingFileUrl,
  isUploading,
  onFileDelete,
  onFileClick,
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
            isUploading={isFileUploading}
            onDelete={() => onFileDelete(file.fileUrl)}
            onClick={onFileClick ? () => onFileClick(file.fileUrl) : undefined}
          />
        );
      })}
    </div>
  );
}
