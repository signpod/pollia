"use client";

import { MAX_IMAGE_UPLOAD_COUNT } from "@/constants/image";
import { cn } from "@/lib/utils";
import { ButtonV2, Typo } from "@repo/ui/components";
import { useCallback, useState } from "react";
import { ImageCropModal } from "./ImageCropModal";
import { MediaList } from "./MediaList";
import { useImageCrop } from "../hooks/useImageCrop";

interface ImageListProps {
  imageUrls: string[];
  uploadingImageUrl: string | null;
  isUploading: boolean;
  onImageDelete: (imageUrl: string) => void;
  onImageLoadComplete: (imageUrl: string) => void;
  onImageEdit?: (originalImageUrl: string, editedFile: File) => Promise<void>;
}

export function ImageList({
  imageUrls,
  uploadingImageUrl,
  isUploading,
  onImageDelete,
  onImageLoadComplete,
  onImageEdit,
}: ImageListProps) {
  const [selectedImages, setSelectedImages] = useState<Set<string>>(new Set());
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [imageToEdit, setImageToEdit] = useState<string | null>(null);
  const [originalImageUrl, setOriginalImageUrl] = useState<string | null>(null);

  const { crop, zoom, rotation, setCrop, setZoom, setRotation, resetCropState, cropImage } =
    useImageCrop();

  const handleImageToggle = (imageUrl: string) => {
    setSelectedImages(prev => {
      const newSet = new Set(prev);
      if (newSet.has(imageUrl)) {
        newSet.delete(imageUrl);
      } else {
        newSet.add(imageUrl);
      }
      return newSet;
    });
  };

  const handleEditClick = useCallback(() => {
    const selectedArray = Array.from(selectedImages);
    if (selectedArray.length !== 1) {
      return;
    }

    const imageUrl = selectedArray[0];
    if (!imageUrl) {
      return;
    }

    setImageToEdit(imageUrl);
    setOriginalImageUrl(imageUrl);
    setIsEditModalOpen(true);
    resetCropState();
  }, [selectedImages, resetCropState]);

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
      const originalFile = new File([blob], "image.jpg", { type: "image/jpeg" });

      const editedFile = await cropImage(imageToEdit, originalFile);
      await onImageEdit(originalImageUrl, editedFile);

      setIsEditModalOpen(false);
      setImageToEdit(null);
      setOriginalImageUrl(null);
      setSelectedImages(new Set());
      resetCropState();
    } catch (error) {
      console.error("이미지 편집 실패:", error);
      handleEditCancel();
    }
  }, [imageToEdit, originalImageUrl, onImageEdit, cropImage, handleEditCancel, resetCropState]);

  const selectedCount = selectedImages.size;
  const canEdit = selectedCount === 1;

  return (
    <>
      <div className="flex flex-col gap-6">
        <div className="flex justify-between items-center">
          <div className="flex w-full items-center gap-2">
            <Typo.SubTitle size="large" className={cn(imageUrls.length > 0 && "text-point")}>
              {imageUrls.length}
            </Typo.SubTitle>
            <Typo.SubTitle size="large">/</Typo.SubTitle>
            <Typo.SubTitle size="large">{MAX_IMAGE_UPLOAD_COUNT}</Typo.SubTitle>
          </div>
          <ButtonV2 onClick={handleEditClick} disabled={!canEdit}>
            이미지 편집
          </ButtonV2>
        </div>

        <MediaList
          mediaUrls={imageUrls}
          uploadingMediaUrl={uploadingImageUrl}
          isUploading={isUploading}
          mediaType="image"
          onMediaDelete={onImageDelete}
          onMediaLoadComplete={onImageLoadComplete}
          selectedMediaUrls={selectedImages}
          onMediaToggle={handleImageToggle}
        />
      </div>

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
