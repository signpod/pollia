"use client";
import { MediaItem } from "./MediaItem";

interface MediaListProps {
  mediaUrls: string[];
  uploadingMediaUrl?: string | null;
  uploadingMediaUrls?: string[];
  uploadProgress?: number;
  mediaType: "image" | "video";
  onMediaDelete: (mediaUrl: string) => void;
  onMediaLoadComplete: (mediaUrl: string) => void;
  onMediaEdit?: (mediaUrl: string) => void;
  onMediaPreview?: (mediaUrl: string) => void;
  isSingleUploadMode?: boolean;
}

export function MediaList({
  mediaUrls,
  uploadingMediaUrl,
  uploadingMediaUrls = [],
  uploadProgress,
  mediaType,
  onMediaDelete,
  onMediaLoadComplete,
  onMediaEdit,
  onMediaPreview,
  isSingleUploadMode = false,
}: MediaListProps) {
  const isMediaUploading = (url: string) => {
    if (uploadingMediaUrls.includes(url)) return true;
    if (uploadingMediaUrl === url) return true;
    return false;
  };

  if (mediaUrls.length === 0) {
    return null;
  }

  if (isSingleUploadMode && mediaUrls.length > 0) {
    const firstMediaUrl = mediaUrls[0];
    if (!firstMediaUrl) return null;
    const isUploading = isMediaUploading(firstMediaUrl);
    return (
      <MediaItem
        mediaUrl={firstMediaUrl}
        mediaType={mediaType}
        isUploading={isUploading}
        uploadProgress={isUploading ? uploadProgress : undefined}
        onDelete={onMediaDelete}
        onLoadComplete={() => onMediaLoadComplete(firstMediaUrl)}
        onEdit={onMediaEdit}
        onPreview={onMediaPreview}
      />
    );
  }

  return (
    <>
      {mediaUrls.map(mediaUrl => {
        const isUploading = isMediaUploading(mediaUrl);
        return (
          <MediaItem
            key={mediaUrl}
            mediaUrl={mediaUrl}
            mediaType={mediaType}
            isUploading={isUploading}
            uploadProgress={isUploading ? uploadProgress : undefined}
            onDelete={onMediaDelete}
            onLoadComplete={() => onMediaLoadComplete(mediaUrl)}
            onEdit={onMediaEdit}
            onPreview={onMediaPreview}
          />
        );
      })}
    </>
  );
}
