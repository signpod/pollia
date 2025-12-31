"use client";

import { toast } from "@/components/common/Toast";
import { useCallback, useRef, useState } from "react";
import { MediaUploadArea } from "./components/MediaUploadArea";

interface PdfUploadProps {
  onUploadChange?: (
    hasUploadedFile: boolean,
    fileUrls: string[],
    fileUploadIds: string[],
    file?: File,
  ) => void;
  onUploadingChange?: (isUploading: boolean) => void;
}

export function PdfUpload({ onUploadChange, onUploadingChange }: PdfUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);

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
        toast.warning("PDF 파일만 업로드할 수 있습니다.");
        if (inputRef.current) {
          inputRef.current.value = "";
        }
        return;
      }

      // TODO: 백엔드 업로드 구현 전까지 임시 로직
      // 로컬에서만 동작: Object URL 생성
      setIsUploading(true);
      onUploadingChange?.(true);

      const fileUrl = URL.createObjectURL(file);
      // TODO: 백엔드 업로드 구현 시 실제 fileUploadId 사용 (현재는 임시 ID)
      const temporaryFileUploadId = `temp-${Date.now()}-${Math.random().toString(36).substring(7)}`;

      // 로컬 URL과 임시 ID, 파일 정보 전달
      // 비동기로 처리하여 로딩 상태가 보이도록 함
      setTimeout(() => {
        onUploadChange?.(true, [fileUrl], [temporaryFileUploadId], file);
        setIsUploading(false);
        onUploadingChange?.(false);
      }, 100);

      // TODO: 백엔드 업로드 구현 시 아래 주석 해제하고 위의 임시 로직 제거
      // upload(file);

      if (inputRef.current) {
        inputRef.current.value = "";
      }
    },
    [onUploadChange, onUploadingChange],
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
