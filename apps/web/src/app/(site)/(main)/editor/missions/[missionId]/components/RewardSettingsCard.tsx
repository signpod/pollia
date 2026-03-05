"use client";

import { createReward } from "@/actions/reward/create";
import { deleteReward } from "@/actions/reward/delete";
import { updateReward } from "@/actions/reward/update";
import {
  type CreateMissionFormData,
  createMissionFormSchema,
} from "@/app/(site)/(main)/create/schema";
import { AdminImageCropDialog } from "@/app/admin/components/common/cropper/AdminImageCropDialog";
import { useImageCropper } from "@/app/admin/components/common/cropper/use-image-cropper";
import { useSingleImage } from "@/app/admin/hooks/admin-image";
import { STORAGE_BUCKETS } from "@/constants/buckets";
import type { GetMissionResponse } from "@/types/dto";
import { zodResolver } from "@hookform/resolvers/zod";
import { MissionType, PaymentType } from "@prisma/client";
import { ImageSelector, Typo, toast } from "@repo/ui/components";
import { AlertCircle } from "lucide-react";
import {
  type ForwardedRef,
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useMemo,
  useState,
} from "react";
import { FormProvider, useForm } from "react-hook-form";
import { EditorRewardSection } from "../../../components/view/EditorRewardSection";
import type {
  SectionSaveHandle,
  SectionSaveOptions,
  SectionSaveResult,
  SectionSaveStateChangeHandler,
} from "./editor-save.types";

interface RewardSettingsCardProps {
  mission: GetMissionResponse["data"];
  initialReward: RewardSnapshot | null;
  onSaveStateChange?: SectionSaveStateChangeHandler;
}

interface RewardFormValues {
  name: string;
  description?: string;
  imageUrl?: string | null;
  imageFileUploadId?: string | null;
  paymentType: PaymentType;
  scheduledDate?: Date;
}

interface RewardSnapshot {
  id: string;
  name: string;
  description: string | null;
  imageUrl: string | null;
  imageFileUploadId: string | null;
  paymentType: PaymentType;
  scheduledDate: Date | null;
}

function isRewardFormValues(value: unknown): value is RewardFormValues {
  return (
    typeof value === "object" &&
    value !== null &&
    "name" in value &&
    "paymentType" in value &&
    typeof (value as RewardFormValues).name === "string"
  );
}

function buildDefaultValues(
  mission: GetMissionResponse["data"],
  reward: RewardSnapshot | null,
): CreateMissionFormData {
  if (!reward) {
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
      useAiCompletion: mission.useAiCompletion,
    };
  }

  return {
    category: mission.category,
    creationMode: "custom",
    title: mission.title,
    description: mission.description ?? undefined,
    hasReward: true,
    reward: {
      name: reward.name,
      description: reward.description ?? "",
      imageUrl: reward.imageUrl,
      imageFileUploadId: reward.imageFileUploadId,
      paymentType: reward.paymentType,
      scheduledDate: reward.scheduledDate ?? undefined,
    },
    isActive: mission.isActive,
    isExposed: mission.type === MissionType.GENERAL,
    allowGuestResponse: mission.allowGuestResponse,
    allowMultipleResponses: mission.allowMultipleResponses,
    useAiCompletion: mission.useAiCompletion,
  };
}

function countValidationIssues(value: unknown): number {
  if (!value || typeof value !== "object") {
    return 0;
  }

  if ("message" in value) {
    return 1;
  }

  if (Array.isArray(value)) {
    return value.reduce((sum, item) => sum + countValidationIssues(item), 0);
  }

  return Object.values(value).reduce((sum, item) => sum + countValidationIssues(item), 0);
}

