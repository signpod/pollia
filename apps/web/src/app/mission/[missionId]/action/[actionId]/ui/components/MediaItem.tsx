"use client";

import { cn } from "@/lib/utils";
import { Check, Loader2Icon, XIcon } from "lucide-react";
import Image from "next/image";

interface MediaItemProps {
  mediaUrl: string;
  mediaType: "image" | "video";
  isUploading: boolean;
  onDelete: (mediaUrl: string) => void;
  onLoadComplete: () => void;
  alt?: string;
  isSelected?: boolean;
  onToggle?: (mediaUrl: string) => void;
}

export function MediaItem({
  mediaUrl,
  mediaType,
  isUploading,
  onDelete,
  onLoadComplete,
  alt = "업로드된 미디어",
  isSelected = false,
  onToggle,
}: MediaItemProps) {
  const handleClick = () => {
    if (onToggle && !isUploading) {
      onToggle(mediaUrl);
    }
  };

  return (
    <div
      className={cn(
        "relative w-full aspect-square rounded-sm overflow-hidden bg-black z-0",
        onToggle && !isUploading && "cursor-pointer",
      )}
      onClick={handleClick}
    >
      {mediaType === "image" ? (
        <Image
          src={mediaUrl}
          alt={alt}
          width={400}
          height={400}
          className={cn("w-full h-full object-contain", isUploading && "blur-sm scale-105")}
          onLoadingComplete={onLoadComplete}
        />
      ) : (
        <video
          src={mediaUrl}
          className={cn("w-full h-full object-contain", isUploading && "blur-sm scale-105")}
          controls
          onLoadedData={onLoadComplete}
        >
          <track kind="captions" />
        </video>
      )}
      {isUploading && (
        <div className="absolute inset-0 flex items-center justify-center z-30">
          <div className="absolute inset-0 bg-white z-10" />
          <div className="absolute inset-0 bg-black/40 z-20" />
          <Loader2Icon className="size-8 animate-spin text-white z-30" />
        </div>
      )}
      {!isUploading && (
        <>
          {isSelected && (
            <div className="absolute inset-0 bg-black/40 flex items-center justify-center z-40">
              <Check className="size-6 text-white absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
            </div>
          )}
          <button
            type="button"
            className="absolute top-0 right-0 size-9 flex items-center justify-center bg-black/30 z-40"
            onClick={e => {
              e.stopPropagation();
              onDelete(mediaUrl);
            }}
          >
            <XIcon className="size-4 text-white" />
          </button>
        </>
      )}
    </div>
  );
}
