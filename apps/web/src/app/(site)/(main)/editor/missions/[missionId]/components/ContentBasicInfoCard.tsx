"use client";

import { updateMission } from "@/actions/mission/update";
import {
  type CreateMissionFormData,
  createMissionFormSchema,
} from "@/app/(site)/(main)/create/schema";
import { ImageCropModal } from "@/components/common/templates/action/image/ImageCropModal";
import { STORAGE_BUCKETS } from "@/constants/buckets";
import UBIQUITOUS_CONSTANTS from "@/constants/ubiquitous";
import { useCropperModal, useSingleImage } from "@/hooks/image";
import type { GetMissionResponse } from "@/types/dto";
import { zodResolver } from "@hookform/resolvers/zod";
import { MissionType } from "@prisma/client";
import { toast } from "@repo/ui/components";
import { useSetAtom } from "jotai";
import { AlertCircle } from "lucide-react";
import {
  type ForwardedRef,
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useMemo,
} from "react";
import { FormProvider, useForm, useWatch } from "react-hook-form";
import { EditorContentInfoSection } from "../../../components/view/EditorContentInfoSection";
import { ImageUploaderField } from "../../../components/view/ImageUploaderField";
import { countValidationIssues } from "../../../utils/countValidationIssues";
import { editorDraftVersionAtom } from "../atoms/editorDraftVersionAtom";
import type {
  SectionSaveHandle,
  SectionSaveOptions,
  SectionSaveResult,
  SectionSaveStateChangeHandler,
} from "./editor-save.types";

interface ContentBasicInfoCardProps {
  mission: GetMissionResponse["data"];
  onSaveStateChange?: SectionSaveStateChangeHandler;
  onUseAiCompletionChange?: (value: boolean) => void;
  hasReward?: boolean;
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
    useAiCompletion: mission.useAiCompletion,
    imageUrl: mission.imageUrl ?? null,
    imageFileUploadId: mission.imageFileUploadId ?? null,
    brandLogoUrl: mission.brandLogoUrl ?? null,
    brandLogoFileUploadId: mission.brandLogoFileUploadId ?? null,
    startDate: mission.startDate ? new Date(mission.startDate) : null,
    deadline: mission.deadline ? new Date(mission.deadline) : null,
  };
}

function ContentBasicInfoCardComponent(
  { mission, onSaveStateChange, onUseAiCompletionChange, hasReward }: ContentBasicInfoCardProps,
  ref: ForwardedRef<SectionSaveHandle>,
) {
  const form = useForm<CreateMissionFormData>({
    resolver: zodResolver(createMissionFormSchema),
    defaultValues: buildDefaultValues(mission),
    mode: "onBlur",
    reValidateMode: "onChange",
  });

  const { openCropper, cropModalProps } = useCropperModal();

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
        message: error.message || `${UBIQUITOUS_CONSTANTS.MISSION} 썸네일 업로드에 실패했습니다.`,
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
  const validationIssueCount = useMemo(
    () => countValidationIssues(form.formState.errors),
    [form.formState.errors],
  );
  const hasValidationIssues = validationIssueCount > 0;
  const watchedImageUrl = form.watch("imageUrl");
  const watchedBrandLogoUrl = form.watch("brandLogoUrl");
  const watchedUseAiCompletion = useWatch({
    control: form.control,
    name: "useAiCompletion",
  });

  useEffect(() => {
    onSaveStateChange?.({
      hasPendingChanges,
      isBusy,
      hasValidationIssues,
      validationIssueCount,
    });
  }, [hasPendingChanges, hasValidationIssues, isBusy, onSaveStateChange, validationIssueCount]);

  const incrementDraftVersion = useSetAtom(editorDraftVersionAtom);

  useEffect(() => {
    let timeoutId: ReturnType<typeof setTimeout> | null = null;
    const subscription = form.watch(() => {
      if (timeoutId) clearTimeout(timeoutId);
      timeoutId = setTimeout(() => {
        if (form.formState.isDirty) {
          incrementDraftVersion(v => v + 1);
        }
      }, 300);
    });
    return () => {
      subscription.unsubscribe();
      if (timeoutId) clearTimeout(timeoutId);
    };
  }, [form, incrementDraftVersion]);

  useEffect(() => {
    onUseAiCompletionChange?.(watchedUseAiCompletion);
  }, [onUseAiCompletionChange, watchedUseAiCompletion]);

  const save = useCallback(
    async ({
      silent = false,
      showValidationUi = true,
    }: SectionSaveOptions = {}): Promise<SectionSaveResult> => {
      if (form.formState.isSubmitting) {
        return { status: "failed", message: "기본 정보 저장이 진행 중입니다." };
      }

      if (thumbnailImageUpload.isUploading || brandLogoImageUpload.isUploading) {
        return { status: "failed", message: "이미지 업로드가 완료된 뒤 저장해주세요." };
      }

      if (!form.formState.isDirty) {
        return { status: "no_changes" };
      }

      const isValid = showValidationUi
        ? await form.trigger()
        : createMissionFormSchema.safeParse(form.getValues()).success;
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
          useAiCompletion: values.useAiCompletion,
          imageUrl: values.imageUrl ?? null,
          imageFileUploadId: values.imageFileUploadId ?? null,
          brandLogoUrl: values.brandLogoUrl ?? null,
          brandLogoFileUploadId: values.brandLogoFileUploadId ?? null,
          startDate: values.startDate ?? null,
          deadline: values.deadline ?? null,
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
          useAiCompletion:
            typeof values.useAiCompletion === "boolean"
              ? values.useAiCompletion
              : defaultValues.useAiCompletion,
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
          startDate:
            values.startDate instanceof Date || values.startDate === null
              ? values.startDate
              : defaultValues.startDate,
          deadline:
            values.deadline instanceof Date || values.deadline === null
              ? values.deadline
              : defaultValues.deadline,
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
    <>
      <FormProvider {...form}>
        <form
          onSubmit={event => {
            event.preventDefault();
          }}
        >
          <EditorContentInfoSection
            showAiCompletionToggle
            imageUploaders={imageUploaders}
            hasReward={hasReward}
          />
        </form>
      </FormProvider>

      {cropModalProps && <ImageCropModal {...cropModalProps} />}
    </>
  );
}

export const ContentBasicInfoCard = forwardRef<SectionSaveHandle, ContentBasicInfoCardProps>(
  ContentBasicInfoCardComponent,
);
ContentBasicInfoCard.displayName = "ContentBasicInfoCard";
