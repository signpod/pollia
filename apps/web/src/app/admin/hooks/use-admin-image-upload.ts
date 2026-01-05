"use client";

import { deleteFileById, deleteFileByPath, getUploadUrl } from "@/actions/common/files";
import { STORAGE_BUCKETS, type StorageBucket } from "@/constants/buckets";
import type { DeleteFileByIdRequest, DeleteFileRequest, UploadFileRequest } from "@/types/dto/file";
import { ActionType } from "@prisma/client";
import { useMutation } from "@tanstack/react-query";
import { useCallback, useEffect, useRef, useState } from "react";

export interface UploadedImageData {
  publicUrl: string;
  fileUploadId: string;
  path: string;
}

export interface UseAdminSingleImageOptions {
  bucket?: StorageBucket;
  initialUrl?: string;
  initialFileUploadId?: string;
  onUploadSuccess?: (data: UploadedImageData) => void;
  onUploadError?: (error: Error) => void;
}

export function useAdminSingleImage(options: UseAdminSingleImageOptions = {}) {
  const [previewUrl, setPreviewUrl] = useState<string | null>(options.initialUrl || null);
  const [uploadedData, setUploadedData] = useState<UploadedImageData | null>(
    options.initialFileUploadId && options.initialUrl
      ? {
          publicUrl: options.initialUrl,
          fileUploadId: options.initialFileUploadId,
          path: "",
        }
      : null,
  );
  const previewUrlRef = useRef(previewUrl);
  previewUrlRef.current = previewUrl;

  const uploadMutation = useMutation({
    mutationFn: async (file: File): Promise<UploadedImageData> => {
      const uploadRequest: UploadFileRequest = {
        fileName: file.name,
        fileType: file.type,
        fileSize: file.size,
        bucket: options.bucket || STORAGE_BUCKETS.MISSION_IMAGES,
        actionType: ActionType.IMAGE,
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

  const deleteByIdMutation = useMutation({
    mutationFn: (request: DeleteFileByIdRequest) => deleteFileById(request),
  });

  const deleteByPathMutation = useMutation({
    mutationFn: (request: DeleteFileRequest) => deleteFileByPath(request),
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
      if (uploadedData.fileUploadId) {
        deleteByIdMutation.mutate({
          fileUploadId: uploadedData.fileUploadId,
        });
      } else if (uploadedData.path) {
        deleteByPathMutation.mutate({
          path: uploadedData.path,
        });
      }
    }
    if (previewUrlRef.current?.startsWith("blob:")) {
      URL.revokeObjectURL(previewUrlRef.current);
    }
    setPreviewUrl(null);
    setUploadedData(null);
  }, [uploadedData, deleteByIdMutation, deleteByPathMutation]);

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
  bucket?: StorageBucket;
  initialImages?: Array<{
    id: string;
    url: string;
    fileUploadId?: string;
  }>;
  onUploadSuccess?: (id: string, data: UploadedImageData) => void;
  onUploadError?: (id: string, error: Error) => void;
}

function createInitialPreviews(
  initialImages?: UseAdminMultipleImagesOptions["initialImages"],
): Map<string, string> {
  const map = new Map<string, string>();
  if (!initialImages) return map;

  for (const image of initialImages) {
    map.set(image.id, image.url);
  }
  return map;
}

function createInitialUploadedData(
  initialImages?: UseAdminMultipleImagesOptions["initialImages"],
): Map<string, UploadedImageData> {
  const map = new Map<string, UploadedImageData>();
  if (!initialImages) return map;

  for (const image of initialImages) {
    if (!image.fileUploadId) continue;

    map.set(image.id, {
      publicUrl: image.url,
      fileUploadId: image.fileUploadId,
      path: "",
    });
  }
  return map;
}

export function useAdminMultipleImages(options: UseAdminMultipleImagesOptions = {}) {
  const [previews, setPreviews] = useState(() => createInitialPreviews(options.initialImages));
  const [uploadedDataMap, setUploadedDataMap] = useState(() =>
    createInitialUploadedData(options.initialImages),
  );
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
      const uploadRequest: UploadFileRequest = {
        fileName: file.name,
        fileType: file.type,
        fileSize: file.size,
        bucket: options.bucket || STORAGE_BUCKETS.MISSION_IMAGES,
        actionType: ActionType.IMAGE,
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

  const deleteByIdMutation = useMutation({
    mutationFn: (request: DeleteFileByIdRequest) => deleteFileById(request),
  });

  const deleteByPathMutation = useMutation({
    mutationFn: (request: DeleteFileRequest) => deleteFileByPath(request),
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
        if (data.fileUploadId) {
          deleteByIdMutation.mutate({
            fileUploadId: data.fileUploadId,
          });
        } else if (data.path) {
          deleteByPathMutation.mutate({
            path: data.path,
          });
        }
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
    [uploadedDataMap, deleteByIdMutation, deleteByPathMutation],
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
