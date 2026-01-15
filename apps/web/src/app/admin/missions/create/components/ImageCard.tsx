"use client";

import { ImageSelector } from "@/app/admin/components/common/ImageSelector";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/app/admin/components/shadcn-ui/card";
import { Label } from "@/app/admin/components/shadcn-ui/label";
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

  const missionImageUrl = missionImageUpload.previewUrl || form.watch("imageUrl");
  const brandLogoUrl = brandLogoUpload.previewUrl || form.watch("brandLogoUrl");

  return (
    <Card>
      <CardHeader>
        <CardTitle>이미지</CardTitle>
        <CardDescription>미션 이미지와 브랜드 로고를 업로드하세요.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-2">
          <Label>미션 이미지</Label>
          <div className="flex flex-col gap-2">
            <ImageSelector
              size="large"
              imageUrl={missionImageUrl || undefined}
              onImageSelect={missionImageUpload.upload}
              onImageDelete={handleMissionImageDelete}
              disabled={missionImageUpload.isUploading}
            />
            {missionImageUpload.isUploading && (
              <p className="text-sm text-muted-foreground">업로드 중...</p>
            )}
          </div>
        </div>

        <div className="space-y-2">
          <Label>브랜드 로고</Label>
          <div className="flex flex-col gap-2">
            <ImageSelector
              size="large"
              imageUrl={brandLogoUrl || undefined}
              onImageSelect={brandLogoUpload.upload}
              onImageDelete={handleBrandLogoDelete}
              disabled={brandLogoUpload.isUploading}
            />
            {brandLogoUpload.isUploading && (
              <p className="text-sm text-muted-foreground">업로드 중...</p>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
