"use client";

import { useCallback, useState } from "react";
import { MediaList } from "../common/MediaList";
import { ImageCropModal } from "./ImageCropModal";
import { useImageCrop } from "./hooks/useImageCrop";

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
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [imageToEdit, setImageToEdit] = useState<string | null>(null);
  const [originalImageUrl, setOriginalImageUrl] = useState<string | null>(null);

  const { crop, zoom, rotation, setCrop, setZoom, setRotation, resetCropState, cropImage } =
    useImageCrop();

  const handleEditClick = useCallback(
    (imageUrl: string) => {
      setImageToEdit(imageUrl);
      setOriginalImageUrl(imageUrl);
      setIsEditModalOpen(true);
      resetCropState();
    },
    [resetCropState],
  );

  const handleEditCancel = useCallback(() => {
    setIsEditModalOpen(false);
    setImageToEdit(null);
    setOriginalImageUrl(null);
    resetCropState();
  }, [resetCropState]);

  const handleEditComplete = useCallback(async () => {
    if (!imageToEdit || !originalImageUrl || !onImageEdit) {
      return;
    }

    try {
      const response = await fetch(imageToEdit);
      const blob = await response.blob();
      const urlExtension = originalImageUrl.split(".").pop()?.split("?")[0] || "jpg";
      const mimeType = blob.type || `image/${urlExtension === "png" ? "png" : "jpeg"}`;
      const originalFile = new File([blob], `image.${urlExtension}`, { type: mimeType });

      const editedFile = await cropImage(imageToEdit, originalFile);
      await onImageEdit(originalImageUrl, editedFile);

      setIsEditModalOpen(false);
      setImageToEdit(null);
      setOriginalImageUrl(null);
      resetCropState();
    } catch (error) {
      console.error("이미지 편집 실패:", error);
      handleEditCancel();
    }
  }, [imageToEdit, originalImageUrl, onImageEdit, cropImage, handleEditCancel, resetCropState]);

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

      {imageToEdit && (
        <ImageCropModal
          isOpen={isEditModalOpen}
          imageSrc={imageToEdit}
          crop={crop}
          zoom={zoom}
          rotation={rotation}
          onCropChange={setCrop}
          onZoomChange={setZoom}
          onRotationChange={setRotation}
          onCancel={handleEditCancel}
          onComplete={handleEditComplete}
        />
      )}
    </>
  );
}
