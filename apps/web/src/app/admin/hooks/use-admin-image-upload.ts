"use client";

import { deleteImage, getUploadUrl } from "@/actions/common/image";
import { ADMIN_STORAGE_BUCKETS } from "@/app/admin/constants/storage";
import type { DeleteImageRequest, UploadImageRequest } from "@/types/dto/image";
import { useMutation } from "@tanstack/react-query";
import { useCallback, useEffect, useRef, useState } from "react";

export interface UploadedImageData {
  publicUrl: string;
  fileUploadId: string;
  path: string;
}

export interface UseAdminSingleImageOptions {
  bucket?: string;
  initialUrl?: string;
  onUploadSuccess?: (data: UploadedImageData) => void;
  onUploadError?: (error: Error) => void;
}

export function useAdminSingleImage(options: UseAdminSingleImageOptions = {}) {
  const [previewUrl, setPreviewUrl] = useState<string | null>(options.initialUrl || null);
  const [uploadedData, setUploadedData] = useState<UploadedImageData | null>(null);
  const previewUrlRef = useRef(previewUrl);
  previewUrlRef.current = previewUrl;

  const uploadMutation = useMutation({
    mutationFn: async (file: File): Promise<UploadedImageData> => {
      const uploadRequest: UploadImageRequest = {
        fileName: file.name,
        fileType: file.type,
        fileSize: file.size,
        bucket: options.bucket || ADMIN_STORAGE_BUCKETS.MISSION_IMAGES,
      };

      const { data } = await getUploadUrl(uploadRequest);
      const { uploadUrl, publicUrl, path, fileUploadId } = data;

      await uploadFileToStorage(file, uploadUrl);

      return { publicUrl, fileUploadId, path };
    },
    onSuccess: data => {
      setUploadedData(data);
      if (previewUrlRef.current?.startsWith("blob:")) {
        URL.revokeObjectURL(previewUrlRef.current);
      }
      setPreviewUrl(data.publicUrl);
      options.onUploadSuccess?.(data);
    },
    onError: error => {
      options.onUploadError?.(error as Error);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (request: DeleteImageRequest) => deleteImage(request),
  });

  useEffect(() => {
    return () => {
      if (previewUrlRef.current?.startsWith("blob:")) {
        URL.revokeObjectURL(previewUrlRef.current);
      }
    };
  }, []);

  const selectImage = useCallback(
    (file: File) => {
      if (previewUrlRef.current?.startsWith("blob:")) {
        URL.revokeObjectURL(previewUrlRef.current);
      }
      const blobUrl = URL.createObjectURL(file);
      setPreviewUrl(blobUrl);
      uploadMutation.mutate(file);
    },
    [uploadMutation],
  );

  const clearImage = useCallback(() => {
    if (uploadedData) {
      deleteMutation.mutate({
        path: uploadedData.path,
        bucket: options.bucket || ADMIN_STORAGE_BUCKETS.MISSION_IMAGES,
      });
    }
    if (previewUrlRef.current?.startsWith("blob:")) {
      URL.revokeObjectURL(previewUrlRef.current);
    }
    setPreviewUrl(null);
    setUploadedData(null);
  }, [uploadedData, deleteMutation, options.bucket]);

  return {
    previewUrl,
    uploadedData,
    isUploading: uploadMutation.isPending,
    selectImage,
    clearImage,
  };
}

export type UseAdminSingleImageReturn = ReturnType<typeof useAdminSingleImage>;

export interface UseAdminMultipleImagesOptions {
  bucket?: string;
  onUploadSuccess?: (id: string, data: UploadedImageData) => void;
  onUploadError?: (id: string, error: Error) => void;
}

export function useAdminMultipleImages(options: UseAdminMultipleImagesOptions = {}) {
  const [previews, setPreviews] = useState<Map<string, string>>(new Map());
  const [uploadedDataMap, setUploadedDataMap] = useState<Map<string, UploadedImageData>>(new Map());
  const [uploadingIds, setUploadingIds] = useState<Set<string>>(new Set());
  const previewsRef = useRef(previews);
  previewsRef.current = previews;

  const uploadMutation = useMutation({
    mutationFn: async ({
      id,
      file,
    }: {
      id: string;
      file: File;
    }): Promise<{ id: string; data: UploadedImageData }> => {
      const uploadRequest: UploadImageRequest = {
        fileName: file.name,
        fileType: file.type,
        fileSize: file.size,
        bucket: options.bucket || ADMIN_STORAGE_BUCKETS.MISSION_IMAGES,
      };

      const { data } = await getUploadUrl(uploadRequest);
      const { uploadUrl, publicUrl, path, fileUploadId } = data;

      await uploadFileToStorage(file, uploadUrl);

      return { id, data: { publicUrl, fileUploadId, path } };
    },
    onMutate: ({ id }) => {
      setUploadingIds(prev => new Set(prev).add(id));
    },
    onSuccess: ({ id, data }) => {
      setUploadingIds(prev => {
        const newSet = new Set(prev);
        newSet.delete(id);
        return newSet;
      });
      setUploadedDataMap(prev => new Map(prev).set(id, data));

      setPreviews(prev => {
        const newMap = new Map(prev);
        const oldUrl = newMap.get(id);
        if (oldUrl?.startsWith("blob:")) {
          URL.revokeObjectURL(oldUrl);
        }
        newMap.set(id, data.publicUrl);
        return newMap;
      });

      options.onUploadSuccess?.(id, data);
    },
    onError: (error, { id }) => {
      setUploadingIds(prev => {
        const newSet = new Set(prev);
        newSet.delete(id);
        return newSet;
      });
      options.onUploadError?.(id, error as Error);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (request: DeleteImageRequest) => deleteImage(request),
  });

  useEffect(() => {
    return () => {
      for (const url of previewsRef.current.values()) {
        if (url.startsWith("blob:")) {
          URL.revokeObjectURL(url);
        }
      }
    };
  }, []);

  const selectImage = useCallback(
    (id: string, file: File) => {
      setPreviews(prev => {
        const newMap = new Map(prev);
        const oldUrl = newMap.get(id);
        if (oldUrl?.startsWith("blob:")) {
          URL.revokeObjectURL(oldUrl);
        }
        newMap.set(id, URL.createObjectURL(file));
        return newMap;
      });
      uploadMutation.mutate({ id, file });
    },
    [uploadMutation],
  );

  const clearImage = useCallback(
    (id: string) => {
      const data = uploadedDataMap.get(id);
      if (data) {
        deleteMutation.mutate({
          path: data.path,
          bucket: options.bucket || ADMIN_STORAGE_BUCKETS.MISSION_IMAGES,
        });
      }

      setPreviews(prev => {
        const newMap = new Map(prev);
        const url = newMap.get(id);
        if (url?.startsWith("blob:")) {
          URL.revokeObjectURL(url);
        }
        newMap.delete(id);
        return newMap;
      });

      setUploadedDataMap(prev => {
        const newMap = new Map(prev);
        newMap.delete(id);
        return newMap;
      });
    },
    [uploadedDataMap, deleteMutation, options.bucket],
  );

  const getPreviewUrl = useCallback(
    (id: string, fallback?: string) => previews.get(id) || fallback,
    [previews],
  );

  const getUploadedData = useCallback((id: string) => uploadedDataMap.get(id), [uploadedDataMap]);

  return {
    selectImage,
    clearImage,
    getPreviewUrl,
    getUploadedData,
    isAnyUploading: uploadingIds.size > 0,
  };
}

export type UseAdminMultipleImagesReturn = ReturnType<typeof useAdminMultipleImages>;

async function uploadFileToStorage(file: File, uploadUrl: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();

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
