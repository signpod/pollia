"use client";

import { toast } from "@/components/common/Toast";
import { STORAGE_BUCKETS } from "@/constants/buckets";
import { FILE_SIZE_LABELS, MAX_FILE_SIZE } from "@/constants/fileUpload";
import { useVideoUpload } from "@/hooks/common/useVideoUpload";
import { ActionType } from "@prisma/client";
import { useCallback, useRef } from "react";
import { MediaUploadArea } from "./components/MediaUploadArea";

interface VideoUploadProps {
  onUploadChange?: (
    hasUploadedVideo: boolean,
    videoUrls: string[],
    fileUploadIds: string[],
    filePaths: string[],
    file?: File,
  ) => void;
  onUploadingChange?: (isUploading: boolean) => void;
  onProgressChange?: (progress: number) => void;
  currentCount?: number;
  maxCount?: number;
}

export function VideoUpload({
  onUploadChange,
  onUploadingChange,
  onProgressChange,
  currentCount = 0,
  maxCount = 1,
}: VideoUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  const { upload, isUploading } = useVideoUpload({
    bucket: STORAGE_BUCKETS.ACTION_ANSWER_VIDEOS,
    onSuccess: result => {
      onUploadingChange?.(false);
      onProgressChange?.(0);
      onUploadChange?.(true, [result.publicUrl], [result.fileUploadId], [result.path], result.file);
    },
    onError: error => {
      onUploadingChange?.(false);
      onProgressChange?.(0);
      toast.warning(error?.message || "파일 업로드에 실패했어요.\n다시 시도해주세요.");
      onUploadChange?.(false, [], [], []);
    },
    onProgress: progress => {
      onProgressChange?.(progress.percentage);
    },
  });

  const handleFileSelect = useCallback(() => {
    inputRef.current?.click();
  }, []);

  const handleFileChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) {
        return;
      }

      if (!file.type.startsWith("video/")) {
        toast.warning("동영상 파일만 업로드할 수 있습니다");
        if (inputRef.current) {
          inputRef.current.value = "";
        }
        return;
      }

      const maxSize = MAX_FILE_SIZE[ActionType.VIDEO];
      if (file.size > maxSize) {
        toast.warning(`파일 크기는 ${FILE_SIZE_LABELS[ActionType.VIDEO]}를 초과할 수 없습니다`);
        if (inputRef.current) {
          inputRef.current.value = "";
        }
        return;
      }

      onUploadingChange?.(true);
      upload(file);

      if (inputRef.current) {
        inputRef.current.value = "";
      }
    },
    [upload, onUploadingChange],
  );

  return (
    <MediaUploadArea
      inputRef={inputRef}
      isUploading={isUploading}
      onFileSelect={handleFileSelect}
      onFileChange={handleFileChange}
      accept="video/*"
      icon="video"
      variant="counter"
      currentCount={currentCount}
      maxCount={maxCount}
    />
  );
}
