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
  ) => void;
  onUploadingChange?: (isUploading: boolean) => void;
}

export function PdfUpload({ onUploadChange, onUploadingChange }: PdfUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  const { upload, isUploading } = usePdfUpload({
    bucket: STORAGE_BUCKETS.ACTION_ANSWER_PDFS,
    onSuccess: result => {
      onUploadingChange?.(false);
      onUploadChange?.(
        true,
        [result.publicUrl],
        [result.fileUploadId],
        [result.path],
        result.file,
      );
    },
    onError: error => {
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

      onUploadingChange?.(true);
      upload(file);

      if (inputRef.current) {
        inputRef.current.value = "";
      }
    },
    [upload, onUploadingChange],
  );

  return (
    <MediaUploadArea
      inputRef={inputRef}
      isUploading={isUploading}
      onFileSelect={handleFileSelect}
      onFileChange={handleFileChange}
      accept="application/pdf"
      buttonText="PDF 첨부"
      icon="file"
    />
  );
}
