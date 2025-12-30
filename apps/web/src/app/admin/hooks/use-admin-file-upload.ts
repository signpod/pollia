"use client";

import { deleteFile, getUploadUrl } from "@/actions/common/files";
import { STORAGE_BUCKETS } from "@/constants/buckets";
import type { DeleteFileRequest, UploadFileRequest } from "@/types/dto/file";
import { ActionType } from "@prisma/client";
import { useMutation } from "@tanstack/react-query";
import { useCallback, useEffect, useRef, useState } from "react";

export interface UploadedFileData {
  publicUrl: string;
  fileUploadId: string;
  path: string;
  fileName: string;
}

export interface UseAdminFileUploadOptions {
  actionType: typeof ActionType.PDF | typeof ActionType.VIDEO;
  initialUrl?: string;
  initialFileName?: string;
  onUploadSuccess?: (data: UploadedFileData) => void;
  onUploadError?: (error: Error) => void;
}

export function useAdminFileUpload(options: UseAdminFileUploadOptions) {
  const [fileUrl, setFileUrl] = useState<string | null>(options.initialUrl || null);
  const [fileName, setFileName] = useState<string | null>(options.initialFileName || null);
  const [uploadedData, setUploadedData] = useState<UploadedFileData | null>(null);
  const fileUrlRef = useRef(fileUrl);
  fileUrlRef.current = fileUrl;

  const uploadMutation = useMutation({
    mutationFn: async (file: File): Promise<UploadedFileData> => {
      const uploadRequest: UploadFileRequest = {
        fileName: file.name,
        fileType: file.type,
        fileSize: file.size,
        bucket: STORAGE_BUCKETS.ACTION_ANSWER_PDFS,
        actionType: options.actionType,
      };

      const { data } = await getUploadUrl(uploadRequest);
      const { uploadUrl, publicUrl, path, fileUploadId } = data;

      await uploadFileToStorage(file, uploadUrl);

      return { publicUrl, fileUploadId, path, fileName: file.name };
    },
    onSuccess: data => {
      setUploadedData(data);
      setFileUrl(data.publicUrl);
      setFileName(data.fileName);
      options.onUploadSuccess?.(data);
    },
    onError: error => {
      options.onUploadError?.(error as Error);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (request: DeleteFileRequest) => deleteFile(request),
  });

  useEffect(() => {
    return () => {
      if (fileUrlRef.current?.startsWith("blob:")) {
        URL.revokeObjectURL(fileUrlRef.current);
      }
    };
  }, []);

  const selectFile = useCallback(
    (file: File) => {
      uploadMutation.mutate(file);
    },
    [uploadMutation],
  );

  const clearFile = useCallback(() => {
    if (uploadedData) {
      deleteMutation.mutate({ path: uploadedData.path });
    }
    setUploadedData(null);
    setFileUrl(null);
    setFileName(null);
  }, [deleteMutation, uploadedData]);

  return {
    fileUrl,
    fileName,
    uploadedData,
    isUploading: uploadMutation.isPending,
    selectFile,
    clearFile,
  };
}

async function uploadFileToStorage(file: File, uploadUrl: string): Promise<void> {
  const response = await fetch(uploadUrl, {
    method: "PUT",
    body: file,
    headers: {
      "Content-Type": file.type,
    },
  });

  if (!response.ok) {
    throw new Error("파일 업로드 실패");
  }
}
