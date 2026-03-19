"use client";

import { createReward } from "@/actions/reward/create";
import { deleteReward } from "@/actions/reward/delete";
import { updateReward } from "@/actions/reward/update";
import {
  type CreateMissionFormData,
  type RewardFormValues,
  createMissionFormSchema,
  isRewardFormValues,
} from "@/app/(site)/(main)/create/schema";
import { ImageCropModal } from "@/components/common/templates/action/image/ImageCropModal";
import { STORAGE_BUCKETS } from "@/constants/buckets";
import { useCropperModal, useSingleImage } from "@/hooks/image";
import type { GetMissionResponse } from "@/types/dto";
import { zodResolver } from "@hookform/resolvers/zod";
import { MissionType, PaymentType } from "@prisma/client";
import { toast } from "@repo/ui/components";
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
import { FormProvider, useForm, useWatch } from "react-hook-form";
import { EditorRewardSection } from "../../../components/view/EditorRewardSection";
import { ImageUploaderField } from "../../../components/view/ImageUploaderField";
import { useFormDirtySnapshot } from "../../../hooks/useFormDirtySnapshot";
import { useSectionSaveState } from "../../../hooks/useSectionSaveState";
import { countValidationIssues } from "../../../utils/countValidationIssues";
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
  onHasRewardChange?: (value: boolean) => void;
}

export interface RewardSnapshot {
  id: string;
  name: string;
  description: string | null;
  imageUrl: string | null;
  imageFileUploadId: string | null;
  paymentType: PaymentType;
  scheduledDate: Date | null;
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
      startDate: mission.startDate ? new Date(mission.startDate) : null,
      deadline: mission.deadline ? new Date(mission.deadline) : null,
    };
  }

  return {
    category: mission.category,
    creationMode: "custom",
    title: mission.title,
    description: mission.description ?? undefined,
    startDate: mission.startDate ? new Date(mission.startDate) : null,
    deadline: mission.deadline ? new Date(mission.deadline) : null,
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

function RewardSettingsCardComponent(
  { mission, initialReward, onSaveStateChange, onHasRewardChange }: RewardSettingsCardProps,
  ref: ForwardedRef<SectionSaveHandle>,
) {
  const [currentReward, setCurrentReward] = useState<RewardSnapshot | null>(initialReward);
  const form = useForm<CreateMissionFormData>({
    resolver: zodResolver(createMissionFormSchema),
    defaultValues: buildDefaultValues(mission, initialReward),
    mode: "onBlur",
    reValidateMode: "onChange",
  });

  const { openCropper, cropModalProps } = useCropperModal();

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

  const validationIssueCount = useMemo(
    () => countValidationIssues(form.formState.errors),
    [form.formState.errors],
  );

  const { hasPendingChanges, markClean } = useFormDirtySnapshot(form);

  const { getHasPendingChanges, getIsBusy } = useSectionSaveState({
    hasPendingChanges,
    isBusy: form.formState.isSubmitting || rewardImageUpload.isUploading,
    hasValidationIssues: validationIssueCount > 0,
    validationIssueCount,
    onSaveStateChange,
  });

  const watchedHasReward = useWatch({ control: form.control, name: "hasReward" });

  useEffect(() => {
    onHasRewardChange?.(watchedHasReward);
  }, [onHasRewardChange, watchedHasReward]);

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

      if (!getHasPendingChanges()) {
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
          markClean();

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
        markClean();

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
    [currentReward, form, getHasPendingChanges, markClean, mission, rewardImageUpload],
  );

  useImperativeHandle(
    ref,
    () => ({
      save,
      hasPendingChanges: getHasPendingChanges,
      isBusy: getIsBusy,
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
    [currentReward, form, mission, save, getHasPendingChanges, getIsBusy],
  );

  const rewardImageUploader = (
    <ImageUploaderField
      title="리워드 이미지"
      description={
        rewardImageUpload.isUploading ? "업로드 중..." : "리워드 이미지를 1:1 비율로 설정합니다."
      }
      imageUrl={rewardImageUpload.previewUrl ?? watchedRewardImageUrl ?? undefined}
      onImageSelect={file => openCropper(file, f => rewardImageUpload.upload(f))}
      onImageDelete={handleRewardImageDelete}
      disabled={isRewardImageBusy}
    />
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

      {cropModalProps && <ImageCropModal {...cropModalProps} />}
    </>
  );
}

export const RewardSettingsCard = forwardRef<SectionSaveHandle, RewardSettingsCardProps>(
  RewardSettingsCardComponent,
);
RewardSettingsCard.displayName = "RewardSettingsCard";