function RewardSettingsCardComponent(
  { mission, initialReward, onSaveStateChange }: RewardSettingsCardProps,
  ref: ForwardedRef<SectionSaveHandle>,
) {
  const [currentReward, setCurrentReward] = useState<RewardSnapshot | null>(initialReward);
  const form = useForm<CreateMissionFormData>({
    resolver: zodResolver(createMissionFormSchema),
    defaultValues: buildDefaultValues(mission, initialReward),
    mode: "onBlur",
    reValidateMode: "onChange",
  });

  const rewardImageCropper = useImageCropper({
    fileNamePrefix: `reward-image-${mission.id}`,
  });

  const rewardImageUpload = useSingleImage({
    initialUrl: initialReward?.imageUrl ?? null,
    initialFileUploadId: initialReward?.imageFileUploadId ?? null,
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

  const isRewardImageBusy = form.formState.isSubmitting || rewardImageUpload.isUploading;
  const watchedRewardImageUrl = form.watch("reward.imageUrl");

  const handleRewardImageDelete = () => {
    rewardImageUpload.discard();
    form.setValue("reward.imageUrl", null, { shouldDirty: true });
    form.setValue("reward.imageFileUploadId", null, { shouldDirty: true });
  };

  const hasPendingChanges = form.formState.isDirty;
  const isBusy = form.formState.isSubmitting || rewardImageUpload.isUploading;
  const validationIssueCount = useMemo(
    () => countValidationIssues(form.formState.errors),
    [form.formState.errors],
  );
  const hasValidationIssues = validationIssueCount > 0;

  useEffect(() => {
    onSaveStateChange?.({
      hasPendingChanges,
      isBusy,
      hasValidationIssues,
      validationIssueCount,
    });
  }, [hasPendingChanges, hasValidationIssues, isBusy, onSaveStateChange, validationIssueCount]);

  const save = useCallback(
    async ({
      silent = false,
      showValidationUi = true,
    }: SectionSaveOptions = {}): Promise<SectionSaveResult> => {
      if (form.formState.isSubmitting) {
        return { status: "failed", message: "리워드 저장이 진행 중입니다." };
      }

      if (rewardImageUpload.isUploading) {
        return { status: "failed", message: "이미지 업로드가 완료된 뒤 저장해주세요." };
      }

      if (!form.formState.isDirty) {
        return { status: "no_changes" };
      }

      const isValid = showValidationUi
        ? await form.trigger()
        : createMissionFormSchema.safeParse(form.getValues()).success;
      if (!isValid) {
        return { status: "invalid", message: "리워드 정보를 확인해주세요." };
      }

      const values = form.getValues();

      try {
        if (!values.hasReward) {
          if (currentReward) {
            await deleteReward(currentReward.id, mission.id);
          }

          setCurrentReward(null);
          form.reset(buildDefaultValues(mission, null));

          if (!silent) {
            toast({ message: "리워드 설정이 저장되었습니다." });
          }

          return { status: "saved" };
        }

        if (!isRewardFormValues(values.reward)) {
          return { status: "invalid", message: "리워드 정보를 확인해주세요." };
        }

        const rewardInput = {
          name: values.reward.name,
          description: values.reward.description || undefined,
          imageUrl: values.reward.imageUrl ?? undefined,
          imageFileUploadId: values.reward.imageFileUploadId ?? undefined,
          paymentType: values.reward.paymentType,
          scheduledDate:
            values.reward.paymentType === PaymentType.SCHEDULED
              ? values.reward.scheduledDate
              : undefined,
        };

        if (currentReward) {
          const updatedReward = await updateReward(currentReward.id, rewardInput);
          setCurrentReward(updatedReward.data);
          form.reset(buildDefaultValues(mission, updatedReward.data));
        } else {
          const createdReward = await createReward({
            missionId: mission.id,
            ...rewardInput,
          });
          setCurrentReward(createdReward.data);
          form.reset(buildDefaultValues(mission, createdReward.data));
        }

        rewardImageUpload.deleteMarkedInitial();

        if (!silent) {
          toast({ message: "리워드 설정이 저장되었습니다." });
        }

        return { status: "saved" };
      } catch (error) {
        const message = error instanceof Error ? error.message : "리워드 설정 저장에 실패했습니다.";

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
    [currentReward, form, mission, rewardImageUpload],
  );

  useImperativeHandle(
    ref,
    () => ({
      save,
      hasPendingChanges: () => form.formState.isDirty,
      isBusy: () => form.formState.isSubmitting || rewardImageUpload.isUploading,
      exportDraftSnapshot: () => form.getValues(),
      importDraftSnapshot: (snapshot: unknown) => {
        if (!snapshot || typeof snapshot !== "object") {
          return;
        }

        const values = snapshot as Partial<CreateMissionFormData>;
        const defaultValues = buildDefaultValues(mission, currentReward);
        const normalizedBase = {
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
        };

        const rawReward =
          values.reward && typeof values.reward === "object"
            ? (values.reward as Partial<RewardFormValues>)
            : undefined;
        const normalizedReward = rawReward
          ? {
              ...rawReward,
              scheduledDate:
                typeof rawReward.scheduledDate === "string"
                  ? new Date(rawReward.scheduledDate)
                  : rawReward.scheduledDate,
            }
          : undefined;

        if (values.hasReward === true && normalizedReward && isRewardFormValues(normalizedReward)) {
          const nextValues: CreateMissionFormData = {
            ...normalizedBase,
            hasReward: true,
            reward: normalizedReward,
          };
          form.reset(nextValues, { keepDefaultValues: true });
          return;
        }

        const nextValues: CreateMissionFormData = {
          ...normalizedBase,
          hasReward: false,
          reward: undefined,
        };
        form.reset(nextValues, { keepDefaultValues: true });
      },
    }),
    [
      currentReward,
      form,
      form.formState.isDirty,
      form.formState.isSubmitting,
      mission,
      rewardImageUpload.isUploading,
      save,
    ],
  );

  const rewardImageUploader = (
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
  );

  return (
    <>
      <FormProvider {...form}>
        <form
          onSubmit={event => {
            event.preventDefault();
          }}
        >
          <EditorRewardSection imageUploader={rewardImageUploader} />
        </form>
      </FormProvider>

      <AdminImageCropDialog
        open={rewardImageCropper.isOpen}
        imageSrc={rewardImageCropper.imageSrc}
        aspect={1}
        title="리워드 이미지 편집"
        description="이미지를 1:1 비율로 맞춰 저장합니다."
        fileName={rewardImageCropper.fileName ?? `reward-image-${mission.id}.jpg`}
        onOpenChange={open => {
          if (!open) {
            rewardImageCropper.close();
          }
        }}
        onConfirm={file => {
          rewardImageUpload.upload(file);
        }}
      />
    </>
  );
}

export const RewardSettingsCard = forwardRef<SectionSaveHandle, RewardSettingsCardProps>(
  RewardSettingsCardComponent,
);
RewardSettingsCard.displayName = "RewardSettingsCard";
