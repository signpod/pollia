"use client";

import { MediaList } from "../common/MediaList";

interface VideoListProps {
  videoUrls: string[];
  uploadingVideoUrl: string | null;
  uploadProgress?: number;
  onVideoDelete: (videoUrl: string) => void;
  onVideoLoadComplete: (videoUrl: string) => void;
  onVideoPreview?: (videoUrl: string) => void;
}

export function VideoList({
  videoUrls,
  uploadingVideoUrl,
  uploadProgress,
  onVideoDelete,
  onVideoLoadComplete,
  onVideoPreview,
}: VideoListProps) {
  return (
    <MediaList
      mediaUrls={videoUrls}
      uploadingMediaUrl={uploadingVideoUrl}
      uploadProgress={uploadProgress}
      mediaType="video"
      onMediaDelete={onVideoDelete}
      onMediaLoadComplete={onVideoLoadComplete}
      onMediaPreview={onVideoPreview}
    />
  );
}
