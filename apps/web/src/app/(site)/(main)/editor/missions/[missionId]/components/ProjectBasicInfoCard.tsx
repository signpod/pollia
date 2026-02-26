"use client";

import { updateMission } from "@/actions/mission/update";
import { CreateProjectInfoStep } from "@/app/(site)/(main)/create/components/CreateProjectInfoStep";
import {
  type CreateMissionFormData,
  createMissionFormSchema,
} from "@/app/(site)/(main)/create/schema";
import { AdminImageCropDialog } from "@/app/admin/components/common/cropper/AdminImageCropDialog";
import { useImageCropper } from "@/app/admin/components/common/cropper/use-image-cropper";
import { useSingleImage } from "@/app/admin/hooks/admin-image";
import { STORAGE_BUCKETS } from "@/constants/buckets";
import UBIQUITOUS_CONSTANTS from "@/constants/ubiquitous";
import type { GetMissionResponse } from "@/types/dto";
import { zodResolver } from "@hookform/resolvers/zod";
import { MissionType } from "@prisma/client";
import { Button, ImageSelector, Typo, toast } from "@repo/ui/components";
import { AlertCircle } from "lucide-react";
import { FormProvider, useForm } from "react-hook-form";

interface ProjectBasicInfoCardProps {
  mission: GetMissionResponse["data"];
}

function buildDefaultValues(mission: GetMissionResponse["data"]): CreateMissionFormData {
  return {
    category: mission.category,
    creationMode: "custom",
    title: mission.title,
    description: mission.description ?? undefined,
    hasReward: false,
    reward: undefined,
    isActive: mission.isActive,
    isExposed: mission.type === MissionType.GENERAL,
    allowGuestResponse: mission.allowGuestResponse,
    allowMultipleResponses: mission.allowMultipleResponses,
    imageUrl: mission.imageUrl ?? null,
    imageFileUploadId: mission.imageFileUploadId ?? null,
  };
}

export function ProjectBasicInfoCard({ mission }: ProjectBasicInfoCardProps) {
  const form = useForm<CreateMissionFormData>({
    resolver: zodResolver(createMissionFormSchema),
    defaultValues: buildDefaultValues(mission),
  });

  const thumbnailCropper = useImageCropper({
    fileNamePrefix: `mission-thumbnail-${mission.id}`,
  });

  const thumbnailImageUpload = useSingleImage({
    initialUrl: mission.imageUrl,
    initialFileUploadId: mission.imageFileUploadId,
    bucket: STORAGE_BUCKETS.MISSION_IMAGES,
    onUploadSuccess: data => {
      form.setValue("imageUrl", data.publicUrl, { shouldDirty: true });
      form.setValue("imageFileUploadId", data.fileUploadId, { shouldDirty: true });
    },
    onUploadError: error => {
      toast({
        message: error.message || "프로젝트 썸네일 업로드에 실패했습니다.",
        icon: AlertCircle,
        iconClassName: "text-red-500",
      });
    },
  });

  const isThumbnailBusy = form.formState.isSubmitting || thumbnailImageUpload.isUploading;

  const handleThumbnailDelete = () => {
    thumbnailImageUpload.discard();
    form.setValue("imageUrl", null, { shouldDirty: true });
    form.setValue("imageFileUploadId", null, { shouldDirty: true });
  };

  const handleSubmit = form.handleSubmit(async values => {
    try {
      await updateMission(mission.id, {
        title: values.title,
        description: values.description,
        isActive: values.isActive,
        type: values.isExposed ? MissionType.GENERAL : MissionType.EXPERIENCE_GROUP,
        allowGuestResponse: values.allowGuestResponse,
        allowMultipleResponses: values.allowMultipleResponses,
        imageUrl: values.imageUrl ?? null,
        imageFileUploadId: values.imageFileUploadId ?? null,
      });

      thumbnailImageUpload.deleteMarkedInitial();
      form.reset(values);
      toast({ message: `${UBIQUITOUS_CONSTANTS.MISSION} 기본 정보가 수정되었습니다.` });
    } catch (error) {
      toast({
        message:
          error instanceof Error
            ? error.message
            : `${UBIQUITOUS_CONSTANTS.MISSION} 수정에 실패했습니다.`,
        icon: AlertCircle,
        iconClassName: "text-red-500",
      });
    }
  });

  return (
    <div className="border border-zinc-200 bg-white">
      <div className="border-b border-zinc-100 px-5 py-4">
        <Typo.SubTitle>프로젝트 기본정보 수정</Typo.SubTitle>
        <Typo.Body size="medium" className="mt-1 text-zinc-500">
          프로젝트 기본 정보를 수정합니다.
        </Typo.Body>
      </div>

      <FormProvider {...form}>
        <form onSubmit={handleSubmit} className="flex flex-col gap-5 px-5 py-5">
          <div className="rounded-xl border border-zinc-200 bg-white px-4 py-4">
            <div className="flex items-center justify-between gap-4">
              <div className="flex flex-col gap-1">
                <Typo.SubTitle>프로젝트 썸네일</Typo.SubTitle>
                <Typo.Body size="medium" className="text-zinc-500">
                  {thumbnailImageUpload.isUploading
                    ? "업로드 중..."
                    : "프로젝트 썸네일을 4:3 비율로 설정합니다."}
                </Typo.Body>
              </div>
              <ImageSelector
                size="large"
                imageUrl={thumbnailImageUpload.previewUrl ?? undefined}
                onImageSelect={file => thumbnailCropper.openWithFile(file)}
                onImageDelete={handleThumbnailDelete}
                disabled={isThumbnailBusy}
              />
            </div>
          </div>

          <CreateProjectInfoStep />

          <div className="flex justify-end">
            <Button
              type="submit"
              loading={form.formState.isSubmitting}
              disabled={
                form.formState.isSubmitting ||
                thumbnailImageUpload.isUploading ||
                !form.formState.isDirty
              }
            >
              저장
            </Button>
          </div>
        </form>
      </FormProvider>

      <AdminImageCropDialog
        open={thumbnailCropper.isOpen}
        imageSrc={thumbnailCropper.imageSrc}
        aspect={4 / 3}
        title="프로젝트 썸네일 편집"
        description="이미지를 4:3 비율로 맞춰 저장합니다."
        fileName={thumbnailCropper.fileName ?? `mission-thumbnail-${mission.id}.jpg`}
        onOpenChange={open => {
          if (!open) {
            thumbnailCropper.close();
          }
        }}
        onConfirm={file => {
          thumbnailImageUpload.upload(file);
        }}
      />
    </div>
  );
}
