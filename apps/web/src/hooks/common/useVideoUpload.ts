"use client";

import { confirmFile, deleteFile, getUploadUrl } from "@/actions/common/files";
import type { StorageBucket } from "@/constants/buckets";
import { ConfirmFileRequest, DeleteFileRequest, UploadFileRequest } from "@/types/dto/file";
import { ActionType } from "@prisma/client";
import { useMutation } from "@tanstack/react-query";
import { useState } from "react";

export interface VideoUploadProgress {
  loaded: number;
  total: number;
  percentage: number;
}

export interface UploadedVideo {
  publicUrl: string;
  path: string;
  file: File;
  fileUploadId: string;
  isTemporary: boolean;
}

export interface UseVideoUploadOptions {
  bucket?: StorageBucket;
  onSuccess?: (result: UploadedVideo) => void;
  onError?: (error: Error) => void;
  onProgress?: (progress: VideoUploadProgress) => void;
}

export function useVideoUpload(options: UseVideoUploadOptions = {}) {
  const [uploadProgress, setUploadProgress] = useState<VideoUploadProgress | null>(null);

  const uploadMutation = useMutation({
    mutationFn: async (file: File): Promise<UploadedVideo> => {
      try {
        const uploadRequest: UploadFileRequest = {
          fileName: file.name,
          fileType: file.type,
          fileSize: file.size,
          bucket: options.bucket,
          actionType: ActionType.VIDEO,
        };

        const { data } = await getUploadUrl(uploadRequest);
        const { uploadUrl, publicUrl, path, fileUploadId } = data;

        await uploadFileToStorage(file, uploadUrl, progress => {
          setUploadProgress(progress);
          options.onProgress?.(progress);
        });

        const result: UploadedVideo = {
          publicUrl,
          path,
          file,
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
      if (process.env.NODE_ENV === "development") {
        console.log("✅ 동영상 업로드 성공:", data);
      }
      options.onSuccess?.(data);
    },
    onError: error => {
      if (process.env.NODE_ENV === "development") {
        console.error("❌ 동영상 업로드 실패:", error);
      }
      options.onError?.(error as Error);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (request: DeleteFileRequest) => deleteFile(request),
    onSuccess: () => {
      if (process.env.NODE_ENV === "development") {
        console.log("✅ 동영상 삭제 성공");
      }
    },
    onError: error => {
      if (process.env.NODE_ENV === "development") {
        console.error("❌ 동영상 삭제 실패:", error);
      }
    },
  });

  const confirmMutation = useMutation({
    mutationFn: (request: ConfirmFileRequest) => confirmFile(request),
    onSuccess: () => {
      if (process.env.NODE_ENV === "development") {
        console.log("✅ 파일 확정 성공");
      }
    },
    onError: error => {
      if (process.env.NODE_ENV === "development") {
        console.error("❌ 파일 확정 실패:", error);
      }
    },
  });

  return {
    upload: uploadMutation.mutate,
    uploadAsync: uploadMutation.mutateAsync,
    isUploading: uploadMutation.isPending,
    uploadProgress,
    uploadError: uploadMutation.error,

    deleteVideo: deleteMutation.mutate,
    deleteVideoAsync: deleteMutation.mutateAsync,
    isDeleting: deleteMutation.isPending,
    deleteError: deleteMutation.error,

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
  onProgress?: (progress: VideoUploadProgress) => void,
): Promise<void> {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();

    xhr.upload.addEventListener("progress", event => {
      if (event.lengthComputable && onProgress) {
        const progress: VideoUploadProgress = {
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
