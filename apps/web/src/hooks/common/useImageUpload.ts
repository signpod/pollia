"use client";

import { confirmFile, deleteImage, getUploadUrl } from "@/actions/common/images";
import type { StorageBucket } from "@/constants/buckets";
import { ConfirmFileRequest, DeleteImageRequest, UploadImageRequest } from "@/types/dto/image";
import { ActionType } from "@prisma/client";
import { useMutation } from "@tanstack/react-query";
import { useState } from "react";

export interface ImageUploadProgress {
  loaded: number;
  total: number;
  percentage: number;
}

export interface UploadedImage {
  publicUrl: string;
  path: string;
  file: File;
  fileUploadId: string;
  isTemporary: boolean;
}

export interface UseImageUploadOptions {
  bucket?: StorageBucket;
  onSuccess?: (result: UploadedImage) => void;
  onError?: (error: Error) => void;
  onProgress?: (progress: ImageUploadProgress) => void;
}

export function useImageUpload(options: UseImageUploadOptions = {}) {
  const [uploadProgress, setUploadProgress] = useState<ImageUploadProgress | null>(null);

  const uploadMutation = useMutation({
    mutationFn: async (file: File): Promise<UploadedImage> => {
      try {
        // TODO:이미지 전처리 로직 추가 필요
        // const processedFile = await preprocessImage(file);
        const processedFile = file;

        const uploadRequest: UploadImageRequest = {
          fileName: processedFile.name,
          fileType: processedFile.type,
          fileSize: processedFile.size,
          bucket: options.bucket,
          actionType: ActionType.IMAGE,
        };

        const { data } = await getUploadUrl(uploadRequest);
        const { uploadUrl, publicUrl, path, fileUploadId } = data;

        await uploadFileToStorage(processedFile, uploadUrl, progress => {
          setUploadProgress(progress);
          options.onProgress?.(progress);
        });

        const result: UploadedImage = {
          publicUrl,
          path,
          file: processedFile,
          fileUploadId,
          isTemporary: true,
        };

        setUploadProgress(null);
        return result;
      } catch (error) {
        setUploadProgress(null);
        throw error;
      }
    },
    onSuccess: data => {
      console.log("✅ 이미지 업로드 성공:", data);
      options.onSuccess?.(data);
    },
    onError: error => {
      console.error("❌ 이미지 업로드 실패:", error);
      options.onError?.(error as Error);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (request: DeleteImageRequest) => deleteImage(request),
    onSuccess: () => {
      console.log("✅ 이미지 삭제 성공");
    },
    onError: error => {
      console.error("❌ 이미지 삭제 실패:", error);
    },
  });

  const confirmMutation = useMutation({
    mutationFn: (request: ConfirmFileRequest) => confirmFile(request),
    onSuccess: () => {
      console.log("✅ 파일 확정 성공");
    },
    onError: error => {
      console.error("❌ 파일 확정 실패:", error);
    },
  });

  return {
    // 업로드
    upload: uploadMutation.mutate,
    uploadAsync: uploadMutation.mutateAsync,
    isUploading: uploadMutation.isPending,
    uploadProgress,
    uploadError: uploadMutation.error,

    // 삭제
    deleteImage: deleteMutation.mutate,
    deleteImageAsync: deleteMutation.mutateAsync,
    isDeleting: deleteMutation.isPending,
    deleteError: deleteMutation.error,

    // 확정 처리
    confirmFile: confirmMutation.mutate,
    confirmFileAsync: confirmMutation.mutateAsync,
    isConfirming: confirmMutation.isPending,
    confirmError: confirmMutation.error,

    reset: () => {
      uploadMutation.reset();
      deleteMutation.reset();
      confirmMutation.reset();
      setUploadProgress(null);
    },
  };
}

async function uploadFileToStorage(
  file: File,
  uploadUrl: string,
  onProgress?: (progress: ImageUploadProgress) => void,
): Promise<void> {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();

    xhr.upload.addEventListener("progress", event => {
      if (event.lengthComputable && onProgress) {
        const progress: ImageUploadProgress = {
          loaded: event.loaded,
          total: event.total,
          percentage: Math.round((event.loaded / event.total) * 100),
        };
        onProgress(progress);
      }
    });

    xhr.addEventListener("load", () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        resolve();
      } else {
        reject(new Error(`업로드 실패: ${xhr.status} ${xhr.statusText}`));
      }
    });

    xhr.addEventListener("error", () => {
      reject(new Error("네트워크 오류로 인해 업로드에 실패했습니다."));
    });

    xhr.addEventListener("abort", () => {
      reject(new Error("업로드가 중단되었습니다."));
    });

    xhr.open("PUT", uploadUrl);
    xhr.setRequestHeader("Content-Type", file.type);
    xhr.send(file);
  });
}

export function useMultipleImageUpload(options: UseImageUploadOptions = {}) {
  const singleUpload = useImageUpload(options);
  const [uploadedImages, setUploadedImages] = useState<UploadedImage[]>([]);

  const uploadMultiple = async (files: File[]): Promise<UploadedImage[]> => {
    const results: UploadedImage[] = [];

    for (const file of files) {
      try {
        const result = await singleUpload.uploadAsync(file);
        results.push(result);
        setUploadedImages(prev => [...prev, result]);
      } catch (error) {
        console.error(`파일 ${file.name} 업로드 실패:`, error);
        throw error;
      }
    }

    return results;
  };

  const removeImage = (index: number) => {
    const imageToRemove = uploadedImages[index];
    if (imageToRemove) {
      singleUpload.deleteImage({
        path: imageToRemove.path,
      });
      setUploadedImages(prev => prev.filter((_, i) => i !== index));
    }
  };

  const confirmImages = async () => {
    const confirmPromises = uploadedImages
      .filter(img => img.isTemporary)
      .map(img =>
        singleUpload.confirmFileAsync({
          fileUploadId: img.fileUploadId,
        }),
      );

    await Promise.all(confirmPromises);

    setUploadedImages(prev => prev.map(img => ({ ...img, isTemporary: false })));
  };

  return {
    ...singleUpload,
    uploadMultiple,
    uploadedImages,
    removeImage,
    confirmImages,
    clearAll: () => setUploadedImages([]),
  };
}
