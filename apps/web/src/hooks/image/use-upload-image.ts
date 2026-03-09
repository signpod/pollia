"use client";

import { deleteFileById, getUploadUrl } from "@/actions/common/files";
import { STORAGE_BUCKETS } from "@/constants/buckets";
import type { DeleteFileByIdRequest, UploadFileRequest } from "@/types/dto/file";
import { ActionType } from "@prisma/client";
import { useMutation } from "@tanstack/react-query";
import { useCallback, useEffect, useRef, useState } from "react";

import type { UploadedImageData, UseUploadImageOptions, UseUploadImageReturn } from "./types";
import { uploadFileToStorage } from "./upload-file-to-storage";

export function useUploadImage(options: UseUploadImageOptions = {}): UseUploadImageReturn {
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [uploadedData, setUploadedData] = useState<UploadedImageData | null>(null);
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
      if (previewUrlRef.current?.startsWith("blob:")) {
        URL.revokeObjectURL(previewUrlRef.current);
      }
      setPreviewUrl(null);
      options.onUploadError?.(error as Error);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (request: DeleteFileByIdRequest) => deleteFileById(request),
  });

  useEffect(() => {
    return () => {
      if (previewUrlRef.current?.startsWith("blob:")) {
        URL.revokeObjectURL(previewUrlRef.current);
      }
    };
  }, []);

  const upload = useCallback(
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

  const discard = useCallback(() => {
    if (uploadedData?.fileUploadId) {
      deleteMutation.mutate({ fileUploadId: uploadedData.fileUploadId });
    }
    if (previewUrlRef.current?.startsWith("blob:")) {
      URL.revokeObjectURL(previewUrlRef.current);
    }
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
