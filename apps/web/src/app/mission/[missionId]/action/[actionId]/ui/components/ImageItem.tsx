"use client";

import { cn } from "@/lib/utils";
import { ButtonV2 } from "@repo/ui/components";
import { Loader2Icon, Trash2 } from "lucide-react";
import Image from "next/image";

interface ImageItemProps {
  imageUrl: string;
  isUploading: boolean;
  onDelete: (imageUrl: string) => void;
  onLoadComplete: () => void;
  alt?: string;
}

export function ImageItem({
  imageUrl,
  isUploading,
  onDelete,
  onLoadComplete,
  alt = "업로드된 이미지",
}: ImageItemProps) {
  return (
    <div className="relative w-full aspect-square rounded-sm overflow-hidden bg-black z-0">
      <Image
        src={imageUrl}
        alt={alt}
        width={400}
        height={400}
        className={cn("w-full h-full object-contain", isUploading && "blur-sm scale-105")}
        onLoadingComplete={onLoadComplete}
      />
      {isUploading && (
        <div className="absolute inset-0 flex items-center justify-center z-30">
          <div className="absolute inset-0 bg-white z-10" />
          <div className="absolute inset-0 bg-black/40 z-20" />
          <Loader2Icon className="size-8 animate-spin text-white z-30" />
        </div>
      )}
      {!isUploading && (
        <ButtonV2
          variant="secondary"
          className="absolute top-2 right-2 size-9 ring-0 z-20"
          onClick={() => onDelete(imageUrl)}
        >
          <Trash2 className="size-4" />
        </ButtonV2>
      )}
    </div>
  );
}
