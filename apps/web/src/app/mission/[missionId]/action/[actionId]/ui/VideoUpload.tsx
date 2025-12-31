"use client";

import { toast } from "@/components/common/Toast";
// TODO: 백엔드 업로드 구현 시 사용
// import { STORAGE_BUCKETS } from "@/constants/buckets";
// import { useImageUpload } from "@/hooks/common/useImageUpload";
import { useCallback, useRef, useState } from "react";
import { MediaUploadArea } from "./components/MediaUploadArea";

interface VideoUploadProps {
  onUploadChange?: (
    hasUploadedVideo: boolean,
    videoUrls: string[],
    fileUploadIds: string[],
  ) => void;
  onUploadingChange?: (isUploading: boolean) => void;
}

export function VideoUpload({ onUploadChange, onUploadingChange }: VideoUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);

  // TODO: 백엔드 업로드 구현 시 사용
  // const { upload, isUploading, uploadError } = useImageUpload({
  //   bucket: STORAGE_BUCKETS.ACTION_ANSWER_IMAGES,
  //   onSuccess: result => {
  //     onUploadingChange?.(false);
  //     onUploadChange?.(true, [result.publicUrl], [result.fileUploadId]);
  //   },
  //   onError: () => {
  //     onUploadingChange?.(false);
  //     toast.warning(uploadError?.message || "파일 업로드에 실패했어요.\n다시 시도해주세요.");
  //     onUploadChange?.(false, [], []);
  //   },
  // });

  const handleFileSelect = useCallback(() => {
    inputRef.current?.click();
  }, []);

  const handleFileChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) {
        return;
      }

      if (!file.type.startsWith("video/")) {
        toast.warning("동영상 파일만 업로드할 수 있습니다.");
        if (inputRef.current) {
          inputRef.current.value = "";
        }
        return;
      }

      // TODO: 백엔드 업로드 구현 전까지 임시 로직
      // 로컬에서만 동작: Object URL 생성
      setIsUploading(true);
      onUploadingChange?.(true);

      const videoUrl = URL.createObjectURL(file);
      // TODO: 백엔드 업로드 구현 시 실제 fileUploadId 사용 (현재는 임시 ID)
      const temporaryFileUploadId = `temp-${Date.now()}-${Math.random().toString(36).substring(7)}`;

      // 로컬 URL과 임시 ID 전달
      onUploadChange?.(true, [videoUrl], [temporaryFileUploadId]);
      setIsUploading(false);
      onUploadingChange?.(false);

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
      accept="video/*"
      buttonText="동영상 첨부"
      icon="video"
    />
  );
}
