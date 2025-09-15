"use client";

import { cn } from "../../lib/utils";
import { ImagePlus, X } from "lucide-react";

export type ImageSelectorSize = "large" | "medium";

export interface ImageSelectorProps {
  size?: ImageSelectorSize;
  imageUrl?: string;
  onImageSelect?: () => void;
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
    onImageSelect?.();
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (disabled) return;
    onImageDelete?.();
  };

  return (
    <div className={cn("relative inline-block align-top", className)}>
      <button
        onClick={handleClick}
        disabled={disabled}
        className={cn(
          "relative overflow-hidden rounded block",
          sizeStyles[size].container,
          hasImage ? "border-transparent bg-gray-100" : "bg-gray-50",
          disabled && "cursor-not-allowed opacity-50",
          !disabled && "cursor-pointer"
        )}
      >
        {hasImage ? (
          <img
            src={imageUrl!}
            alt="선택된 이미지"
            className="size-full object-cover"
          />
        ) : (
          <div
            className={cn(
              "flex items-center justify-center",
              sizeStyles[size].padding
            )}
          >
            <ImagePlus
              className={cn(sizeStyles[size].iconSize, "text-zinc-400")}
            />
          </div>
        )}
      </button>

      {hasImage && onImageDelete && (
        <button
          onClick={handleDelete}
          disabled={disabled}
          className={cn(
            "absolute flex items-center justify-center rounded-full bg-zinc-950 text-white",
            sizeStyles[size].deleteButton,
            disabled && "cursor-not-allowed opacity-50",
            "hover:cursor-pointer"
          )}
        >
          <X className="size-3.5" strokeWidth={4} />
        </button>
      )}
    </div>
  );
}
