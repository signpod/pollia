"use client";

import { useImageCrop } from "@/components/common/templates/action/image/hooks/useImageCrop";
import { isGifFile } from "@/lib/fileValidation";
import { useCallback, useRef, useState } from "react";

export interface CropModalProps {
  isOpen: boolean;
  imageSrc: string;
  crop: { x: number; y: number };
  zoom: number;
  rotation: number;
  onCropChange: (crop: { x: number; y: number }) => void;
  onZoomChange: (zoom: number) => void;
  onRotationChange: (rotation: number) => void;
  onCancel: () => void;
  onComplete: () => void;
}

export interface UseCropperModalReturn {
  openCropper: (file: File, onComplete: (croppedFile: File) => void) => void;
  cropModalProps: CropModalProps | null;
}

export function useCropperModal(): UseCropperModalReturn {
  const { crop, zoom, rotation, setCrop, setZoom, setRotation, resetCropState, cropImage } =
    useImageCrop();
  const [isOpen, setIsOpen] = useState(false);
  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const originalFileRef = useRef<File | null>(null);
  const callbackRef = useRef<((file: File) => void) | null>(null);

  const close = useCallback(() => {
    setIsOpen(false);
    if (imageSrc) URL.revokeObjectURL(imageSrc);
    setImageSrc(null);
    originalFileRef.current = null;
    callbackRef.current = null;
  }, [imageSrc]);

  const handleComplete = useCallback(async () => {
    if (!imageSrc || !originalFileRef.current) return;

    const file = originalFileRef.current;
    let resultFile: File;

    if (isGifFile(file.name, file.type)) {
      const { cropGifToWebp, calculateGifCropParams } = await import("@/lib/gifToWebp");
      const { CROP_CONSTANTS } = await import(
        "@/components/common/templates/action/image/hooks/useImageCrop"
      );

      const img = new Image();
      const dimensions = await new Promise<{ width: number; height: number }>((resolve, reject) => {
        img.onload = () => resolve({ width: img.naturalWidth, height: img.naturalHeight });
        img.onerror = reject;
        img.src = imageSrc;
      });

      const cropParams = calculateGifCropParams(
        dimensions.width,
        dimensions.height,
        crop,
        zoom,
        rotation,
        CROP_CONSTANTS.CROP_SIZE,
      );
      resultFile = await cropGifToWebp(file, cropParams);
    } else {
      resultFile = await cropImage(imageSrc, file);
    }

    callbackRef.current?.(resultFile);
    close();
  }, [imageSrc, crop, zoom, rotation, cropImage, close]);

  const openCropper = useCallback(
    (file: File, onComplete: (croppedFile: File) => void) => {
      const url = URL.createObjectURL(file);
      originalFileRef.current = file;
      callbackRef.current = onComplete;
      setImageSrc(url);
      resetCropState();
      setIsOpen(true);
    },
    [resetCropState],
  );

  const cropModalProps: CropModalProps | null = imageSrc
    ? {
        isOpen,
        imageSrc,
        crop,
        zoom,
        rotation,
        onCropChange: setCrop,
        onZoomChange: setZoom,
        onRotationChange: setRotation,
        onCancel: close,
        onComplete: handleComplete,
      }
    : null;

  return { openCropper, cropModalProps };
}
