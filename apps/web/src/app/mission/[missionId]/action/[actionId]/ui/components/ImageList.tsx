"use client";

import { MAX_IMAGE_UPLOAD_COUNT } from "@/constants/image";
import { MediaList } from "./MediaList";

interface ImageListProps {
  imageUrls: string[];
  uploadingImageUrl: string | null;
  isUploading: boolean;
  onImageDelete: (imageUrl: string) => void;
  onImageLoadComplete: (imageUrl: string) => void;
}

export function ImageList({
  imageUrls,
  uploadingImageUrl,
  isUploading,
  onImageDelete,
  onImageLoadComplete,
}: ImageListProps) {
  return (
    <MediaList
      mediaUrls={imageUrls}
      uploadingMediaUrl={uploadingImageUrl}
      isUploading={isUploading}
      maxCount={MAX_IMAGE_UPLOAD_COUNT}
      mediaType="image"
      onMediaDelete={onImageDelete}
      onMediaLoadComplete={onImageLoadComplete}
    />
  );
}
