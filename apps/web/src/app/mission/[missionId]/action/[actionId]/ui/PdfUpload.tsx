"use client";

import { toast } from "@/components/common/Toast";
import { STORAGE_BUCKETS } from "@/constants/buckets";
import { usePdfUpload } from "@/hooks/common/usePdfUpload";
import { useCallback, useRef } from "react";
import { MediaUploadArea } from "./components/MediaUploadArea";

interface PdfUploadProps {
  onUploadChange?: (
    hasUploadedFile: boolean,
    fileUrls: string[],
    fileUploadIds: string[],
    filePaths: string[],
    file?: File,
    tempUrl?: string,
  ) => void;
  onUploadingChange?: (isUploading: boolean) => void;
  onUploadStart?: (file: File, tempUrl: string) => void;
  currentCount?: number;
  maxCount?: number;
}

export function PdfUpload({
  onUploadChange,
  onUploadingChange,
  onUploadStart,
  currentCount = 0,
  maxCount = 1,
}: PdfUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const tempUrlRef = useRef<string | null>(null);

  const { upload, isUploading } = usePdfUpload({
    bucket: STORAGE_BUCKETS.ACTION_ANSWER_PDFS,
    onSuccess: result => {
      const tempUrl = tempUrlRef.current;
      tempUrlRef.current = null;
      onUploadingChange?.(false);
      onUploadChange?.(
        true,
        [result.publicUrl],
        [result.fileUploadId],
        [result.path],
        result.file,
        tempUrl ?? undefined,
      );
    },
    onError: error => {
      if (tempUrlRef.current) {
        URL.revokeObjectURL(tempUrlRef.current);
        tempUrlRef.current = null;
      }
      onUploadingChange?.(false);
      toast.warning(error?.message || "파일 업로드에 실패했어요.\n다시 시도해주세요.");
      onUploadChange?.(false, [], [], []);
    },
  });

  const handleFileSelect = useCallback(() => {
    inputRef.current?.click();
  }, []);

  const handleFileChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) {
        return;
      }

      if (file.type !== "application/pdf") {
        toast.warning("PDF 파일만 업로드할 수 있어요.");
        if (inputRef.current) {
          inputRef.current.value = "";
        }
        return;
      }

      const tempUrl = URL.createObjectURL(file);
      tempUrlRef.current = tempUrl;

      onUploadStart?.(file, tempUrl);
      onUploadingChange?.(true);
      upload(file);

      if (inputRef.current) {
        inputRef.current.value = "";
      }
    },
    [upload, onUploadingChange, onUploadStart],
  );

  return (
    <MediaUploadArea
      inputRef={inputRef}
      isUploading={isUploading}
      onFileSelect={handleFileSelect}
      onFileChange={handleFileChange}
      accept="application/pdf"
      icon="file"
      variant="counter"
      currentCount={currentCount}
      maxCount={maxCount}
    />
  );
}
