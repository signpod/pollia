"use client";

import { cn } from "@/lib/utils";
import { ButtonV2 } from "@repo/ui/components";
import { Loader2Icon, Trash2 } from "lucide-react";
import Image from "next/image";

interface MediaItemProps {
  mediaUrl: string;
  mediaType: "image" | "video";
  isUploading: boolean;
  onDelete: (mediaUrl: string) => void;
  onLoadComplete: () => void;
  alt?: string;
}

export function MediaItem({
  mediaUrl,
  mediaType,
  isUploading,
  onDelete,
  onLoadComplete,
  alt = "업로드된 미디어",
}: MediaItemProps) {
  return (
    <div className="relative w-full aspect-square rounded-sm overflow-hidden bg-black z-0">
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
        <ButtonV2
          variant="secondary"
          className="absolute top-2 right-2 size-9 ring-0 z-20"
          onClick={() => onDelete(mediaUrl)}
        >
          <Trash2 className="size-4" />
        </ButtonV2>
      )}
    </div>
  );
}
