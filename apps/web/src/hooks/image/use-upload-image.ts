"use client";

import { assertActionSuccess } from "@/actions/common/error";
import { deleteFileById, getUploadUrl } from "@/actions/common/files";
import { STORAGE_BUCKETS } from "@/constants/buckets";
import type { DeleteFileByIdRequest, UploadFileRequest } from "@/types/dto/file";
import { ActionType } from "@prisma/client";
import { useMutation } from "@tanstack/react-query";
import { useCallback, useEffect, useRef, useState } from "react";

import { revokeBlobUrl } from "./blob-url";
import { preprocessFile } from "./preprocess-file";
import type { UploadedImageData, UseUploadImageOptions, UseUploadImageReturn } from "./types";
import { uploadFileToStorage } from "./upload-file-to-storage";

export function useUploadImage(options: UseUploadImageOptions = {}): UseUploadImageReturn {
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [uploadedData, setUploadedData] = useState<UploadedImageData | null>(null);
  const previewUrlRef = useRef(previewUrl);
  previewUrlRef.current = previewUrl;
  const optionsRef = useRef(options);
  optionsRef.current = options;

  const uploadMutation = useMutation({
    mutationFn: async (file: File): Promise<UploadedImageData> => {
      const processedFile = await preprocessFile(file);

      const uploadRequest: UploadFileRequest = {
        fileName: processedFile.name,
        fileType: processedFile.type,
        fileSize: processedFile.size,
        bucket: optionsRef.current.bucket || STORAGE_BUCKETS.MISSION_IMAGES,
        actionType: ActionType.IMAGE,
      };

      const result = await getUploadUrl(uploadRequest);
      assertActionSuccess(result);
      const { uploadUrl, publicUrl, path, fileUploadId } = result.data;

      await uploadFileToStorage(processedFile, uploadUrl);

      return { publicUrl, fileUploadId, path };
    },
    onSuccess: data => {
      setUploadedData(data);
      revokeBlobUrl(previewUrlRef.current);
      setPreviewUrl(data.publicUrl);
      optionsRef.current.onUploadSuccess?.(data);
    },
    onError: error => {
      revokeBlobUrl(previewUrlRef.current);
      setPreviewUrl(null);
      optionsRef.current.onUploadError?.(error instanceof Error ? error : new Error(String(error)));
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (request: DeleteFileByIdRequest) => deleteFileById(request),
  });

  useEffect(() => {
    return () => {
      revokeBlobUrl(previewUrlRef.current);
    };
  }, []);

  const upload = useCallback(
    (file: File) => {
      revokeBlobUrl(previewUrlRef.current);
      const blobUrl = URL.createObjectURL(file);
      setPreviewUrl(blobUrl);
      uploadMutation.mutate(file);
    },
    [uploadMutation],
  );

  const discard = useCallback(() => {
    if (uploadedData?.fileUploadId) {
      deleteMutation.mutate({ fileUploadId: uploadedData.fileUploadId });
    }
    revokeBlobUrl(previewUrlRef.current);
    setPreviewUrl(null);
    setUploadedData(null);
  }, [uploadedData, deleteMutation]);

  return {
    previewUrl,
    uploadedData,
    isUploading: uploadMutation.isPending,
    upload,
    discard,
  };
}
