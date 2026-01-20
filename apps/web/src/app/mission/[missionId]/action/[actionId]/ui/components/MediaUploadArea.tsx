"use client";

import { cn } from "@/lib/utils";
import CameraIcon from "@public/svgs/camera-color-icon.svg";
import PdfIcon from "@public/svgs/pdf-color-icon.svg";
import VideoIcon from "@public/svgs/video-color-icon.svg";
import { Typo } from "@repo/ui/components";
import { Loader2Icon } from "lucide-react";

const UPLOAD_LABELS = {
  uploading: "업로드 중...",
} as const;

interface MediaUploadAreaProps {
  inputRef: React.RefObject<HTMLInputElement | null>;
  isUploading: boolean;
  onFileSelect: () => void;
  onFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  accept?: string;
  buttonText?: string;
  icon?: "image" | "video" | "file";
  multiple?: boolean;
  variant?: "button" | "counter";
  currentCount?: number;
  maxCount?: number;
}

export function MediaUploadArea({
  inputRef,
  isUploading,
  onFileSelect,
  onFileChange,
  accept = "image/*,.heic,.heif",
  buttonText = "사진 첨부",
  icon = "image",
  multiple = false,
  variant = "button",
  currentCount = 0,
  maxCount = 1,
}: MediaUploadAreaProps) {
  const ICON_COMPONENTS = {
    video: VideoIcon,
    image: CameraIcon,
    file: PdfIcon,
  };

  const IconComponent = ICON_COMPONENTS[icon];
  const isMaxReached = variant === "counter" && currentCount >= maxCount;

  if (variant === "counter") {
    const isMediaType = icon === "image" || icon === "video";

    return (
      <div className={cn("flex flex-col", isMediaType ? "aspect-square" : "w-full")}>
        <input
          ref={inputRef}
          type="file"
          accept={accept}
          className="hidden"
          onChange={onFileChange}
          disabled={isUploading || isMaxReached}
          multiple={multiple}
        />
        <button
          onClick={onFileSelect}
          onTouchStart={e => {
            e.preventDefault();
            onFileSelect();
          }}
          type="button"
          disabled={isUploading || isMaxReached}
          className={cn(
            "flex flex-col items-center justify-center gap-1 rounded-2xl w-full h-full",
            "border border-zinc-200 bg-white",
            "transition-colors duration-200 ease-in-out",
            "touch-manipulation",
            !isMediaType && "py-6",
            isMaxReached ? "cursor-default" : "hover:bg-zinc-50 active:bg-zinc-100",
          )}
        >
          <div className="flex items-center justify-center size-14 bg-zinc-100 rounded-full">
            <IconComponent className="size-7" />
          </div>
          <div className="flex items-center gap-1">
            <Typo.SubTitle
              size="large"
              className={cn(currentCount > 0 ? "text-primary" : "text-zinc-400")}
            >
              {currentCount}
            </Typo.SubTitle>
            <Typo.SubTitle size="large" className="text-zinc-800">
              / {maxCount}
            </Typo.SubTitle>
          </div>
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-2 w-full relative rounded-sm overflow-hidden min-h-[96px]">
      <input
        ref={inputRef}
        type="file"
        accept={accept}
        className="hidden"
        onChange={onFileChange}
        disabled={isUploading}
        multiple={multiple}
      />
      <button
        onClick={onFileSelect}
        onTouchStart={e => {
          e.preventDefault();
          onFileSelect();
        }}
        type="button"
        disabled={isUploading}
        className={cn(
          "absolute inset-0 flex items-center justify-center gap-3 bg-transparent rounded-lg w-full",
          "border border-default",
          "hover:bg-zinc-50 active:bg-zinc-100",
          "transition-colors duration-200 ease-in-out",
          "touch-manipulation",
          isUploading && "cursor-not-allowed",
        )}
      >
        {isUploading ? (
          <div className="flex items-center justify-center w-full gap-1">
            <Loader2Icon className="size-4 text-icon-sub animate-spin shrink-0" />
            <Typo.Body size="medium" className="text-info">
              {UPLOAD_LABELS.uploading}
            </Typo.Body>
          </div>
        ) : (
          <>
            <div className="flex items-center justify-center size-12 bg-light rounded-full">
              <IconComponent className="size-6 text-info" />
            </div>
            <Typo.ButtonText size="large" className="text-info">
              {buttonText}
            </Typo.ButtonText>
          </>
        )}
      </button>
    </div>
  );
}
