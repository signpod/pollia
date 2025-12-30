"use client";

import { cn } from "@/lib/utils";
import { Typo } from "@repo/ui/components";
import { ImageIcon } from "lucide-react";
interface ImageUploadAreaProps {
  inputRef: React.RefObject<HTMLInputElement | null>;
  isUploading: boolean;
  onFileSelect: () => void;
  onFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export function ImageUploadArea({
  inputRef,
  isUploading,
  onFileSelect,
  onFileChange,
}: ImageUploadAreaProps) {
  return (
    <div className="flex flex-col gap-2 w-full relative rounded-sm overflow-hidden min-h-[144px]">
      <input
        ref={inputRef}
        type="file"
        accept="image/*,.heic,.heif"
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
          "absolute inset-0 flex flex-col items-center justify-center gap-3 border border-dashed bg-white border-zinc-300 rounded-sm w-full",
          "hover:bg-zinc-50 active:bg-zinc-100",
          "transition-colors duration-200 ease-in-out",
          "touch-manipulation",
          isUploading && "opacity-50 cursor-not-allowed",
        )}
      >
        <div className="flex items-center justify-center size-12 bg-light rounded-full">
          <ImageIcon className="size-6 text-info" />
        </div>

        <Typo.ButtonText size="large" className="text-info">
          사진 첨부
        </Typo.ButtonText>
      </button>
    </div>
  );
}
