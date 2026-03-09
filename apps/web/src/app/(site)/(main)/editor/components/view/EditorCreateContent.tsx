"use client";

import {
  type CreateMissionFormData,
  createMissionFormSchema,
} from "@/app/(site)/(main)/create/schema";
import { ImageCropModal } from "@/components/common/templates/action/image/ImageCropModal";
import { STORAGE_BUCKETS } from "@/constants/buckets";
import UBIQUITOUS_CONSTANTS from "@/constants/ubiquitous";
import { useCropperModal, useSingleImage } from "@/hooks/image";
import { zodResolver } from "@hookform/resolvers/zod";
import { MissionCategory } from "@prisma/client";
import { Button, toast } from "@repo/ui/components";
import { AlertCircle } from "lucide-react";
import { useSearchParams } from "next/navigation";
import { useMemo } from "react";
import { FormProvider, useForm } from "react-hook-form";
import { EditorBottomSaveSlot } from "../../missions/[missionId]/components/EditorBottomSaveSlot";
import { useEditorMissionTab } from "../../missions/[missionId]/components/EditorMissionTabContext";
import { useEditorCreateTransitionController } from "../controller/useEditorCreateTransitionController";
import { EditorContentInfoSection } from "./EditorContentInfoSection";
import { EditorEmptyTabContent } from "./EditorEmptyTabContent";
import { EditorRewardSection } from "./EditorRewardSection";
import { EditorSectionCard } from "./EditorSectionCard";
import { ImageUploaderField } from "./ImageUploaderField";

const VALID_CATEGORIES = new Set<string>(Object.values(MissionCategory));

const CREATE_FORM_BASE_VALUES = {
  creationMode: "custom",
  title: "",
  description: "",
  hasReward: false as const,
  reward: undefined,
  isActive: false,
  isExposed: true,
  allowGuestResponse: true,
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

  const { openCropper, cropModalProps } = useCropperModal();

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
        message: error.message || `${UBIQUITOUS_CONSTANTS.MISSION} 썸네일 업로드에 실패했습니다.`,
        icon: AlertCircle,
        iconClassName: "text-red-500",
      });
    },
  });

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
        <EditorEmptyTabContent message={`${UBIQUITOUS_CONSTANTS.MISSION}를 생성해주세요`} />
      </>
    );
  }

  const imageUploaders = (
    <>
      <ImageUploaderField
        title="브랜드 로고"
        description={
          brandLogoImageUpload.isUploading ? "업로드 중..." : "브랜드 로고를 1:1 비율로 설정합니다."
        }
        imageUrl={brandLogoImageUpload.previewUrl ?? watchedBrandLogoUrl ?? undefined}
        onImageSelect={file => openCropper(file, f => brandLogoImageUpload.upload(f))}
        onImageDelete={handleBrandLogoDelete}
        disabled={isBrandLogoBusy}
      />

      <ImageUploaderField
        title={`${UBIQUITOUS_CONSTANTS.MISSION} 썸네일`}
        description={
          thumbnailImageUpload.isUploading
            ? "업로드 중..."
            : `${UBIQUITOUS_CONSTANTS.MISSION} 썸네일을 1:1 비율로 설정합니다.`
        }
        imageUrl={thumbnailImageUpload.previewUrl ?? watchedImageUrl ?? undefined}
        onImageSelect={file => openCropper(file, f => thumbnailImageUpload.upload(f))}
        onImageDelete={handleThumbnailDelete}
        disabled={isThumbnailBusy}
      />
    </>
  );

  return (
    <FormProvider {...form}>
      <EditorBottomSaveSlot
        slotKey="editor-create-submit"
        isActive={currentTab === "editor"}
        node={submitButtonNode}
      />
      <EditorSectionCard
        title={`${UBIQUITOUS_CONSTANTS.MISSION} 기본정보`}
        description={`${UBIQUITOUS_CONSTANTS.MISSION} 기본 정보를 입력합니다.`}
      >
        <EditorContentInfoSection showAiCompletionToggle imageUploaders={imageUploaders} />
        <EditorRewardSection
          imageUploader={
            <ImageUploaderField
              title="리워드 이미지"
              description={
                rewardImageUpload.isUploading
                  ? "업로드 중..."
                  : "리워드 이미지를 1:1 비율로 설정합니다."
              }
              imageUrl={rewardImageUpload.previewUrl ?? watchedRewardImageUrl ?? undefined}
              onImageSelect={file => openCropper(file, f => rewardImageUpload.upload(f))}
              onImageDelete={handleRewardImageDelete}
              disabled={isRewardImageBusy}
            />
          }
        />
      </EditorSectionCard>

      {cropModalProps && <ImageCropModal {...cropModalProps} />}
    </FormProvider>
  );
}
