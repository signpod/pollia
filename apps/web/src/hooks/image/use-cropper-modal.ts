"use client";

import { toast } from "@/components/common/Toast";
import {
  CROP_CONSTANTS,
  useImageCrop,
} from "@/components/common/templates/action/image/hooks/useImageCrop";
import { getImageFileSizeLabel, getImageMaxFileSize } from "@/constants/fileUpload";
import { isGifFile } from "@/lib/fileValidation";
import { useCallback, useRef, useState } from "react";

export interface CropModalProps {
  isOpen: boolean;
  isProcessing: boolean;
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
  const [isProcessing, setIsProcessing] = useState(false);
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

    setIsProcessing(true);
    try {
      const file = originalFileRef.current;
      let resultFile: File;

      if (isGifFile(file.name, file.type)) {
        const { cropGif, calculateGifCropParams } = await import("@/lib/gifCrop");

        const img = new Image();
        const dimensions = await new Promise<{ width: number; height: number }>(
          (resolve, reject) => {
            img.onload = () => resolve({ width: img.naturalWidth, height: img.naturalHeight });
            img.onerror = reject;
            img.src = imageSrc;
          },
        );

        const cropParams = calculateGifCropParams(
          dimensions.width,
          dimensions.height,
          crop,
          zoom,
          rotation,
          CROP_CONSTANTS.CROP_SIZE,
        );
        resultFile = await cropGif(file, cropParams);
      } else {
        resultFile = await cropImage(imageSrc, file);
      }

      callbackRef.current?.(resultFile);
      close();
    } catch {
      toast.warning("이미지 처리에 실패했습니다. 다시 시도해주세요.");
    } finally {
      setIsProcessing(false);
    }
  }, [imageSrc, crop, zoom, rotation, cropImage, close]);

  const openCropper = useCallback(
    (file: File, onComplete: (croppedFile: File) => void) => {
      const maxSize = getImageMaxFileSize(file.name, file.type);
      if (file.size > maxSize) {
        const label = getImageFileSizeLabel(file.name, file.type);
        const fileTypeLabel = isGifFile(file.name, file.type) ? "GIF " : "";
        toast.warning(`${fileTypeLabel}파일 크기는 ${label}를 초과할 수 없습니다`);
        return;
      }

      if (isGifFile(file.name, file.type)) {
        import("@/lib/gifCrop").then(m => m.prefetchFFmpeg());
      }

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
        isProcessing,
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
