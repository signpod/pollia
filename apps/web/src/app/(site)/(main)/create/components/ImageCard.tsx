"use client";

import { STORAGE_BUCKETS } from "@/constants/buckets";
import UBIQUITOUS_CONSTANTS from "@/constants/ubiquitous";
import { useImageUpload } from "@/hooks/common/useImageUpload";
import { ImageSelector, Typo } from "@repo/ui/components";
import type { UseFormReturn } from "react-hook-form";
import { toast } from "sonner";
import type { CreateMissionFunnelFormData } from "../schemas";

interface ImageCardProps {
  form: UseFormReturn<CreateMissionFunnelFormData>;
}

export function ImageCard({ form }: ImageCardProps) {
  const missionImageUpload = useImageUpload({
    bucket: STORAGE_BUCKETS.MISSION_IMAGES,
    onSuccess: data => {
      form.setValue("imageUrl", data.publicUrl);
      form.setValue("imageFileUploadId", data.fileUploadId);
    },
    onError: error => {
      toast.error(`${UBIQUITOUS_CONSTANTS.MISSION} 이미지 업로드 실패`, {
        description: error.message,
      });
    },
  });

  const brandLogoUpload = useImageUpload({
    bucket: STORAGE_BUCKETS.MISSION_IMAGES,
    onSuccess: data => {
      form.setValue("brandLogoUrl", data.publicUrl);
      form.setValue("brandLogoFileUploadId", data.fileUploadId);
    },
    onError: error => {
      toast.error("브랜드 로고 업로드 실패", {
        description: error.message,
      });
    },
  });

  const missionImageUrl = form.watch("imageUrl");
  const brandLogoUrl = form.watch("brandLogoUrl");

  const handleMissionImageDelete = () => {
    form.setValue("imageFileUploadId", undefined);
    form.setValue("imageUrl", undefined);
  };

  const handleBrandLogoDelete = () => {
    form.setValue("brandLogoFileUploadId", undefined);
    form.setValue("brandLogoUrl", undefined);
  };

  return (
    <div className="space-y-6 rounded-xl border border-zinc-200 bg-white p-6">
      <div>
        <Typo.Body size="large" className="font-bold text-zinc-900">
          이미지
        </Typo.Body>
        <Typo.Body size="medium" className="mt-1 text-zinc-500">
          {UBIQUITOUS_CONSTANTS.MISSION}과 브랜드를 나타내는 이미지를 선택하세요. (선택)
        </Typo.Body>
      </div>

      <div className="space-y-2">
        <Typo.Body size="medium" className="font-medium text-zinc-900">
          {UBIQUITOUS_CONSTANTS.MISSION} 이미지
        </Typo.Body>
        <ImageSelector
          imageUrl={missionImageUrl}
          onImageSelect={file => missionImageUpload.upload(file)}
          onImageDelete={handleMissionImageDelete}
          disabled={missionImageUpload.isUploading}
        />
        {missionImageUpload.isUploading && (
          <Typo.Body size="small" className="text-zinc-500">
            업로드 중...
          </Typo.Body>
        )}
      </div>

      <div className="space-y-2">
        <Typo.Body size="medium" className="font-medium text-zinc-900">
          브랜드 로고
        </Typo.Body>
        <ImageSelector
          imageUrl={brandLogoUrl}
          onImageSelect={file => brandLogoUpload.upload(file)}
          onImageDelete={handleBrandLogoDelete}
          disabled={brandLogoUpload.isUploading}
        />
        {brandLogoUpload.isUploading && (
          <Typo.Body size="small" className="text-zinc-500">
            업로드 중...
          </Typo.Body>
        )}
      </div>
    </div>
  );
}
