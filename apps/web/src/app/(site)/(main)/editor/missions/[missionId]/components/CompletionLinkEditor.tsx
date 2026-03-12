"use client";

import { STORAGE_BUCKETS } from "@/constants/buckets";
import { useUploadImage } from "@/hooks/image";
import { useEffect, useMemo } from "react";
import { CompletionLinkItem } from "./CompletionLinkItem";

interface CompletionLinkEditorProps {
  linkIndex: number;
  name: string;
  url: string;
  imageUrl: string | null;
  isOpen: boolean;
  disabled: boolean;
  nameError?: string;
  urlError?: string;
  onNameChange: (value: string) => void;
  onUrlChange: (value: string) => void;
  onImageChange: (imageUrl: string | null, fileUploadId: string | null) => void;
  onIsUploadingChange: (isUploading: boolean) => void;
  onToggle: () => void;
  onDelete: () => void;
}

export function CompletionLinkEditor({
  linkIndex,
  name,
  url,
  imageUrl,
  isOpen,
  disabled,
  nameError,
  urlError,
  onNameChange,
  onUrlChange,
  onImageChange,
  onIsUploadingChange,
  onToggle,
  onDelete,
}: CompletionLinkEditorProps) {
  const imageUpload = useUploadImage({
    bucket: STORAGE_BUCKETS.MISSION_IMAGES,
    onUploadSuccess: data => {
      onImageChange(data.publicUrl, data.fileUploadId);
    },
  });

  useEffect(() => {
    onIsUploadingChange(imageUpload.isUploading);
  }, [imageUpload.isUploading, onIsUploadingChange]);

  const previewUrl = useMemo(
    () => imageUpload.previewUrl ?? imageUrl ?? undefined,
    [imageUpload.previewUrl, imageUrl],
  );

  const handleImageDelete = () => {
    imageUpload.discard();
    onImageChange(null, null);
  };

  return (
    <CompletionLinkItem
      index={linkIndex}
      name={name}
      url={url}
      previewImageUrl={previewUrl}
      isOpen={isOpen}
      disabled={disabled}
      isImageUploading={imageUpload.isUploading}
      nameError={nameError}
      urlError={urlError}
      onToggle={onToggle}
      onNameChange={onNameChange}
      onUrlChange={onUrlChange}
      onImageSelect={file => imageUpload.upload(file)}
      onImageDelete={handleImageDelete}
      onDelete={onDelete}
    />
  );
}
