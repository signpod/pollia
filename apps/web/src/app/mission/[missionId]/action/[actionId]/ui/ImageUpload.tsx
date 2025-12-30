"use client";

import { toast } from "@/components/common/Toast";
import { STORAGE_BUCKETS } from "@/constants/buckets";
import { useImageUpload } from "@/hooks/common/useImageUpload";
import { shouldSkipCrop } from "@/lib/fileValidation";
import { useCallback, useEffect, useRef, useState } from "react";
import { ImageCropModal } from "./components/ImageCropModal";
import { ImageUploadArea } from "./components/ImageUploadArea";
import { useBlurThumbnail } from "./hooks/useBlurThumbnail";
import { useImageCrop } from "./hooks/useImageCrop";

interface ImageUploadProps {
  onUploadChange?: (
    hasUploadedImage: boolean,
    imageUrls: string[],
    fileUploadIds: string[],
  ) => void;
  onUploadingChange?: (isUploading: boolean) => void;
}

export function ImageUpload({ onUploadChange, onUploadingChange }: ImageUploadProps) {
  const [isCropModalOpen, setIsCropModalOpen] = useState(false);
  const [imageToCrop, setImageToCrop] = useState<string | null>(null);
  const [originalFile, setOriginalFile] = useState<File | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const { generateBlur, clearBlur } = useBlurThumbnail();
  const { crop, zoom, rotation, setCrop, setZoom, setRotation, resetCropState, cropImage } =
    useImageCrop();

  const revokeImageUrl = useCallback((url: string | null) => {
    if (url) {
      URL.revokeObjectURL(url);
    }
  }, []);

  const { upload, isUploading, uploadError } = useImageUpload({
    bucket: STORAGE_BUCKETS.ACTION_ANSWER_IMAGES,
    onSuccess: result => {
      onUploadingChange?.(false);
      onUploadChange?.(true, [result.publicUrl], [result.fileUploadId]);
    },
    onError: () => {
      onUploadingChange?.(false);
      toast.warning(uploadError?.message || "파일 업로드에 실패했어요.\n다시 시도해주세요.");
      onUploadChange?.(false, [], []);
    },
  });

  useEffect(() => {
    onUploadingChange?.(isUploading);
  }, [isUploading, onUploadingChange]);

  const handleCropCancel = useCallback(() => {
    setIsCropModalOpen(false);
    revokeImageUrl(imageToCrop);
    setImageToCrop(null);
    setOriginalFile(null);
    resetCropState();
  }, [imageToCrop, revokeImageUrl, resetCropState]);

  const handleCropComplete = useCallback(async () => {
    if (!imageToCrop || !originalFile) {
      return;
    }

    try {
      setIsCropModalOpen(false);
      onUploadingChange?.(true);

      const croppedFile = await cropImage(imageToCrop, originalFile);
      await generateBlur(croppedFile);
      upload(croppedFile);

      revokeImageUrl(imageToCrop);
      setImageToCrop(null);
      setOriginalFile(null);
      resetCropState();
    } catch (error) {
      console.error("이미지 크롭 실패:", error);
      toast.warning("이미지 처리에 실패했어요.\n다시 시도해주세요.");
      handleCropCancel();
    }
  }, [
    imageToCrop,
    originalFile,
    cropImage,
    generateBlur,
    upload,
    revokeImageUrl,
    resetCropState,
    handleCropCancel,
    onUploadingChange,
  ]);

  const handleFileSelect = useCallback(() => {
    inputRef.current?.click();
  }, []);

  const handleFileChange = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) {
        return;
      }

      clearBlur();

      if (shouldSkipCrop(file)) {
        onUploadingChange?.(true);
        upload(file);
        if (inputRef.current) {
          inputRef.current.value = "";
        }
        return;
      }

      const imageUrl = URL.createObjectURL(file);
      setImageToCrop(imageUrl);
      setOriginalFile(file);
      setIsCropModalOpen(true);

      if (inputRef.current) {
        inputRef.current.value = "";
      }
    },
    [upload, clearBlur, onUploadingChange],
  );

  useEffect(() => {
    return () => {
      revokeImageUrl(imageToCrop);
    };
  }, [imageToCrop, revokeImageUrl]);

  return (
    <>
      <ImageUploadArea
        inputRef={inputRef}
        isUploading={isUploading}
        onFileSelect={handleFileSelect}
        onFileChange={handleFileChange}
      />
      {imageToCrop && (
        <ImageCropModal
          isOpen={isCropModalOpen}
          imageSrc={imageToCrop}
          crop={crop}
          zoom={zoom}
          rotation={rotation}
          onCropChange={setCrop}
          onZoomChange={setZoom}
          onRotationChange={setRotation}
          onCancel={handleCropCancel}
          onComplete={handleCropComplete}
        />
      )}
    </>
  );
}
