"use client";

import { useCallback, useEffect, useRef, useState } from "react";

interface CustomCropperProps {
  imageSrc: string;
  crop: { x: number; y: number };
  zoom: number;
  rotation: number;
  onCropChange: (crop: { x: number; y: number }) => void;
}

const CROP_SIZE = 360;
const ASPECT_RATIO_TOLERANCE = 0.001;

export function CustomCropper({
  imageSrc,
  crop,
  zoom,
  rotation,
  onCropChange,
}: CustomCropperProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [imageSize, setImageSize] = useState<{ width: number; height: number } | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState<{ x: number; y: number } | null>(null);
  const [imageLoaded, setImageLoaded] = useState(false);

  useEffect(() => {
    const img = new Image();
    img.onload = () => {
      setImageSize({ width: img.width, height: img.height });
      setImageLoaded(true);
    };
    img.onerror = () => {
      setImageLoaded(false);
      setImageSize(null);
    };
    img.src = imageSrc;
  }, [imageSrc]);

  const getImageDisplaySize = useCallback(() => {
    if (!imageSize) return { width: 0, height: 0 };

    const imageAspect = imageSize.width / imageSize.height;
    const isWider = imageSize.width > imageSize.height;

    let baseWidth: number;
    let baseHeight: number;

    if (isWider) {
      baseWidth = CROP_SIZE;
      baseHeight = CROP_SIZE / imageAspect;
    } else {
      baseHeight = CROP_SIZE;
      baseWidth = CROP_SIZE * imageAspect;
    }

    const scaledWidth = baseWidth * zoom;
    const scaledHeight = baseHeight * zoom;

    const calculatedAspect = scaledWidth / scaledHeight;
    const originalAspect = imageSize.width / imageSize.height;

    if (Math.abs(calculatedAspect - originalAspect) > ASPECT_RATIO_TOLERANCE) {
      if (isWider) {
        return {
          width: scaledWidth,
          height: scaledWidth / originalAspect,
        };
      }
      return {
        width: scaledHeight * originalAspect,
        height: scaledHeight,
      };
    }

    return {
      width: scaledWidth,
      height: scaledHeight,
    };
  }, [imageSize, zoom]);

  const getImagePosition = useCallback(() => {
    const displaySize = getImageDisplaySize();
    const centerX = CROP_SIZE / 2;
    const centerY = CROP_SIZE / 2;

    return {
      x: centerX + crop.x - displaySize.width / 2,
      y: centerY + crop.y - displaySize.height / 2,
    };
  }, [crop, getImageDisplaySize]);

  const handleMouseDown = useCallback(
    (e: React.MouseEvent) => {
      if (!imageLoaded || !containerRef.current) return;
      e.preventDefault();
      setIsDragging(true);
      setDragStart({ x: e.clientX, y: e.clientY });
    },
    [imageLoaded],
  );

  const handleMouseMove = useCallback(
    (e: MouseEvent) => {
      if (!isDragging || !dragStart || !containerRef.current) return;

      const deltaX = e.clientX - dragStart.x;
      const deltaY = e.clientY - dragStart.y;

      const displaySize = getImageDisplaySize();
      const maxX = Math.max(0, (displaySize.width - CROP_SIZE) / 2);
      const maxY = Math.max(0, (displaySize.height - CROP_SIZE) / 2);
      const minX = -maxX;
      const minY = -maxY;

      const newX = Math.max(minX, Math.min(maxX, crop.x + deltaX));
      const newY = Math.max(minY, Math.min(maxY, crop.y + deltaY));

      onCropChange({ x: newX, y: newY });
      setDragStart({ x: e.clientX, y: e.clientY });
    },
    [isDragging, dragStart, crop, onCropChange, getImageDisplaySize],
  );

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
    setDragStart(null);
  }, []);

  useEffect(() => {
    if (isDragging) {
      window.addEventListener("mousemove", handleMouseMove);
      window.addEventListener("mouseup", handleMouseUp);
      return () => {
        window.removeEventListener("mousemove", handleMouseMove);
        window.removeEventListener("mouseup", handleMouseUp);
      };
    }
  }, [isDragging, handleMouseMove, handleMouseUp]);

  const handleTouchStart = useCallback(
    (e: React.TouchEvent) => {
      if (!imageLoaded || !containerRef.current) return;
      e.preventDefault();
      const touch = e.touches[0];
      setIsDragging(true);
      setDragStart({ x: touch?.clientX ?? 0, y: touch?.clientY ?? 0 });
    },
    [imageLoaded],
  );

  const handleTouchMove = useCallback(
    (e: TouchEvent) => {
      if (!isDragging || !dragStart || !containerRef.current) return;
      e.preventDefault();

      const touch = e.touches[0];
      const deltaX = (touch?.clientX ?? 0) - dragStart.x;
      const deltaY = (touch?.clientY ?? 0) - dragStart.y;

      const displaySize = getImageDisplaySize();
      const maxX = Math.max(0, (displaySize.width - CROP_SIZE) / 2);
      const maxY = Math.max(0, (displaySize.height - CROP_SIZE) / 2);
      const minX = -maxX;
      const minY = -maxY;

      const newX = Math.max(minX, Math.min(maxX, crop.x + deltaX));
      const newY = Math.max(minY, Math.min(maxY, crop.y + deltaY));

      onCropChange({ x: newX, y: newY });
      setDragStart({ x: touch?.clientX ?? 0, y: touch?.clientY ?? 0 });
    },
    [isDragging, dragStart, crop, onCropChange, getImageDisplaySize],
  );

  const handleTouchEnd = useCallback(() => {
    setIsDragging(false);
    setDragStart(null);
  }, []);

  useEffect(() => {
    if (isDragging) {
      window.addEventListener("touchmove", handleTouchMove, { passive: false });
      window.addEventListener("touchend", handleTouchEnd);
      return () => {
        window.removeEventListener("touchmove", handleTouchMove);
        window.removeEventListener("touchend", handleTouchEnd);
      };
    }
  }, [isDragging, handleTouchMove, handleTouchEnd]);

  const imagePosition = getImagePosition();
  const displaySize = getImageDisplaySize();

  return (
    <div
      ref={containerRef}
      className="relative size-[360px] overflow-hidden bg-white"
      style={{ touchAction: "none", cursor: isDragging ? "grabbing" : "grab" }}
      onMouseDown={handleMouseDown}
      onTouchStart={handleTouchStart}
    >
      {imageLoaded && imageSize && (
        <img
          key={`${imageSrc}-${zoom}-${rotation}`}
          src={imageSrc}
          alt="crop"
          className="absolute select-none pointer-events-none"
          style={{
            width: `${displaySize.width}px`,
            height: `${displaySize.height}px`,
            minWidth: `${displaySize.width}px`,
            minHeight: `${displaySize.height}px`,
            maxWidth: `${displaySize.width}px`,
            maxHeight: `${displaySize.height}px`,
            left: `${imagePosition.x}px`,
            top: `${imagePosition.y}px`,
            transform: `rotate(${rotation}deg)`,
            transformOrigin: "center center",
            imageRendering: "auto",
          }}
          draggable={false}
        />
      )}
      <div
        className="absolute inset-0 border-2 border-white shadow-[0_0_0_9999px_rgba(0,0,0,0.5)] pointer-events-none"
        style={{
          width: `${CROP_SIZE}px`,
          height: `${CROP_SIZE}px`,
        }}
      />
    </div>
  );
}
