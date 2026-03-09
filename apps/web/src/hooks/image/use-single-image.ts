"use client";

import { useCallback, useMemo, useState } from "react";

import type { UseSingleImageOptions, UseSingleImageReturn } from "./types";
import { useDeleteImage } from "./use-delete-image";
import { useUploadImage } from "./use-upload-image";

export function useSingleImage(options: UseSingleImageOptions = {}): UseSingleImageReturn {
  const { initialUrl, initialFileUploadId, bucket, onUploadSuccess, onUploadError } = options;

  const [isInitialCleared, setIsInitialCleared] = useState(false);

  const deleteImage = useDeleteImage();

  const uploadImage = useUploadImage({
    bucket,
    onUploadSuccess: data => {
      if (initialFileUploadId && !deleteImage.markedId) {
        deleteImage.mark(initialFileUploadId);
      }
      onUploadSuccess?.(data);
    },
    onUploadError,
  });

  const previewUrl = useMemo(() => {
    if (uploadImage.previewUrl) {
      return uploadImage.previewUrl;
    }
    if (!isInitialCleared && initialUrl) {
      return initialUrl;
    }
    return null;
  }, [uploadImage.previewUrl, isInitialCleared, initialUrl]);

  const upload = useCallback(
    (file: File) => {
      if (uploadImage.uploadedData) {
        uploadImage.discard();
      }
      uploadImage.upload(file);
    },
    [uploadImage],
  );

  const discard = useCallback(() => {
    if (uploadImage.uploadedData) {
      uploadImage.discard();
    } else if (!isInitialCleared && initialUrl) {
      if (initialFileUploadId) {
        deleteImage.mark(initialFileUploadId);
      }
      setIsInitialCleared(true);
    }
  }, [uploadImage, deleteImage, initialFileUploadId, isInitialCleared, initialUrl]);

  const markInitialForDeletion = useCallback(() => {
    if (initialFileUploadId) {
      deleteImage.mark(initialFileUploadId);
    }
  }, [deleteImage, initialFileUploadId]);

  const unmarkInitial = useCallback(() => {
    deleteImage.unmark();
  }, [deleteImage]);

  const deleteMarkedInitial = useCallback(() => {
    deleteImage.deleteMarked();
  }, [deleteImage]);

  const reset = useCallback(() => {
    if (uploadImage.uploadedData) {
      uploadImage.discard();
    }
    deleteImage.unmark();
    setIsInitialCleared(false);
  }, [uploadImage, deleteImage]);

  return {
    previewUrl,
    uploadedData: uploadImage.uploadedData,
    isUploading: uploadImage.isUploading,
    upload,
    discard,
    markedInitialId: deleteImage.markedId,
    markInitialForDeletion,
    unmarkInitial,
    deleteMarkedInitial,
    reset,
  };
}
