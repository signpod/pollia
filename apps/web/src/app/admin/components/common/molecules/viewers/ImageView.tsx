"use client";

import { cn } from "@/app/admin/lib/utils";
import { ImageIcon } from "lucide-react";
import Image from "next/image";

type ImageSize = "sm" | "md" | "lg";

interface ImageViewProps {
  src?: string | null;
  alt?: string;
  size?: ImageSize;
  placeholder?: string;
  className?: string;
}

const sizeConfig: Record<ImageSize, { width: number; height: number; containerClass: string }> = {
  sm: { width: 80, height: 80, containerClass: "h-20 w-20" },
  md: { width: 150, height: 150, containerClass: "h-32 w-auto max-w-full" },
  lg: { width: 200, height: 200, containerClass: "h-48 w-auto max-w-full" },
};

export function ImageView({
  src,
  alt = "이미지",
  size = "md",
  placeholder = "이미지 없음",
  className,
}: ImageViewProps) {
  const config = sizeConfig[size];

  if (!src) {
    return (
      <div
        className={cn(
          "flex flex-col items-center justify-center border-2 border-dashed rounded-lg bg-muted/20",
          config.containerClass,
          className,
        )}
      >
        <ImageIcon className="h-8 w-8 text-muted-foreground/30 mb-1" />
        <span className="text-xs text-muted-foreground">{placeholder}</span>
      </div>
    );
  }

  return (
    <Image
      src={src}
      alt={alt}
      width={config.width}
      height={config.height}
      className={cn("rounded-lg border object-contain", config.containerClass, className)}
      loading="lazy"
    />
  );
}
