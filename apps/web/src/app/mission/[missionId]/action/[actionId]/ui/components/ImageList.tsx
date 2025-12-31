"use client";

import { MAX_IMAGE_UPLOAD_COUNT } from "@/constants/image";
import { cn } from "@/lib/utils";
import { Typo } from "@repo/ui/components";
import { MediaList } from "./MediaList";

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
      <MediaList
        mediaUrls={imageUrls}
        uploadingMediaUrl={uploadingImageUrl}
        isUploading={isUploading}
        mediaType="image"
        onMediaDelete={onImageDelete}
        onMediaLoadComplete={onImageLoadComplete}
      />
    </div>
  );
}
