"use client";

import {
  type CreateMissionFormData,
  createMissionFormSchema,
} from "@/app/(site)/(main)/create/schema";
import { AdminImageCropDialog } from "@/app/admin/components/common/cropper/AdminImageCropDialog";
import { useImageCropper } from "@/app/admin/components/common/cropper/use-image-cropper";
import { useSingleImage } from "@/app/admin/hooks/admin-image";
import { STORAGE_BUCKETS } from "@/constants/buckets";
import { zodResolver } from "@hookform/resolvers/zod";
import { MissionCategory } from "@prisma/client";
import { Button, ImageSelector, Typo, toast } from "@repo/ui/components";
import { AlertCircle } from "lucide-react";
import { useSearchParams } from "next/navigation";
import { useMemo } from "react";
import { FormProvider, useForm } from "react-hook-form";
import { EditorBottomSaveSlot } from "../../missions/[missionId]/components/EditorBottomSaveSlot";
import { useEditorMissionTab } from "../../missions/[missionId]/components/EditorMissionTabContext";
import { useEditorCreateTransitionController } from "../controller/useEditorCreateTransitionController";
import { EditorEmptyTabContent } from "./EditorEmptyTabContent";
import { EditorProjectInfoSection } from "./EditorProjectInfoSection";
import { EditorRewardSection } from "./EditorRewardSection";
import { EditorSectionCard } from "./EditorSectionCard";

const VALID_CATEGORIES = new Set<string>(Object.values(MissionCategory));

const CREATE_FORM_BASE_VALUES = {
  creationMode: "custom",
  title: "",
  description: "",
  hasReward: false as const,
  reward: undefined,
  isActive: false,
  isExposed: true,
  allowGuestResponse: false,
  allowMultipleResponses: false,
  useAiCompletion: false,
  imageUrl: null,
  imageFileUploadId: null,
  brandLogoUrl: null,
  brandLogoFileUploadId: null,
} satisfies Omit<CreateMissionFormData, "category">;

