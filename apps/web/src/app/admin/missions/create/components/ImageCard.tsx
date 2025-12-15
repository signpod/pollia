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
import { STORAGE_BUCKETS } from "@/constants/buckets";
import { useImageUpload } from "@/hooks/common/useImageUpload";
import { useEffect, useState } from "react";
import type { UseFormReturn } from "react-hook-form";
import { toast } from "sonner";

interface ImageCardProps {
  form: UseFormReturn<{
    title: string;
    description?: string | undefined;
    target?: string | undefined;
    imageUrl?: string | undefined;
    imageFileUploadId?: string | undefined;
    brandLogoUrl?: string | undefined;
    brandLogoFileUploadId?: string | undefined;
    deadline?: Date | undefined;
    estimatedMinutes?: number | undefined;
    actionIds?: string[] | undefined;
    isActive?: boolean | undefined;
  }>;
}

export function ImageCard({ form }: ImageCardProps) {
  const [missionImagePreview, setMissionImagePreview] = useState<string>("");
  const [brandLogoPreview, setBrandLogoPreview] = useState<string>("");

  const [missionImageFile, setMissionImageFile] = useState<{
    path: string;
    fileUploadId: string;
  } | null>(null);

  const [brandLogoFile, setBrandLogoFile] = useState<{
    path: string;
    fileUploadId: string;
  } | null>(null);

  const missionImageUpload = useImageUpload({
    bucket: STORAGE_BUCKETS.MISSION_IMAGES,
    onSuccess: result => {
      form.setValue("imageUrl", result.publicUrl);
      form.setValue("imageFileUploadId", result.fileUploadId);
      setMissionImageFile({
        path: result.path,
        fileUploadId: result.fileUploadId,
      });

      if (missionImagePreview) {
        URL.revokeObjectURL(missionImagePreview);
        setMissionImagePreview("");
      }
    },
    onError: error => {
      console.error("❌ 미션 이미지 업로드 실패:", error);
      toast.error("미션 이미지 업로드 실패", {
        description: error.message,
      });
      if (missionImagePreview) {
        URL.revokeObjectURL(missionImagePreview);
        setMissionImagePreview("");
      }
    },
  });

  const brandLogoUpload = useImageUpload({
    bucket: STORAGE_BUCKETS.MISSION_IMAGES,
    onSuccess: result => {
      form.setValue("brandLogoUrl", result.publicUrl);
      form.setValue("brandLogoFileUploadId", result.fileUploadId);
      setBrandLogoFile({
        path: result.path,
        fileUploadId: result.fileUploadId,
      });

      if (brandLogoPreview) {
        URL.revokeObjectURL(brandLogoPreview);
        setBrandLogoPreview("");
      }
    },
    onError: error => {
      console.error("❌ 브랜드 로고 업로드 실패:", error);
      toast.error("브랜드 로고 업로드 실패", {
        description: error.message,
      });
      if (brandLogoPreview) {
        URL.revokeObjectURL(brandLogoPreview);
        setBrandLogoPreview("");
      }
    },
  });

  useEffect(() => {
    return () => {
      if (missionImagePreview) {
        URL.revokeObjectURL(missionImagePreview);
      }
      if (brandLogoPreview) {
        URL.revokeObjectURL(brandLogoPreview);
      }
    };
  }, [missionImagePreview, brandLogoPreview]);

  const handleMissionImageSelect = (file: File) => {
    if (missionImagePreview) {
      URL.revokeObjectURL(missionImagePreview);
    }

    const url = URL.createObjectURL(file);
    setMissionImagePreview(url);
    missionImageUpload.upload(file);
  };

  const handleMissionImageDelete = () => {
    if (missionImageFile) {
      missionImageUpload.deleteImage({
        path: missionImageFile.path,
      });
    }

    setMissionImageFile(null);
    form.setValue("imageFileUploadId", undefined);
    form.setValue("imageUrl", undefined);

    if (missionImagePreview) {
      URL.revokeObjectURL(missionImagePreview);
      setMissionImagePreview("");
    }
  };

  const handleBrandLogoSelect = (file: File) => {
    if (brandLogoPreview) {
      URL.revokeObjectURL(brandLogoPreview);
    }

    const url = URL.createObjectURL(file);
    setBrandLogoPreview(url);
    brandLogoUpload.upload(file);
  };

  const handleBrandLogoDelete = () => {
    if (brandLogoFile) {
      brandLogoUpload.deleteImage({
        path: brandLogoFile.path,
      });
    }

    setBrandLogoFile(null);
    form.setValue("brandLogoFileUploadId", undefined);
    form.setValue("brandLogoUrl", undefined);

    if (brandLogoPreview) {
      URL.revokeObjectURL(brandLogoPreview);
      setBrandLogoPreview("");
    }
  };

  const missionImageUrl = form.watch("imageUrl") || missionImagePreview;
  const brandLogoUrl = form.watch("brandLogoUrl") || brandLogoPreview;

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
              imageUrl={missionImageUrl}
              onImageSelect={handleMissionImageSelect}
              onImageDelete={handleMissionImageDelete}
              disabled={missionImageUpload.isUploading || missionImageUpload.isDeleting}
            />
            {(missionImageUpload.isUploading || missionImageUpload.isDeleting) && (
              <p className="text-sm text-muted-foreground">
                {missionImageUpload.isUploading ? "업로드 중..." : "삭제 중..."}
              </p>
            )}
            {missionImageUpload.uploadError && (
              <p className="text-sm text-destructive">
                업로드 실패: {missionImageUpload.uploadError.message}
              </p>
            )}
          </div>
        </div>

        <div className="space-y-2">
          <Label>브랜드 로고</Label>
          <div className="flex flex-col gap-2">
            <ImageSelector
              size="large"
              imageUrl={brandLogoUrl}
              onImageSelect={handleBrandLogoSelect}
              onImageDelete={handleBrandLogoDelete}
              disabled={brandLogoUpload.isUploading || brandLogoUpload.isDeleting}
            />
            {(brandLogoUpload.isUploading || brandLogoUpload.isDeleting) && (
              <p className="text-sm text-muted-foreground">
                {brandLogoUpload.isUploading ? "업로드 중..." : "삭제 중..."}
              </p>
            )}
            {brandLogoUpload.uploadError && (
              <p className="text-sm text-destructive">
                업로드 실패: {brandLogoUpload.uploadError.message}
              </p>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
