"use client";

import { MAX_IMAGE_UPLOAD_COUNT } from "@/constants/image";
import { cn } from "@/lib/utils";
import { Typo } from "@repo/ui/components";
import { Loader2Icon } from "lucide-react";
import { ImageItem } from "./ImageItem";

interface ImageListProps {
  imageUrls: string[];
  uploadingImageUrl: string | null;
  isUploading: boolean;
  onImageDelete: (imageUrl: string) => void;
  onImageLoadComplete: (imageUrl: string) => void;
}

export function ImageList({
  imageUrls,
  uploadingImageUrl,
  isUploading,
  onImageDelete,
  onImageLoadComplete,
}: ImageListProps) {
  if (imageUrls.length === 0) {
    return null;
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="border-t-2 border-divider-default -mx-5" />
      <div className="flex w-full justify-end items-center gap-2">
        <Typo.SubTitle size="large" className={cn(imageUrls.length > 0 && "text-point")}>
          {imageUrls.length}
        </Typo.SubTitle>
        <Typo.SubTitle size="large">/</Typo.SubTitle>
        <Typo.SubTitle size="large">{MAX_IMAGE_UPLOAD_COUNT}</Typo.SubTitle>
      </div>
      <div className="grid grid-cols-3 gap-4 w-full">
        {isUploading && imageUrls.length === 0 && (
          <div className="relative w-full aspect-square rounded-sm overflow-hidden border border-zinc-200 bg-zinc-50 flex items-center justify-center">
            <div className="flex items-center justify-center bg-black/40 absolute inset-0 z-30">
              <Loader2Icon className="size-8 animate-spin text-white" />
            </div>
          </div>
        )}
        {imageUrls.map(imageUrl => (
          <ImageItem
            key={imageUrl}
            imageUrl={imageUrl}
            isUploading={uploadingImageUrl === imageUrl}
            onDelete={onImageDelete}
            onLoadComplete={() => onImageLoadComplete(imageUrl)}
          />
        ))}
      </div>
    </div>
  );
}
