"use client";

import {
  type UploadedImageData,
  type UseSingleImageReturn,
  useSingleImage,
} from "@/app/admin/hooks/admin-image";
import { useCallback, useEffect, useRef } from "react";
import { useImageCropper } from "./use-image-cropper";

interface UseImageEditWithCropOptions {
  fileNamePrefix: string;
  initialUrl?: string | null;
  initialFileUploadId?: string | null;
  onBeforeOpen?: () => void;
  onUploadSuccess: (data: UploadedImageData, image: UseSingleImageReturn) => void;
  onUploadError?: (error: Error) => void;
}

export function useImageEditWithCrop({
  fileNamePrefix,
  initialUrl,
  initialFileUploadId,
  onBeforeOpen,
  onUploadSuccess,
  onUploadError,
}: UseImageEditWithCropOptions) {
  const cropper = useImageCropper({ fileNamePrefix });
  const uploadedFileIdRef = useRef<string | null>(null);
  const imageRef = useRef<UseSingleImageReturn | null>(null);

  const image = useSingleImage({
    initialUrl: initialUrl ?? undefined,
    initialFileUploadId: initialFileUploadId ?? undefined,
    onUploadError,
  });

  useEffect(() => {
    imageRef.current = image;
  }, [image]);

  useEffect(() => {
    const uploaded = image.uploadedData;
    if (!uploaded) {
      return;
    }
    if (uploadedFileIdRef.current === uploaded.fileUploadId) {
      return;
    }
    uploadedFileIdRef.current = uploaded.fileUploadId;
    if (imageRef.current) {
      onUploadSuccess(uploaded, imageRef.current);
    }
  }, [image.uploadedData, onUploadSuccess]);

  const openFromFile = useCallback(
    (file: File) => {
      onBeforeOpen?.();
      cropper.openWithFile(file);
    },
    [cropper, onBeforeOpen],
  );

  const openFromExisting = useCallback(
    (imageUrl?: string | null, fileName?: string) => {
      if (!imageUrl) return;
      onBeforeOpen?.();
      cropper.openWithImageUrl(imageUrl, fileName);
    },
    [cropper, onBeforeOpen],
  );

  return {
    cropper,
    image,
    currentImageUrl: image.previewUrl,
    openFromFile,
    openFromExisting,
    handleAddFile: openFromFile,
    handleEditImage: openFromExisting,
  };
}
