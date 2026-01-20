"use client";

import { cn } from "@/lib/utils";
import { Typo } from "@repo/ui/components";
import { XIcon } from "lucide-react";
import Image from "next/image";

interface CircularProgressProps {
  progress: number;
  size?: number;
  strokeWidth?: number;
}

function CircularProgress({ progress, size = 48, strokeWidth = 4 }: CircularProgressProps) {
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const offset = circumference - (progress / 100) * circumference;

  return (
    <svg width={size} height={size} className="transform -rotate-90">
      <circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        fill="none"
        stroke="rgba(255, 255, 255, 0.3)"
        strokeWidth={strokeWidth}
      />
      <circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        fill="none"
        stroke="white"
        strokeWidth={strokeWidth}
        strokeDasharray={circumference}
        strokeDashoffset={offset}
        strokeLinecap="round"
        className="transition-all duration-200 ease-out"
      />
    </svg>
  );
}

interface MediaItemProps {
  mediaUrl: string;
  mediaType: "image" | "video";
  isUploading: boolean;
  uploadProgress?: number;
  onDelete: (mediaUrl: string) => void;
  onLoadComplete: () => void;
  onEdit?: (mediaUrl: string) => void;
  onPreview?: (mediaUrl: string) => void;
  alt?: string;
}

export function MediaItem({
  mediaUrl,
  mediaType,
  isUploading,
  uploadProgress = 0,
  onDelete,
  onLoadComplete,
  onEdit,
  onPreview,
  alt = "업로드된 미디어",
}: MediaItemProps) {
  return (
    <div className="relative w-full aspect-square rounded-2xl overflow-hidden bg-zinc-300 z-0 border border-default">
      {mediaType === "image" ? (
        <Image
          src={mediaUrl}
          alt={alt}
          width={400}
          height={400}
          className={cn("w-full h-full object-cover", isUploading && "blur-sm scale-105")}
          onLoadingComplete={onLoadComplete}
        />
      ) : (
        <video
          src={mediaUrl}
          className={cn(
            "w-full h-full object-cover pointer-events-none",
            isUploading && "blur-sm scale-105",
          )}
          playsInline
          muted
          preload="metadata"
          onLoadedMetadata={onLoadComplete}
          onError={onLoadComplete}
        >
          <track kind="captions" />
        </video>
      )}
      {isUploading && (
        <div className="absolute inset-0 flex items-center justify-center z-30">
          <div className="absolute inset-0 bg-zinc-300 z-10" />
          <CircularProgress progress={uploadProgress} />
        </div>
      )}
      {!isUploading && (
        <>
          <button
            type="button"
            className="absolute top-2 right-2 size-6 flex items-center justify-center bg-black rounded-full z-40"
            onClick={e => {
              e.stopPropagation();
              onDelete(mediaUrl);
            }}
          >
            <XIcon className="size-4 text-white stroke-[2px]" />
          </button>
          {onEdit && mediaType === "image" && (
            <button
              type="button"
              className="absolute bottom-0 left-0 right-0 flex items-center justify-center py-2.5 bg-black/40 z-40"
              onClick={e => {
                e.stopPropagation();
                onEdit(mediaUrl);
              }}
            >
              <Typo.ButtonText size="medium" className="text-white">
                편집
              </Typo.ButtonText>
            </button>
          )}
          {onPreview && mediaType === "video" && (
            <button
              type="button"
              className="absolute bottom-0 left-0 right-0 flex items-center justify-center py-2.5 bg-black/40 z-40"
              onClick={e => {
                e.stopPropagation();
                onPreview(mediaUrl);
              }}
            >
              <Typo.ButtonText size="medium" className="text-white">
                미리보기
              </Typo.ButtonText>
            </button>
          )}
        </>
      )}
    </div>
  );
}
