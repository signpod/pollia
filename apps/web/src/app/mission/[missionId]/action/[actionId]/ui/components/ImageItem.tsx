"use client";

import { ButtonV2 } from "@repo/ui/components";
import { Loader2Icon, Trash2 } from "lucide-react";
import Image from "next/image";

interface ImageItemProps {
  imageUrl: string;
  isUploading: boolean;
  onDelete: (imageUrl: string) => void;
  onLoadComplete: () => void;
}

export function ImageItem({ imageUrl, isUploading, onDelete, onLoadComplete }: ImageItemProps) {
  return (
    <div className="relative w-full aspect-square rounded-sm overflow-hidden">
      {isUploading && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/40 z-30">
          <Loader2Icon className="size-8 animate-spin text-white" />
        </div>
      )}
      {!isUploading && (
        <ButtonV2
          variant="secondary"
          className="absolute top-2 right-2 size-9 border-none"
          onClick={() => onDelete(imageUrl)}
        >
          <Trash2 className="size-4" />
        </ButtonV2>
      )}
      <Image
        src={imageUrl}
        alt="uploaded image"
        width={400}
        height={400}
        className="w-full h-full object-contain"
        onLoadingComplete={onLoadComplete}
      />
    </div>
  );
}

