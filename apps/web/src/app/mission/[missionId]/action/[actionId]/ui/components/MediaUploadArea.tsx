"use client";

import { cn } from "@/lib/utils";
import { Typo } from "@repo/ui/components";
import { FolderPlus, ImageIcon, VideoIcon } from "lucide-react";

interface MediaUploadAreaProps {
  inputRef: React.RefObject<HTMLInputElement | null>;
  isUploading: boolean;
  onFileSelect: () => void;
  onFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  accept?: string;
  buttonText?: string;
  icon?: "image" | "video" | "file";
}

export function MediaUploadArea({
  inputRef,
  isUploading,
  onFileSelect,
  onFileChange,
  accept = "image/*,.heic,.heif",
  buttonText = "사진 첨부",
  icon = "image",
}: MediaUploadAreaProps) {
  const ICON_COMPONENTS = {
    video: VideoIcon,
    image: ImageIcon,
    file: FolderPlus,
  };

  const IconComponent = ICON_COMPONENTS[icon];

  return (
    <div className="flex flex-col gap-2 w-full relative rounded-sm overflow-hidden min-h-[96px]">
      <input
        ref={inputRef}
        type="file"
        accept={accept}
        className="hidden"
        onChange={onFileChange}
        disabled={isUploading}
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
          "absolute inset-0 flex items-center justify-center gap-3 border border-dashed bg-white border-zinc-300 rounded-sm w-full",
          "hover:bg-zinc-50 active:bg-zinc-100",
          "transition-colors duration-200 ease-in-out",
          "touch-manipulation",
          isUploading && "opacity-50 cursor-not-allowed",
        )}
      >
        <div className="flex items-center justify-center size-12 bg-light rounded-full">
          <IconComponent className="size-6 text-info" />
        </div>

        <Typo.ButtonText size="large" className="text-info">
          {buttonText}
        </Typo.ButtonText>
      </button>
    </div>
  );
}
