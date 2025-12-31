"use client";

import { MediaUploadArea } from "./MediaUploadArea";

interface ImageUploadAreaProps {
  inputRef: React.RefObject<HTMLInputElement | null>;
  isUploading: boolean;
  onFileSelect: () => void;
  onFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export function ImageUploadArea({
  inputRef,
  isUploading,
  onFileSelect,
  onFileChange,
}: ImageUploadAreaProps) {
  return (
    <MediaUploadArea
      inputRef={inputRef}
      isUploading={isUploading}
      onFileSelect={onFileSelect}
      onFileChange={onFileChange}
      accept="image/*,.heic,.heif"
      buttonText="사진 첨부"
      icon="image"
    />
  );
}
