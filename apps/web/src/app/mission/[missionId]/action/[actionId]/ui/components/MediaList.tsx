"use client";
import { Loader2Icon } from "lucide-react";
import { MediaItem } from "./MediaItem";

interface MediaListProps {
  mediaUrls: string[];
  uploadingMediaUrl: string | null;
  isUploading: boolean;
  mediaType: "image" | "video";
  onMediaDelete: (mediaUrl: string) => void;
  onMediaLoadComplete: (mediaUrl: string) => void;
  isSingleUploadMode?: boolean;
  selectedMediaUrl?: string;
  onMediaToggle?: (mediaUrl: string) => void;
}

export function MediaList({
  mediaUrls,
  uploadingMediaUrl,
  isUploading,
  mediaType,
  onMediaDelete,
  onMediaLoadComplete,
  isSingleUploadMode = false,
  selectedMediaUrl,
  onMediaToggle,
}: MediaListProps) {
  if (mediaUrls.length === 0) {
    return null;
  }

  if (isSingleUploadMode && mediaUrls.length > 0) {
    const firstMediaUrl = mediaUrls[0];
    if (!firstMediaUrl) return null;
    return (
      <div className="relative w-full aspect-square rounded-sm overflow-hidden border border-zinc-200 bg-white">
        <MediaItem
          mediaUrl={firstMediaUrl}
          mediaType={mediaType}
          isUploading={uploadingMediaUrl === firstMediaUrl}
          onDelete={onMediaDelete}
          onLoadComplete={() => onMediaLoadComplete(firstMediaUrl)}
          isSelected={selectedMediaUrl === firstMediaUrl}
          onToggle={onMediaToggle}
        />
      </div>
    );
  }

  return (
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
        <MediaItem
          key={mediaUrl}
          mediaUrl={mediaUrl}
          mediaType={mediaType}
          isUploading={uploadingMediaUrl === mediaUrl}
          onDelete={onMediaDelete}
          onLoadComplete={() => onMediaLoadComplete(mediaUrl)}
          isSelected={selectedMediaUrl === mediaUrl}
          onToggle={onMediaToggle}
        />
      ))}
    </div>
  );
}