export function EditorCreateContent() {
  const { currentTab } = useEditorMissionTab();
  const searchParams = useSearchParams();

  const initialCategory = useMemo(() => {
    const param = searchParams.get("category");
    if (param && VALID_CATEGORIES.has(param)) return param as MissionCategory;
    return null;
  }, [searchParams]);

  const form = useForm<CreateMissionFormData>({
    resolver: zodResolver(createMissionFormSchema),
    defaultValues: { ...CREATE_FORM_BASE_VALUES, category: initialCategory },
    mode: "onBlur",
    reValidateMode: "onChange",
  });

  const controller = useEditorCreateTransitionController({ form });

  const brandLogoCropper = useImageCropper({ fileNamePrefix: "create-brand-logo" });
  const thumbnailCropper = useImageCropper({ fileNamePrefix: "create-thumbnail" });

  const brandLogoImageUpload = useSingleImage({
    initialUrl: null,
    initialFileUploadId: null,
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

  const thumbnailImageUpload = useSingleImage({
    initialUrl: null,
    initialFileUploadId: null,
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

  const rewardImageCropper = useImageCropper({ fileNamePrefix: "create-reward-image" });

  const rewardImageUpload = useSingleImage({
    initialUrl: null,
    initialFileUploadId: null,
    bucket: STORAGE_BUCKETS.REWARD_IMAGES,
    onUploadSuccess: data => {
      form.setValue("reward.imageUrl", data.publicUrl, { shouldDirty: true });
      form.setValue("reward.imageFileUploadId", data.fileUploadId, { shouldDirty: true });
    },
    onUploadError: error => {
      toast({
        message: error.message || "리워드 이미지 업로드에 실패했습니다.",
        icon: AlertCircle,
        iconClassName: "text-red-500",
      });
    },
  });

  const watchedBrandLogoUrl = form.watch("brandLogoUrl");
  const watchedImageUrl = form.watch("imageUrl");
  const watchedRewardImageUrl = form.watch("reward.imageUrl");
  const isBrandLogoBusy = controller.isSubmitting || brandLogoImageUpload.isUploading;
  const isThumbnailBusy = controller.isSubmitting || thumbnailImageUpload.isUploading;
  const isRewardImageBusy = controller.isSubmitting || rewardImageUpload.isUploading;

  const handleBrandLogoDelete = () => {
    brandLogoImageUpload.discard();
    form.setValue("brandLogoUrl", null, { shouldDirty: true });
    form.setValue("brandLogoFileUploadId", null, { shouldDirty: true });
  };

  const handleThumbnailDelete = () => {
    thumbnailImageUpload.discard();
    form.setValue("imageUrl", null, { shouldDirty: true });
    form.setValue("imageFileUploadId", null, { shouldDirty: true });
  };

  const handleRewardImageDelete = () => {
    rewardImageUpload.discard();
    form.setValue("reward.imageUrl", null, { shouldDirty: true });
    form.setValue("reward.imageFileUploadId", null, { shouldDirty: true });
  };

  const submitButtonNode = useMemo(
    () => (
      <div className="px-5 py-3">
        <Button
          fullWidth
          loading={controller.isSubmitting}
          disabled={controller.isSubmitting}
          onClick={controller.handleCreate}
        >
          생성하기
        </Button>
      </div>
    ),
    [controller.isSubmitting, controller.handleCreate],
  );

  if (currentTab === "stats" || currentTab === "preview") {
    return (
      <>
        <EditorBottomSaveSlot
          slotKey="editor-create-submit"
          isActive={false}
          node={submitButtonNode}
        />
        <EditorEmptyTabContent message="프로젝트를 생성해주세요" />
      </>
    );
  }

  const imageUploaders = (
    <>
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

      <div className="rounded-xl border border-zinc-200 bg-white px-4 py-4">
        <div className="flex items-center justify-between gap-4">
          <div className="flex flex-col gap-1">
            <Typo.SubTitle>프로젝트 썸네일</Typo.SubTitle>
            <Typo.Body size="medium" className="text-zinc-500">
              {thumbnailImageUpload.isUploading
                ? "업로드 중..."
                : "프로젝트 썸네일을 1:1 비율로 설정합니다."}
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
    </>
  );

  return (
    <FormProvider {...form}>
      <EditorBottomSaveSlot
        slotKey="editor-create-submit"
        isActive={currentTab === "editor"}
        node={submitButtonNode}
      />
      <EditorSectionCard title="프로젝트 기본정보" description="프로젝트 기본 정보를 입력합니다.">
        <EditorProjectInfoSection showAiCompletionToggle imageUploaders={imageUploaders} />
        <EditorRewardSection
          imageUploader={
            <div className="rounded-xl border border-zinc-200 bg-white px-4 py-4">
              <div className="flex items-center justify-between gap-4">
                <div className="flex flex-col gap-1">
                  <Typo.SubTitle>리워드 이미지</Typo.SubTitle>
                  <Typo.Body size="medium" className="text-zinc-500">
                    {rewardImageUpload.isUploading
                      ? "업로드 중..."
                      : "리워드 이미지를 1:1 비율로 설정합니다."}
                  </Typo.Body>
                </div>
                <ImageSelector
                  size="large"
                  imageUrl={rewardImageUpload.previewUrl ?? watchedRewardImageUrl ?? undefined}
                  onImageSelect={file => rewardImageCropper.openWithFile(file)}
                  onImageDelete={handleRewardImageDelete}
                  disabled={isRewardImageBusy}
                />
              </div>
            </div>
          }
        />
      </EditorSectionCard>

      <AdminImageCropDialog
        open={brandLogoCropper.isOpen}
        imageSrc={brandLogoCropper.imageSrc}
        aspect={1}
        title="브랜드 로고 편집"
        description="이미지를 1:1 비율로 맞춰 저장합니다."
        fileName={brandLogoCropper.fileName ?? "create-brand-logo.jpg"}
        onOpenChange={open => {
          if (!open) brandLogoCropper.close();
        }}
        onConfirm={file => {
          brandLogoImageUpload.upload(file);
        }}
      />
      <AdminImageCropDialog
        open={thumbnailCropper.isOpen}
        imageSrc={thumbnailCropper.imageSrc}
        aspect={1}
        title="프로젝트 썸네일 편집"
        description="이미지를 1:1 비율로 맞춰 저장합니다."
        fileName={thumbnailCropper.fileName ?? "create-thumbnail.jpg"}
        onOpenChange={open => {
          if (!open) thumbnailCropper.close();
        }}
        onConfirm={file => {
          thumbnailImageUpload.upload(file);
        }}
      />
      <AdminImageCropDialog
        open={rewardImageCropper.isOpen}
        imageSrc={rewardImageCropper.imageSrc}
        aspect={1}
        title="리워드 이미지 편집"
        description="이미지를 1:1 비율로 맞춰 저장합니다."
        fileName={rewardImageCropper.fileName ?? "create-reward-image.jpg"}
        onOpenChange={open => {
          if (!open) rewardImageCropper.close();
        }}
        onConfirm={file => {
          rewardImageUpload.upload(file);
        }}
      />
    </FormProvider>
  );
}
