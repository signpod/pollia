"use client";

import { Button } from "@/app/admin/components/shadcn-ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/app/admin/components/shadcn-ui/dialog";
import { Slider } from "@/app/admin/components/shadcn-ui/slider";
import { createCroppedImageFile } from "@/app/admin/lib/image-crop";
import { useCallback, useEffect, useState } from "react";
import Cropper, { type Area, type Point } from "react-easy-crop";

interface AdminImageCropDialogProps {
  open: boolean;
  imageSrc: string | null;
  aspect: number;
  title: string;
  description?: string;
  fileName: string;
  onOpenChange: (open: boolean) => void;
  onConfirm: (file: File) => void | Promise<void>;
}

const DEFAULT_ZOOM = 1;
const MIN_ZOOM = 1;
const MAX_ZOOM = 3;

export function AdminImageCropDialog({
  open,
  imageSrc,
  aspect,
  title,
  description,
  fileName,
  onOpenChange,
  onConfirm,
}: AdminImageCropDialogProps) {
  const [crop, setCrop] = useState<Point>({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(DEFAULT_ZOOM);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (open) {
      setCrop({ x: 0, y: 0 });
      setZoom(DEFAULT_ZOOM);
      setCroppedAreaPixels(null);
    }
  }, [open]);

  const handleCropComplete = useCallback((_croppedArea: Area, areaPixels: Area) => {
    setCroppedAreaPixels(areaPixels);
  }, []);

  const handleConfirm = useCallback(async () => {
    if (!imageSrc || !croppedAreaPixels) {
      return;
    }

    setIsSubmitting(true);
    try {
      const croppedFile = await createCroppedImageFile({
        imageSrc,
        croppedAreaPixels,
        fileName,
      });
      await onConfirm(croppedFile);
      onOpenChange(false);
    } finally {
      setIsSubmitting(false);
    }
  }, [croppedAreaPixels, fileName, imageSrc, onConfirm, onOpenChange]);

  return (
    <Dialog open={open} onOpenChange={nextOpen => !isSubmitting && onOpenChange(nextOpen)}>
      <DialogContent
        showCloseButton={!isSubmitting}
        className="max-w-2xl data-[state=open]:animate-none data-[state=closed]:animate-none"
      >
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          {description ? <DialogDescription>{description}</DialogDescription> : null}
        </DialogHeader>

        <div className="space-y-4">
          <div className="relative h-[50vh] min-h-[280px] w-full overflow-hidden rounded-md bg-black">
            {imageSrc ? (
              <Cropper
                image={imageSrc}
                crop={crop}
                zoom={zoom}
                aspect={aspect}
                minZoom={MIN_ZOOM}
                maxZoom={MAX_ZOOM}
                zoomWithScroll={false}
                showGrid
                restrictPosition
                onCropChange={setCrop}
                onCropComplete={handleCropComplete}
                onZoomChange={setZoom}
              />
            ) : null}
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">확대</span>
              <span className="text-sm text-muted-foreground">{Math.round(zoom * 100)}%</span>
            </div>
            <Slider
              min={MIN_ZOOM}
              max={MAX_ZOOM}
              step={0.01}
              value={[zoom]}
              onValueChange={values => setZoom(values[0] ?? DEFAULT_ZOOM)}
              disabled={isSubmitting}
              aria-label="이미지 확대 조절"
            />
          </div>
        </div>

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            disabled={isSubmitting}
            onClick={() => onOpenChange(false)}
          >
            취소
          </Button>
          <Button
            type="button"
            disabled={isSubmitting || !imageSrc || !croppedAreaPixels}
            onClick={handleConfirm}
          >
            {isSubmitting ? "적용 중..." : "적용"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
