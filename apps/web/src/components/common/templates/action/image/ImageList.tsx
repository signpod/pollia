"use client";

import { useCropperModal } from "@/hooks/image/use-cropper-modal";
import { useCallback, useRef } from "react";
import { MediaList } from "../common/MediaList";
import { ImageCropModal } from "./ImageCropModal";

interface ImageListProps {
  imageUrls: string[];
  uploadingImageUrls: string[];
  uploadProgress?: number;
  onImageDelete: (imageUrl: string) => void;
  onImageLoadComplete: (imageUrl: string) => void;
  onImageEdit?: (originalImageUrl: string, editedFile: File) => Promise<void>;
}

export function ImageList({
  imageUrls,
  uploadingImageUrls,
  uploadProgress,
  onImageDelete,
  onImageLoadComplete,
  onImageEdit,
}: ImageListProps) {
  const { openCropper, cropModalProps } = useCropperModal();
  const originalUrlRef = useRef<string | null>(null);

  const handleEditClick = useCallback(
    async (imageUrl: string) => {
      if (!onImageEdit) return;

      try {
        const response = await fetch(imageUrl);
        const blob = await response.blob();
        const urlExtension = imageUrl.split(".").pop()?.split("?")[0] || "jpg";
        const mimeType = blob.type || `image/${urlExtension === "png" ? "png" : "jpeg"}`;
        const file = new File([blob], `image.${urlExtension}`, { type: mimeType });

        originalUrlRef.current = imageUrl;
        openCropper(file, async editedFile => {
          if (originalUrlRef.current) {
            await onImageEdit(originalUrlRef.current, editedFile);
            originalUrlRef.current = null;
          }
        });
      } catch (error) {
        console.error("이미지 편집 실패:", error);
      }
    },
    [onImageEdit, openCropper],
  );

  if (imageUrls.length === 0) {
    return null;
  }

  return (
    <>
      <MediaList
        mediaUrls={imageUrls}
        uploadingMediaUrls={uploadingImageUrls}
        uploadProgress={uploadProgress}
        mediaType="image"
        onMediaDelete={onImageDelete}
        onMediaLoadComplete={onImageLoadComplete}
        onMediaEdit={handleEditClick}
      />

      {cropModalProps && <ImageCropModal {...cropModalProps} />}
    </>
  );
}
