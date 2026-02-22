"use client";

import { useCallback, useEffect, useRef, useState } from "react";

interface CropperSource {
  imageSrc: string;
  fileName: string;
  isObjectUrl: boolean;
}

interface UseImageCropperOptions {
  fileNamePrefix: string;
}

export function useImageCropper({ fileNamePrefix }: UseImageCropperOptions) {
  const [source, setSource] = useState<CropperSource | null>(null);
  const [isOpen, setIsOpen] = useState(false);
  const sourceRef = useRef<CropperSource | null>(null);

  useEffect(() => {
    sourceRef.current = source;
  }, [source]);

  const close = useCallback(() => {
    setIsOpen(false);
    setSource(prev => {
      if (prev?.isObjectUrl) {
        URL.revokeObjectURL(prev.imageSrc);
      }
      return null;
    });
  }, []);

  useEffect(() => {
    return () => {
      if (sourceRef.current?.isObjectUrl) {
        URL.revokeObjectURL(sourceRef.current.imageSrc);
      }
    };
  }, []);

  const openWithFile = useCallback(
    (file: File) => {
      setSource(prev => {
        if (prev?.isObjectUrl) {
          URL.revokeObjectURL(prev.imageSrc);
        }

        return {
          imageSrc: URL.createObjectURL(file),
          fileName: file.name || `${fileNamePrefix}-${Date.now()}.jpg`,
          isObjectUrl: true,
        };
      });
      setIsOpen(true);
    },
    [fileNamePrefix],
  );

  const openWithImageUrl = useCallback(
    (imageSrc: string, fileName?: string) => {
      setSource(prev => {
        if (prev?.isObjectUrl) {
          URL.revokeObjectURL(prev.imageSrc);
        }

        return {
          imageSrc,
          fileName: fileName ?? `${fileNamePrefix}-${Date.now()}.jpg`,
          isObjectUrl: false,
        };
      });
      setIsOpen(true);
    },
    [fileNamePrefix],
  );

  return {
    isOpen,
    imageSrc: source?.imageSrc ?? null,
    fileName: source?.fileName ?? null,
    openWithFile,
    openWithImageUrl,
    close,
  };
}
