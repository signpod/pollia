"use client";

import { useRef } from "react";
import { ImagePlus, X } from "lucide-react";
import { cn } from "../../lib/utils";

export type ImageSelectorSize = "large" | "medium";

export interface ImageSelectorProps {
  size?: ImageSelectorSize;
  imageUrl?: string;
  onImageSelect?: (file: File) => void;
  onImageDelete?: () => void;
  disabled?: boolean;
  className?: string;
}

export function ImageSelector({
  size = "large",
  imageUrl,
  onImageSelect,
  onImageDelete,
  disabled = false,
  className,
}: ImageSelectorProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const hasImage = !!imageUrl;

  const sizeStyles = {
    large: {
      container: "size-[72px]",
      padding: "p-6",
      iconSize: "size-6",
      deleteButton: "size-6 -top-2 -right-2",
    },
    medium: {
      container: "size-12",
      padding: "p-3",
      iconSize: "size-6",
      deleteButton: "size-5 -top-1.5 -right-1.5",
    },
  };

  const handleClick = () => {
    if (disabled) return;
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && onImageSelect) {
      onImageSelect(file);
    }
    // Reset input value to allow selecting the same file again
    e.target.value = "";
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (disabled) return;
    onImageDelete?.();
  };

  return (
    <div className={cn("relative h-fit w-fit align-top", className)}>
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        disabled={disabled}
        className="hidden"
        aria-label="이미지 파일 선택"
      />

      <button
        onClick={handleClick}
        disabled={disabled}
        type="button"
        className={cn(
          "relative block overflow-hidden rounded",
          sizeStyles[size].container,
          hasImage ? "border-transparent bg-gray-100" : "bg-gray-50",
          disabled && "cursor-not-allowed opacity-50",
          !disabled && "cursor-pointer",
        )}
        aria-label={hasImage ? "이미지 변경" : "이미지 선택"}
      >
        {hasImage ? (
          <img src={imageUrl!} alt="선택된 이미지" className="size-full object-cover" />
        ) : (
          <div className={cn("flex items-center justify-center", sizeStyles[size].padding)}>
            <ImagePlus className={cn(sizeStyles[size].iconSize, "text-zinc-400")} />
          </div>
        )}
      </button>

      {hasImage && onImageDelete && (
        <button
          onClick={handleDelete}
          disabled={disabled}
          type="button"
          className={cn(
            "absolute flex items-center justify-center rounded-full bg-zinc-950 text-white",
            sizeStyles[size].deleteButton,
            disabled && "cursor-not-allowed opacity-50",
            "hover:cursor-pointer",
          )}
          aria-label="이미지 삭제"
        >
          <X className="size-3.5" strokeWidth={4} />
        </button>
      )}
    </div>
  );
}
