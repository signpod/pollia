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
import { ImageSelector, Typo, toast } from "@repo/ui/components";
import { AlertCircle } from "lucide-react";
import { type ForwardedRef, forwardRef, useCallback, useEffect, useImperativeHandle } from "react";
import { FormProvider, useForm } from "react-hook-form";
import type {
  SectionSaveHandle,
  SectionSaveResult,
  SectionSaveStateChangeHandler,
} from "./editor-save.types";

interface ProjectBasicInfoCardProps {
  mission: GetMissionResponse["data"];
  onSaveStateChange?: SectionSaveStateChangeHandler;
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
    isExposed: true,
    allowGuestResponse: mission.allowGuestResponse,
    allowMultipleResponses: mission.allowMultipleResponses,
    imageUrl: mission.imageUrl ?? null,
    imageFileUploadId: mission.imageFileUploadId ?? null,
    brandLogoUrl: mission.brandLogoUrl ?? null,
    brandLogoFileUploadId: mission.brandLogoFileUploadId ?? null,
  };
}

function ProjectBasicInfoCardComponent(
  { mission, onSaveStateChange }: ProjectBasicInfoCardProps,
  ref: ForwardedRef<SectionSaveHandle>,
) {
  const form = useForm<CreateMissionFormData>({
    resolver: zodResolver(createMissionFormSchema),
    defaultValues: buildDefaultValues(mission),
  });

  const thumbnailCropper = useImageCropper({
    fileNamePrefix: `mission-thumbnail-${mission.id}`,
  });
  const brandLogoCropper = useImageCropper({
    fileNamePrefix: `brand-logo-${mission.id}`,
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
  const brandLogoImageUpload = useSingleImage({
    initialUrl: mission.brandLogoUrl,
    initialFileUploadId: mission.brandLogoFileUploadId,
    bucket: STORAGE_BUCKETS.MISSION_IMAGES,
    onUploadSuccess: data => {
      form.setValue("brandLogoUrl", data.publicUrl, { shouldDirty: true });
      form.setValue("brandLogoFileUploadId", data.fileUploadId, { shouldDirty: true });
    },
    onUploadError: error => {
      toast({
        message: error.message || "브랜드 로고 업로드에 실패했습니다.",
        icon: AlertCircle,
        iconClassName: "text-red-500",
      });
    },
  });

  const isThumbnailBusy = form.formState.isSubmitting || thumbnailImageUpload.isUploading;
  const isBrandLogoBusy = form.formState.isSubmitting || brandLogoImageUpload.isUploading;

  const handleThumbnailDelete = () => {
    thumbnailImageUpload.discard();
    form.setValue("imageUrl", null, { shouldDirty: true });
    form.setValue("imageFileUploadId", null, { shouldDirty: true });
  };
  const handleBrandLogoDelete = () => {
    brandLogoImageUpload.discard();
    form.setValue("brandLogoUrl", null, { shouldDirty: true });
    form.setValue("brandLogoFileUploadId", null, { shouldDirty: true });
  };

  const hasPendingChanges = form.formState.isDirty;
  const isBusy = form.formState.isSubmitting || thumbnailImageUpload.isUploading || isBrandLogoBusy;
  const watchedImageUrl = form.watch("imageUrl");
  const watchedBrandLogoUrl = form.watch("brandLogoUrl");

  useEffect(() => {
    onSaveStateChange?.({
      hasPendingChanges,
      isBusy,
    });
  }, [hasPendingChanges, isBusy, onSaveStateChange]);

  const save = useCallback(
    async ({ silent = false }: { silent?: boolean } = {}): Promise<SectionSaveResult> => {
      if (form.formState.isSubmitting) {
        return { status: "failed", message: "기본 정보 저장이 진행 중입니다." };
      }

      if (thumbnailImageUpload.isUploading || brandLogoImageUpload.isUploading) {
        return { status: "failed", message: "이미지 업로드가 완료된 뒤 저장해주세요." };
      }

      if (!form.formState.isDirty) {
        return { status: "no_changes" };
      }

      const isValid = await form.trigger();
      if (!isValid) {
        return {
          status: "invalid",
          message: `${UBIQUITOUS_CONSTANTS.MISSION} 기본 정보를 확인해주세요.`,
        };
      }

      const values = form.getValues();

      try {
        await updateMission(mission.id, {
          title: values.title,
          description: values.description,
          type: MissionType.GENERAL,
          allowGuestResponse: values.allowGuestResponse,
          allowMultipleResponses: values.allowMultipleResponses,
          imageUrl: values.imageUrl ?? null,
          imageFileUploadId: values.imageFileUploadId ?? null,
          brandLogoUrl: values.brandLogoUrl ?? null,
          brandLogoFileUploadId: values.brandLogoFileUploadId ?? null,
        });

        thumbnailImageUpload.deleteMarkedInitial();
        brandLogoImageUpload.deleteMarkedInitial();
        form.reset(values);

        if (!silent) {
          toast({ message: `${UBIQUITOUS_CONSTANTS.MISSION} 기본 정보가 수정되었습니다.` });
        }

        return { status: "saved" };
      } catch (error) {
        const message =
          error instanceof Error
            ? error.message
            : `${UBIQUITOUS_CONSTANTS.MISSION} 수정에 실패했습니다.`;

        if (!silent) {
          toast({
            message,
            icon: AlertCircle,
            iconClassName: "text-red-500",
          });
        }

        return { status: "failed", message };
      }
    },
    [brandLogoImageUpload, form, mission.id, thumbnailImageUpload],
  );

  useImperativeHandle(
    ref,
    () => ({
      save,
      hasPendingChanges: () => form.formState.isDirty,
      isBusy: () =>
        form.formState.isSubmitting ||
        thumbnailImageUpload.isUploading ||
        brandLogoImageUpload.isUploading,
      exportDraftSnapshot: () => form.getValues(),
      importDraftSnapshot: (snapshot: unknown) => {
        if (!snapshot || typeof snapshot !== "object") {
          return;
        }

        const values = snapshot as Partial<CreateMissionFormData>;
        const defaultValues = buildDefaultValues(mission);
        const nextValues: CreateMissionFormData = {
          ...defaultValues,
          title: typeof values.title === "string" ? values.title : defaultValues.title,
          description:
            typeof values.description === "string" ? values.description : defaultValues.description,
          isExposed:
            typeof values.isExposed === "boolean" ? values.isExposed : defaultValues.isExposed,
          allowGuestResponse:
            typeof values.allowGuestResponse === "boolean"
              ? values.allowGuestResponse
              : defaultValues.allowGuestResponse,
          allowMultipleResponses:
            typeof values.allowMultipleResponses === "boolean"
              ? values.allowMultipleResponses
              : defaultValues.allowMultipleResponses,
          imageUrl:
            typeof values.imageUrl === "string" || values.imageUrl === null
              ? values.imageUrl
              : defaultValues.imageUrl,
          imageFileUploadId:
            typeof values.imageFileUploadId === "string" || values.imageFileUploadId === null
              ? values.imageFileUploadId
              : defaultValues.imageFileUploadId,
          brandLogoUrl:
            typeof values.brandLogoUrl === "string" || values.brandLogoUrl === null
              ? values.brandLogoUrl
              : defaultValues.brandLogoUrl,
          brandLogoFileUploadId:
            typeof values.brandLogoFileUploadId === "string" ||
            values.brandLogoFileUploadId === null
              ? values.brandLogoFileUploadId
              : defaultValues.brandLogoFileUploadId,
        };

        form.reset(nextValues, { keepDefaultValues: true });
      },
    }),
    [
      brandLogoImageUpload.isUploading,
      form.formState.isDirty,
      form.formState.isSubmitting,
      form,
      mission,
      save,
      thumbnailImageUpload.isUploading,
    ],
  );

  return (
    <div className="border border-zinc-200 bg-white">
      <div className="border-b border-zinc-100 px-5 py-4">
        <Typo.SubTitle>프로젝트 기본정보 수정</Typo.SubTitle>
        <Typo.Body size="medium" className="mt-1 text-zinc-500">
          프로젝트 기본 정보를 수정합니다.
        </Typo.Body>
      </div>

      <FormProvider {...form}>
        <form
          onSubmit={event => {
            event.preventDefault();
          }}
          className="flex flex-col gap-5 px-5 py-5"
        >
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
                imageUrl={thumbnailImageUpload.previewUrl ?? watchedImageUrl ?? undefined}
                onImageSelect={file => thumbnailCropper.openWithFile(file)}
                onImageDelete={handleThumbnailDelete}
                disabled={isThumbnailBusy}
              />
            </div>
          </div>

          <div className="rounded-xl border border-zinc-200 bg-white px-4 py-4">
            <div className="flex items-center justify-between gap-4">
              <div className="flex flex-col gap-1">
                <Typo.SubTitle>브랜드 로고</Typo.SubTitle>
                <Typo.Body size="medium" className="text-zinc-500">
                  {brandLogoImageUpload.isUploading
                    ? "업로드 중..."
                    : "브랜드 로고를 1:1 비율로 설정합니다."}
                </Typo.Body>
              </div>
              <ImageSelector
                size="large"
                imageUrl={brandLogoImageUpload.previewUrl ?? watchedBrandLogoUrl ?? undefined}
                onImageSelect={file => brandLogoCropper.openWithFile(file)}
                onImageDelete={handleBrandLogoDelete}
                disabled={isBrandLogoBusy}
              />
            </div>
          </div>

          <CreateProjectInfoStep showActiveToggle={false} showExposureToggle={false} />
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
      <AdminImageCropDialog
        open={brandLogoCropper.isOpen}
        imageSrc={brandLogoCropper.imageSrc}
        aspect={1}
        title="브랜드 로고 편집"
        description="이미지를 1:1 비율로 맞춰 저장합니다."
        fileName={brandLogoCropper.fileName ?? `brand-logo-${mission.id}.jpg`}
        onOpenChange={open => {
          if (!open) {
            brandLogoCropper.close();
          }
        }}
        onConfirm={file => {
          brandLogoImageUpload.upload(file);
        }}
      />
    </div>
  );
}

export const ProjectBasicInfoCard = forwardRef<SectionSaveHandle, ProjectBasicInfoCardProps>(
  ProjectBasicInfoCardComponent,
);
ProjectBasicInfoCard.displayName = "ProjectBasicInfoCard";
