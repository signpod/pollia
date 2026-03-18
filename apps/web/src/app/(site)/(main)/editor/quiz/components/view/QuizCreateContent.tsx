"use client";

import { ImageCropModal } from "@/components/common/templates/action/image/ImageCropModal";
import { Separator } from "@/components/ui/separator";
import { STORAGE_BUCKETS } from "@/constants/buckets";
import UBIQUITOUS_CONSTANTS from "@/constants/ubiquitous";
import { useCropperModal, useSingleImage } from "@/hooks/image";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button, toast } from "@repo/ui/components";
import { AlertCircle } from "lucide-react";
import { useLayoutEffect, useMemo } from "react";
import { FormProvider, useForm } from "react-hook-form";
import { EditorContentInfoSection } from "../../../components/view/EditorContentInfoSection";
import { EditorEmptyTabContent } from "../../../components/view/EditorEmptyTabContent";
import { EditorRewardSection } from "../../../components/view/EditorRewardSection";
import { EditorSectionCard } from "../../../components/view/EditorSectionCard";
import { ImageUploaderField } from "../../../components/view/ImageUploaderField";
import { EditorBottomSaveSlot } from "../../../missions/[missionId]/components/EditorBottomSaveSlot";
import { useEditorMissionTab } from "../../../missions/[missionId]/components/EditorMissionTabContext";
import { type CreateQuizMissionFormData, createQuizMissionFormSchema } from "../../schema";
import { useQuizCreateTransitionController } from "../controller/useQuizCreateTransitionController";
import { QuizConfigSection } from "./QuizConfigSection";

const QUIZ_CREATE_FORM_DEFAULT_VALUES = {
  title: "",
  description: "",
  hasReward: false as const,
  reward: undefined,
  isActive: false,
  isExposed: true,
  allowGuestResponse: true,
  allowMultipleResponses: false,
  imageUrl: null,
  imageFileUploadId: null,
  brandLogoUrl: null,
  brandLogoFileUploadId: null,
  startDate: null,
  deadline: null,
  quizConfig: {
    gradingMode: "instant" as const,
    showExplanation: true,
    showCorrectOnWrong: true,
    shuffleQuestions: false,
    shuffleChoices: false,
  },
} satisfies CreateQuizMissionFormData;

export function QuizCreateContent() {
  const { currentTab } = useEditorMissionTab();

  useLayoutEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const form = useForm<CreateQuizMissionFormData>({
    resolver: zodResolver(createQuizMissionFormSchema),
    defaultValues: QUIZ_CREATE_FORM_DEFAULT_VALUES,
    mode: "onBlur",
    reValidateMode: "onChange",
  });

  const controller = useQuizCreateTransitionController({ form });

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

  if (currentTab === "stats") {
    return (
      <>
        <EditorBottomSaveSlot
          slotKey="quiz-create-submit"
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
        slotKey="quiz-create-submit"
        isActive={currentTab === "editor"}
        node={submitButtonNode}
      />

      <EditorSectionCard
        title={`${UBIQUITOUS_CONSTANTS.MISSION} 기본정보`}
        description={`${UBIQUITOUS_CONSTANTS.MISSION} 기본 정보를 입력합니다.`}
      >
        <EditorContentInfoSection imageUploaders={imageUploaders} />
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
      <Separator className="h-2" />
      <EditorSectionCard title="퀴즈 설정" description="퀴즈 진행 방식을 설정합니다.">
        <QuizConfigSection />
      </EditorSectionCard>

      {cropModalProps && <ImageCropModal {...cropModalProps} />}
    </FormProvider>
  );
}
