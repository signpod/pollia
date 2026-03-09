"use client";

import { deleteFileById, getUploadUrl } from "@/actions/common/files";
import { STORAGE_BUCKETS } from "@/constants/buckets";
import type { DeleteFileByIdRequest, UploadFileRequest } from "@/types/dto/file";
import { ActionType } from "@prisma/client";
import { useMutation } from "@tanstack/react-query";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import type { UploadedImageData, UseMultipleImagesOptions, UseMultipleImagesReturn } from "./types";
import { uploadFileToStorage } from "./upload-file-to-storage";

interface InitialImageInfo {
  id: string;
  url: string;
  fileUploadId?: string;
}

function createInitialPreviews(initialImages?: InitialImageInfo[]): Map<string, string> {
  const map = new Map<string, string>();
  if (!initialImages) return map;
  for (const image of initialImages) {
    map.set(image.id, image.url);
  }
  return map;
}

function createInitialFileUploadIdMap(initialImages?: InitialImageInfo[]): Map<string, string> {
  const map = new Map<string, string>();
  if (!initialImages) return map;
  for (const image of initialImages) {
    if (image.fileUploadId) {
      map.set(image.id, image.fileUploadId);
    }
  }
  return map;
}

export function useMultipleImages(options: UseMultipleImagesOptions = {}): UseMultipleImagesReturn {
  const { bucket, initialImages, onUploadSuccess, onUploadError } = options;

  const [previews, setPreviews] = useState(() => createInitialPreviews(initialImages));
  const [uploadedDataMap, setUploadedDataMap] = useState<Map<string, UploadedImageData>>(new Map());
  const [uploadingIds, setUploadingIds] = useState<Set<string>>(new Set());
  const [markedInitialIds, setMarkedInitialIds] = useState<Set<string>>(new Set());

  const initialFileUploadIdMap = useMemo(
    () => createInitialFileUploadIdMap(initialImages),
    [initialImages],
  );
  const initialPreviewsRef = useRef(createInitialPreviews(initialImages));
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
        bucket: bucket || STORAGE_BUCKETS.MISSION_IMAGES,
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

      onUploadSuccess?.(id, data);
    },
    onError: (error, { id }) => {
      setUploadingIds(prev => {
        const newSet = new Set(prev);
        newSet.delete(id);
        return newSet;
      });

      setPreviews(prev => {
        const newMap = new Map(prev);
        const currentUrl = newMap.get(id);
        if (currentUrl?.startsWith("blob:")) {
          URL.revokeObjectURL(currentUrl);
        }
        const initialUrl = initialPreviewsRef.current.get(id);
        if (initialUrl) {
          newMap.set(id, initialUrl);
        } else {
          newMap.delete(id);
        }
        return newMap;
      });

      onUploadError?.(id, error as Error);
    },
  });

  const deleteByIdMutation = useMutation({
    mutationFn: (request: DeleteFileByIdRequest) => deleteFileById(request),
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

  const upload = useCallback(
    (id: string, file: File) => {
      const existingData = uploadedDataMap.get(id);
      if (existingData?.fileUploadId) {
        deleteByIdMutation.mutate({ fileUploadId: existingData.fileUploadId });
      }

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
    [uploadMutation, uploadedDataMap, deleteByIdMutation],
  );

  const discard = useCallback(
    (id: string) => {
      const uploadedData = uploadedDataMap.get(id);
      if (uploadedData?.fileUploadId) {
        deleteByIdMutation.mutate({ fileUploadId: uploadedData.fileUploadId });
        setUploadedDataMap(prev => {
          const newMap = new Map(prev);
          newMap.delete(id);
          return newMap;
        });
      } else {
        const initialFileUploadId = initialFileUploadIdMap.get(id);
        if (initialFileUploadId) {
          setMarkedInitialIds(prev => new Set(prev).add(initialFileUploadId));
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
    },
    [uploadedDataMap, deleteByIdMutation, initialFileUploadIdMap],
  );

  const getPreviewUrl = useCallback(
    (id: string): string | undefined => previews.get(id),
    [previews],
  );

  const getUploadedData = useCallback(
    (id: string): UploadedImageData | undefined => uploadedDataMap.get(id),
    [uploadedDataMap],
  );

  const isUploading = useCallback((id: string): boolean => uploadingIds.has(id), [uploadingIds]);

  const markInitialForDeletion = useCallback((fileUploadId: string) => {
    setMarkedInitialIds(prev => new Set(prev).add(fileUploadId));
  }, []);

  const unmarkInitial = useCallback((fileUploadId: string) => {
    setMarkedInitialIds(prev => {
      const newSet = new Set(prev);
      newSet.delete(fileUploadId);
      return newSet;
    });
  }, []);

  const deleteAllMarkedInitials = useCallback(() => {
    for (const fileUploadId of markedInitialIds) {
      deleteByIdMutation.mutate({ fileUploadId });
    }
    setMarkedInitialIds(new Set());
  }, [markedInitialIds, deleteByIdMutation]);

  const reset = useCallback(() => {
    for (const data of uploadedDataMap.values()) {
      if (data.fileUploadId) {
        deleteByIdMutation.mutate({ fileUploadId: data.fileUploadId });
      }
    }

    for (const url of previews.values()) {
      if (url.startsWith("blob:")) {
        URL.revokeObjectURL(url);
      }
    }

    setPreviews(new Map(initialPreviewsRef.current));
    setUploadedDataMap(new Map());
    setMarkedInitialIds(new Set());
  }, [uploadedDataMap, previews, deleteByIdMutation]);

  return {
    getPreviewUrl,
    getUploadedData,
    isUploading,
    isAnyUploading: uploadingIds.size > 0,
    upload,
    discard,
    markedInitialIds,
    markInitialForDeletion,
    unmarkInitial,
    deleteAllMarkedInitials,
    reset,
  };
}
