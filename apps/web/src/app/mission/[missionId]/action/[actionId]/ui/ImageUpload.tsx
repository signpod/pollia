"use client";

import { toast } from "@/components/common/Toast";
import { STORAGE_BUCKETS } from "@/constants/buckets";
import { MAX_IMAGE_UPLOAD_COUNT } from "@/constants/image";
import { useMultipleImageUpload } from "@/hooks/common/useImageUpload";
import { useCallback, useEffect, useRef, useState } from "react";
import { ImageUploadArea } from "./components/ImageUploadArea";

interface ImageUploadProps {
  currentImageCount?: number;
  onUploadChange?: (
    hasUploadedImage: boolean,
    imageUrls: string[],
    fileUploadIds: string[],
    filePaths: string[],
  ) => void;
  onUploadingChange?: (isUploading: boolean) => void;
}

export function ImageUpload({
  currentImageCount = 0,
  onUploadChange,
  onUploadingChange,
}: ImageUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  const [uploadedResults, setUploadedResults] = useState<
    Array<{ publicUrl: string; fileUploadId: string; path: string }>
  >([]);

  const { uploadMultiple, isUploading, uploadError } = useMultipleImageUpload({
    bucket: STORAGE_BUCKETS.ACTION_ANSWER_IMAGES,
    onSuccess: result => {
      setUploadedResults(prev => {
        const newResults = [
          ...prev,
          { publicUrl: result.publicUrl, fileUploadId: result.fileUploadId, path: result.path },
        ];
        return newResults;
      });
    },
    onError: () => {
      onUploadingChange?.(false);
      toast.warning(uploadError?.message || "파일 업로드에 실패했어요.\n다시 시도해주세요.");
      setUploadedResults([]);
    },
  });

  useEffect(() => {
    if (uploadedResults.length > 0 && !isUploading) {
      const imageUrls = uploadedResults.map(r => r.publicUrl);
      const fileUploadIds = uploadedResults.map(r => r.fileUploadId);
      const filePaths = uploadedResults.map(r => r.path);
      onUploadChange?.(true, imageUrls, fileUploadIds, filePaths);
      setUploadedResults([]);
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
      if (files.length > remainingSlots) {
        toast.warning(`최대 ${MAX_IMAGE_UPLOAD_COUNT}개까지 업로드할 수 있어요.`);
        if (inputRef.current) {
          inputRef.current.value = "";
        }
        return;
      }

      onUploadingChange?.(true);
      try {
        await uploadMultiple(files);
        onUploadingChange?.(false);
      } catch {
        onUploadingChange?.(false);
        setUploadedResults([]);
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
    />
  );
}
