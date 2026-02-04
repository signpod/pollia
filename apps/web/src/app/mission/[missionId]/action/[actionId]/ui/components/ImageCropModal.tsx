"use client";

import { cn } from "@/lib/utils";
import { ButtonV2, Slider, Typo } from "@repo/ui/components";
import { Dialog, DialogOverlay, DialogPortal } from "@repo/ui/components";
import { CustomCropper } from "../CustomCropper";
import { CROP_CONSTANTS } from "../hooks/useImageCrop";

interface ImageCropModalProps {
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

export function ImageCropModal({
  isOpen,
  imageSrc,
  crop,
  zoom,
  rotation,
  onCropChange,
  onZoomChange,
  onRotationChange,
  onCancel,
  onComplete,
}: ImageCropModalProps) {
  return (
    <Dialog
      open={isOpen}
      onOpenChange={open => {
        if (!open) {
          onCancel();
        }
      }}
    >
      <DialogPortal>
        <DialogOverlay onClick={onCancel} />
        <div
          className={cn(
            "fixed top-[50%] left-[50%] z-50 w-[calc(100%-40px)] max-w-md -translate-x-1/2 -translate-y-1/2 rounded-lg bg-white shadow-lg",
            "flex flex-col",
          )}
        >
          <div className="flex items-center justify-between border-b border-divider-default p-4">
            <Typo.MainTitle size="small">이미지 편집</Typo.MainTitle>
          </div>

          <div className="relative flex h-[400px] w-full items-center justify-center">
            <CustomCropper
              imageSrc={imageSrc}
              crop={crop}
              zoom={zoom}
              rotation={rotation}
              onCropChange={onCropChange}
            />
          </div>

          <div className="border-t border-divider-default p-4">
            <div className="mb-4 flex flex-col gap-4">
              <div className="flex items-center gap-3">
                <Typo.Body size="small" className="w-16 text-sub shrink-0">
                  확대/축소
                </Typo.Body>
                <Slider.Root
                  value={[zoom]}
                  onValueChange={values => onZoomChange(values[0] ?? CROP_CONSTANTS.ZOOM_DEFAULT)}
                  min={CROP_CONSTANTS.ZOOM_MIN}
                  max={CROP_CONSTANTS.ZOOM_MAX}
                  step={0.1}
                  className="relative flex h-5 w-full touch-none select-none items-center"
                >
                  <Slider.Track className="relative h-1.5 w-full grow overflow-hidden rounded-full bg-divider-default">
                    <Slider.Range className="absolute h-full bg-primary" />
                  </Slider.Track>
                  <Slider.Thumb className="block size-5 rounded-full border-2 border-white bg-white shadow-effect-default transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-500 focus-visible:ring-offset-2" />
                </Slider.Root>
                <Typo.Body size="small" className="w-10 shrink-0 text-right text-sub">
                  {Math.round(zoom * 100)}%
                </Typo.Body>
              </div>
              <div className="flex items-center gap-3">
                <Typo.Body size="small" className="w-16 text-sub shrink-0">
                  회전
                </Typo.Body>
                <Slider.Root
                  value={[rotation]}
                  onValueChange={values =>
                    onRotationChange(values[0] ?? CROP_CONSTANTS.ROTATION_DEFAULT)
                  }
                  min={CROP_CONSTANTS.ROTATION_MIN}
                  max={CROP_CONSTANTS.ROTATION_MAX}
                  step={1}
                  className="relative flex h-5 w-full touch-none select-none items-center"
                >
                  <Slider.Track className="relative h-1.5 w-full grow overflow-hidden rounded-full bg-divider-default">
                    <Slider.Range className="absolute h-full bg-primary" />
                  </Slider.Track>
                  <Slider.Thumb className="block size-5 rounded-full border-2 border-white bg-white shadow-effect-default transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-500 focus-visible:ring-offset-2" />
                </Slider.Root>
                <Typo.Body size="small" className="w-12 shrink-0 text-right text-sub">
                  {rotation}°
                </Typo.Body>
              </div>
            </div>

            <div className="flex w-full gap-3">
              <ButtonV2
                variant="secondary"
                onClick={onCancel}
                className="flex-1 touch-manipulation"
              >
                <div className="flex justify-center items-center text-center flex-1">취소</div>
              </ButtonV2>
              <ButtonV2
                variant="primary"
                onClick={onComplete}
                className="flex-1 touch-manipulation"
              >
                <div className="flex justify-center items-center text-center flex-1">완료</div>
              </ButtonV2>
            </div>
          </div>
        </div>
      </DialogPortal>
    </Dialog>
  );
}
