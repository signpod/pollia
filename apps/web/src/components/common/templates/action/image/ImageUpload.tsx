"use client";

import { toast } from "@/components/common/Toast";
import { STORAGE_BUCKETS } from "@/constants/buckets";
import { getImageFileSizeLabel, getImageMaxFileSize } from "@/constants/fileUpload";
import { MAX_IMAGE_UPLOAD_COUNT } from "@/constants/image";
import { useMultipleImageUpload } from "@/hooks/common/useImageUpload";
import { useCallback, useEffect, useRef, useState } from "react";
import { ImageUploadArea } from "./ImageUploadArea";

interface UploadStartInfo {
  file: File;
  tempUrl: string;
}

interface ImageUploadProps {
  currentImageCount?: number;
  onUploadChange?: (
    hasUploadedImage: boolean,
    imageUrls: string[],
    fileUploadIds: string[],
    filePaths: string[],
    tempUrls?: string[],
  ) => void;
  onUploadingChange?: (isUploading: boolean) => void;
  onProgressChange?: (progress: number) => void;
  onUploadStart?: (files: UploadStartInfo[]) => void;
}

export function ImageUpload({
  currentImageCount = 0,
  onUploadChange,
  onUploadingChange,
  onProgressChange,
  onUploadStart,
}: ImageUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  const [uploadedResults, setUploadedResults] = useState<
    Array<{ publicUrl: string; fileUploadId: string; path: string; tempUrl: string }>
  >([]);
  const [pendingTempUrls, setPendingTempUrls] = useState<string[]>([]);

  const { uploadMultiple, isUploading } = useMultipleImageUpload({
    bucket: STORAGE_BUCKETS.ACTION_ANSWER_IMAGES,
    onSuccess: result => {
      setUploadedResults(prev => {
        const currentIndex = prev.length;
        const tempUrl = pendingTempUrls[currentIndex] ?? "";
        const newResults = [
          ...prev,
          {
            publicUrl: result.publicUrl,
            fileUploadId: result.fileUploadId,
            path: result.path,
            tempUrl,
          },
        ];
        return newResults;
      });
    },
    onError: error => {
      onUploadingChange?.(false);
      onProgressChange?.(0);
      toast.warning(error.message || "파일 업로드에 실패했어요.\n다시 시도해주세요.");
      setUploadedResults([]);
      setPendingTempUrls([]);
    },
    onProgress: progress => {
      onProgressChange?.(progress.percentage);
    },
  });

  useEffect(() => {
    if (uploadedResults.length > 0 && !isUploading) {
      const imageUrls = uploadedResults.map(r => r.publicUrl);
      const fileUploadIds = uploadedResults.map(r => r.fileUploadId);
      const filePaths = uploadedResults.map(r => r.path);
      const tempUrls = uploadedResults.map(r => r.tempUrl);
      onUploadChange?.(true, imageUrls, fileUploadIds, filePaths, tempUrls);
      setUploadedResults([]);
      setPendingTempUrls([]);
    }
  }, [uploadedResults, isUploading, onUploadChange]);

  useEffect(() => {
    onUploadingChange?.(isUploading);
  }, [isUploading, onUploadingChange]);

  const handleFileSelect = useCallback(() => {
    inputRef.current?.click();
  }, []);

  const handleFileChange = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      const files = Array.from(e.target.files || []);
      if (files.length === 0) {
        return;
      }

      const remainingSlots = MAX_IMAGE_UPLOAD_COUNT - currentImageCount;
      if (remainingSlots <= 0) {
        toast.warning(`최대 ${MAX_IMAGE_UPLOAD_COUNT}개까지 업로드할 수 있어요`);
        if (inputRef.current) {
          inputRef.current.value = "";
        }
        return;
      }

      const oversizedFile = files.find(
        file => file.size > getImageMaxFileSize(file.name, file.type),
      );
      if (oversizedFile) {
        const label = getImageFileSizeLabel(oversizedFile.name, oversizedFile.type);
        toast.warning(`파일 크기는 ${label}를 초과할 수 없습니다`);
        if (inputRef.current) {
          inputRef.current.value = "";
        }
        return;
      }

      const filesToProcess = files.slice(0, remainingSlots);
      if (files.length > remainingSlots) {
        toast.warning(`최대 ${MAX_IMAGE_UPLOAD_COUNT}개까지 업로드할 수 있어요`);
      }

      const uploadStartInfos: UploadStartInfo[] = filesToProcess.map(file => ({
        file,
        tempUrl: URL.createObjectURL(file),
      }));
      const tempUrls = uploadStartInfos.map(info => info.tempUrl);
      setPendingTempUrls(tempUrls);
      onUploadStart?.(uploadStartInfos);

      onUploadingChange?.(true);
      try {
        await uploadMultiple(filesToProcess);
        onUploadingChange?.(false);
      } catch {
        onUploadingChange?.(false);
        setUploadedResults([]);
        setPendingTempUrls([]);
      }

      if (inputRef.current) {
        inputRef.current.value = "";
      }
    },
    [uploadMultiple, onUploadingChange, currentImageCount],
  );

  return (
    <ImageUploadArea
      inputRef={inputRef}
      isUploading={isUploading}
      onFileSelect={handleFileSelect}
      onFileChange={handleFileChange}
      currentCount={currentImageCount}
      maxCount={MAX_IMAGE_UPLOAD_COUNT}
    />
  );
}
