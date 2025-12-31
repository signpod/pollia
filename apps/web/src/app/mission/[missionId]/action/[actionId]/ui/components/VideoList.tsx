"use client";

import { MAX_IMAGE_UPLOAD_COUNT } from "@/constants/image";
import { MediaList } from "./MediaList";

interface VideoListProps {
  videoUrls: string[];
  uploadingVideoUrl: string | null;
  isUploading: boolean;
  onVideoDelete: (videoUrl: string) => void;
  onVideoLoadComplete: (videoUrl: string) => void;
}

export function VideoList({
  videoUrls,
  uploadingVideoUrl,
  isUploading,
  onVideoDelete,
  onVideoLoadComplete,
}: VideoListProps) {
  return (
    <MediaList
      mediaUrls={videoUrls}
      uploadingMediaUrl={uploadingVideoUrl}
      isUploading={isUploading}
      maxCount={MAX_IMAGE_UPLOAD_COUNT}
      onMediaDelete={onVideoDelete}
      onMediaLoadComplete={onVideoLoadComplete}
    />
  );
}

