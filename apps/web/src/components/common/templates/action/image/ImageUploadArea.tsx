"use client";

import { MediaUploadArea } from "../common/MediaUploadArea";

interface ImageUploadAreaProps {
  inputRef: React.RefObject<HTMLInputElement | null>;
  isUploading: boolean;
  onFileSelect: () => void;
  onFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  currentCount?: number;
  maxCount?: number;
}

export function ImageUploadArea({
  inputRef,
  isUploading,
  onFileSelect,
  onFileChange,
  currentCount = 0,
  maxCount = 10,
}: ImageUploadAreaProps) {
  return (
    <MediaUploadArea
      inputRef={inputRef}
      isUploading={isUploading}
      onFileSelect={onFileSelect}
      onFileChange={onFileChange}
      accept="image/*,.heic,.heif"
      icon="image"
      multiple
      variant="counter"
      currentCount={currentCount}
      maxCount={maxCount}
    />
  );
}
