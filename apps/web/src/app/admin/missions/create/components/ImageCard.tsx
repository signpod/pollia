"use client";

import { ImageSelectField } from "@/app/admin/components/common/ImageSelectField";
import { type UploadedImageData, useSingleImage } from "@/app/admin/hooks/admin-image";
import { STORAGE_BUCKETS } from "@/constants/buckets";
import type { UseFormReturn } from "react-hook-form";
import { toast } from "sonner";
import type { CreateMissionFunnelFormData } from "../schemas";

interface ImageCardProps {
  form: UseFormReturn<CreateMissionFunnelFormData>;
}

export function ImageCard({ form }: ImageCardProps) {
  const missionImageUpload = useSingleImage({
    bucket: STORAGE_BUCKETS.MISSION_IMAGES,
    onUploadSuccess: (data: UploadedImageData) => {
      form.setValue("imageUrl", data.publicUrl);
      form.setValue("imageFileUploadId", data.fileUploadId);
    },
    onUploadError: (error: Error) => {
      toast.error("미션 이미지 업로드 실패", {
        description: error.message,
      });
    },
  });

  const brandLogoUpload = useSingleImage({
    bucket: STORAGE_BUCKETS.MISSION_IMAGES,
    onUploadSuccess: (data: UploadedImageData) => {
      form.setValue("brandLogoUrl", data.publicUrl);
      form.setValue("brandLogoFileUploadId", data.fileUploadId);
    },
    onUploadError: (error: Error) => {
      toast.error("브랜드 로고 업로드 실패", {
        description: error.message,
      });
    },
  });

  const handleMissionImageDelete = () => {
    missionImageUpload.discard();
    form.setValue("imageFileUploadId", undefined);
    form.setValue("imageUrl", undefined);
  };

  const handleBrandLogoDelete = () => {
    brandLogoUpload.discard();
    form.setValue("brandLogoFileUploadId", undefined);
    form.setValue("brandLogoUrl", undefined);
  };

  return (
    <>
      <ImageSelectField
        control={form.control}
        name="imageUrl"
        label="미션 이미지"
        description={
          missionImageUpload.isUploading ? "업로드 중..." : "미션을 대표하는 이미지를 업로드하세요."
        }
        onImageSelect={missionImageUpload.upload}
        onImageDelete={handleMissionImageDelete}
        disabled={missionImageUpload.isUploading}
        isOptional
      />

      <ImageSelectField
        control={form.control}
        name="brandLogoUrl"
        label="브랜드 로고"
        description={
          brandLogoUpload.isUploading ? "업로드 중..." : "브랜드를 나타내는 로고를 업로드하세요."
        }
        onImageSelect={brandLogoUpload.upload}
        onImageDelete={handleBrandLogoDelete}
        disabled={brandLogoUpload.isUploading}
        isOptional
      />
    </>
  );
}
