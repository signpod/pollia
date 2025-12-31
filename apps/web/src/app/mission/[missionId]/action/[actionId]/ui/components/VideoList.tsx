"use client";

import { MAX_VIDEO_UPLOAD_COUNT } from "@/constants/video";
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
      isSingleUploadMode={true}
      mediaUrls={videoUrls}
      uploadingMediaUrl={uploadingVideoUrl}
      isUploading={isUploading}
      maxCount={MAX_VIDEO_UPLOAD_COUNT}
      mediaType="video"
      onMediaDelete={onVideoDelete}
      onMediaLoadComplete={onVideoLoadComplete}
    />
  );
}
