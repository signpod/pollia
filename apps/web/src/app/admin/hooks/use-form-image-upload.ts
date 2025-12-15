"use client";

import { STORAGE_BUCKETS, type StorageBucket } from "@/constants/buckets";
import { useImageUpload } from "@/hooks/common/useImageUpload";
import { useEffect, useState } from "react";
import type { FieldPath, FieldValues, UseFormReturn } from "react-hook-form";
import { toast } from "sonner";

interface UseFormImageUploadOptions<TFieldValues extends FieldValues> {
  form: UseFormReturn<TFieldValues>;
  urlField: FieldPath<TFieldValues>;
  fileUploadIdField: FieldPath<TFieldValues>;
  bucket?: StorageBucket;
  errorMessage?: string;
}

export function useFormImageUpload<TFieldValues extends FieldValues>({
  form,
  urlField,
  fileUploadIdField,
  bucket = STORAGE_BUCKETS.MISSION_IMAGES,
  errorMessage = "이미지 업로드 실패",
}: UseFormImageUploadOptions<TFieldValues>) {
  const [preview, setPreview] = useState<string>("");
  const [file, setFile] = useState<{ path: string; fileUploadId: string } | null>(null);

  const upload = useImageUpload({
    bucket,
    onSuccess: result => {
      form.setValue(urlField, result.publicUrl as TFieldValues[typeof urlField], {
        shouldDirty: true,
      });
      form.setValue(
        fileUploadIdField,
        result.fileUploadId as TFieldValues[typeof fileUploadIdField],
        {
          shouldDirty: true,
        },
      );
      setFile({ path: result.path, fileUploadId: result.fileUploadId });
      if (preview) {
        URL.revokeObjectURL(preview);
        setPreview("");
      }
    },
    onError: error => {
      console.error(`${errorMessage}:`, error);
      toast.error(errorMessage, { description: error.message });
      if (preview) {
        URL.revokeObjectURL(preview);
        setPreview("");
      }
    },
  });

  useEffect(() => {
    return () => {
      if (preview) URL.revokeObjectURL(preview);
    };
  }, [preview]);

  const handleSelect = (selectedFile: File) => {
    if (preview) URL.revokeObjectURL(preview);
    const url = URL.createObjectURL(selectedFile);
    setPreview(url);
    upload.upload(selectedFile);
  };

  const handleDelete = () => {
    if (file) {
      upload.deleteImage({ path: file.path });
    }
    setFile(null);
    form.setValue(urlField, undefined as TFieldValues[typeof urlField], { shouldDirty: true });
    form.setValue(fileUploadIdField, undefined as TFieldValues[typeof fileUploadIdField], {
      shouldDirty: true,
    });
    if (preview) {
      URL.revokeObjectURL(preview);
      setPreview("");
    }
  };

  const imageUrl = form.watch(urlField) || preview;

  return { upload, imageUrl, handleSelect, handleDelete };
}

export type UseFormImageUploadReturn = ReturnType<typeof useFormImageUpload>;
