"use client";

import { useImageCrop } from "@/components/common/templates/action/image/hooks/useImageCrop";
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
    const croppedFile = await cropImage(imageSrc, originalFileRef.current);
    callbackRef.current?.(croppedFile);
    close();
  }, [imageSrc, cropImage, close]);

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
