"use client";

import { Button } from "@/app/admin/components/shadcn-ui/button";
import { cn } from "@/app/admin/lib/utils";
import { ImagePlus, X } from "lucide-react";
import { useRef } from "react";

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
      iconSize: "size-6",
      deleteButton: "size-6 -top-2 -right-2",
    },
    medium: {
      container: "size-12",
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

      <Button
        type="button"
        variant="outline"
        size="icon"
        onClick={handleClick}
        disabled={disabled}
        className={cn(
          "relative overflow-hidden rounded-md p-0",
          sizeStyles[size].container,
          hasImage && "border-0 p-0",
          !hasImage && "bg-muted hover:bg-muted/80",
        )}
        aria-label={hasImage ? "이미지 변경" : "이미지 선택"}
      >
        {hasImage ? (
          <img src={imageUrl!} alt="선택된 이미지" className="size-full object-cover" />
        ) : (
          <div className="flex size-full items-center justify-center">
            <ImagePlus className={cn(sizeStyles[size].iconSize, "text-muted-foreground")} />
          </div>
        )}
      </Button>

      {hasImage && onImageDelete && (
        <Button
          type="button"
          variant="destructive"
          size="icon"
          onClick={handleDelete}
          disabled={disabled}
          className={cn(
            "absolute flex items-center justify-center rounded-full",
            sizeStyles[size].deleteButton,
          )}
          aria-label="이미지 삭제"
        >
          <X className="size-3.5" strokeWidth={4} />
        </Button>
      )}
    </div>
  );
}

