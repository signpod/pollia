"use client";
import { MediaItem } from "./MediaItem";

interface MediaListProps {
  mediaUrls: string[];
  uploadingMediaUrl: string | null;
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
  uploadProgress,
  mediaType,
  onMediaDelete,
  onMediaLoadComplete,
  onMediaEdit,
  onMediaPreview,
  isSingleUploadMode = false,
}: MediaListProps) {
  if (mediaUrls.length === 0) {
    return null;
  }

  if (isSingleUploadMode && mediaUrls.length > 0) {
    const firstMediaUrl = mediaUrls[0];
    if (!firstMediaUrl) return null;
    return (
      <MediaItem
        mediaUrl={firstMediaUrl}
        mediaType={mediaType}
        isUploading={uploadingMediaUrl === firstMediaUrl}
        uploadProgress={uploadingMediaUrl === firstMediaUrl ? uploadProgress : undefined}
        onDelete={onMediaDelete}
        onLoadComplete={() => onMediaLoadComplete(firstMediaUrl)}
        onEdit={onMediaEdit}
        onPreview={onMediaPreview}
      />
    );
  }

  return (
    <>
      {mediaUrls.map(mediaUrl => (
        <MediaItem
          key={mediaUrl}
          mediaUrl={mediaUrl}
          mediaType={mediaType}
          isUploading={uploadingMediaUrl === mediaUrl}
          uploadProgress={uploadingMediaUrl === mediaUrl ? uploadProgress : undefined}
          onDelete={onMediaDelete}
          onLoadComplete={() => onMediaLoadComplete(mediaUrl)}
          onEdit={onMediaEdit}
          onPreview={onMediaPreview}
        />
      ))}
    </>
  );
}
