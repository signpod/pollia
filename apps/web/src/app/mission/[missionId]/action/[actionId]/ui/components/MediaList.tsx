"use client";

import { cn } from "@/lib/utils";
import { Typo } from "@repo/ui/components";
import { Loader2Icon } from "lucide-react";
import { ImageItem } from "./ImageItem";

interface MediaListProps {
  mediaUrls: string[];
  uploadingMediaUrl: string | null;
  isUploading: boolean;
  maxCount: number;
  onMediaDelete: (mediaUrl: string) => void;
  onMediaLoadComplete: (mediaUrl: string) => void;
}

export function MediaList({
  mediaUrls,
  uploadingMediaUrl,
  isUploading,
  maxCount,
  onMediaDelete,
  onMediaLoadComplete,
}: MediaListProps) {
  if (mediaUrls.length === 0) {
    return null;
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="border-t-2 border-divider-default -mx-5" />
      <div className="flex w-full justify-end items-center gap-2">
        <Typo.SubTitle size="large" className={cn(mediaUrls.length > 0 && "text-point")}>
          {mediaUrls.length}
        </Typo.SubTitle>
        <Typo.SubTitle size="large">/</Typo.SubTitle>
        <Typo.SubTitle size="large">{maxCount}</Typo.SubTitle>
      </div>
      <div className="grid grid-cols-3 gap-4 w-full">
        {isUploading && mediaUrls.length === 0 && (
          <div className="relative w-full aspect-square rounded-sm overflow-hidden border border-zinc-200 bg-white">
            <div className="absolute inset-0 bg-black/40 z-20" />
            <div className="absolute inset-0 flex items-center justify-center z-30">
              <Loader2Icon className="size-8 animate-spin text-white" />
            </div>
          </div>
        )}
        {mediaUrls.map(mediaUrl => (
          <ImageItem
            key={mediaUrl}
            imageUrl={mediaUrl}
            isUploading={uploadingMediaUrl === mediaUrl}
            onDelete={onMediaDelete}
            onLoadComplete={() => onMediaLoadComplete(mediaUrl)}
          />
        ))}
      </div>
    </div>
  );
}
