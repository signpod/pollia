"use client";

import { createReward } from "@/actions/reward/create";
import { deleteReward } from "@/actions/reward/delete";
import { updateReward } from "@/actions/reward/update";
import { CreateRewardSettingsStep } from "@/app/(site)/(main)/create/components/CreateRewardSettingsStep";
import {
  type CreateMissionFormData,
  createMissionFormSchema,
} from "@/app/(site)/(main)/create/schema";
import type { GetMissionResponse } from "@/types/dto";
import { zodResolver } from "@hookform/resolvers/zod";
import { MissionType, PaymentType } from "@prisma/client";
import { Typo, toast } from "@repo/ui/components";
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
  paymentType: PaymentType;
  scheduledDate?: Date;
}

interface RewardSnapshot {
  id: string;
  name: string;
  description: string | null;
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

  const hasPendingChanges = form.formState.isDirty;
  const isBusy = form.formState.isSubmitting;
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
    [currentReward, form, mission],
  );

  useImperativeHandle(
    ref,
    () => ({
      save,
      hasPendingChanges: () => form.formState.isDirty,
      isBusy: () => form.formState.isSubmitting,
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
    [currentReward, form, form.formState.isDirty, form.formState.isSubmitting, mission, save],
  );

  return (
    <div className="border border-zinc-200 bg-white">
      <div className="border-b border-zinc-100 px-5 py-4">
        <div className="flex items-start justify-between gap-4">
          <div>
            <Typo.SubTitle>리워드 수정</Typo.SubTitle>
            <Typo.Body size="medium" className="mt-1 text-zinc-500">
              프로젝트 리워드를 설정하고 수정합니다.
            </Typo.Body>
          </div>
          {hasValidationIssues ? (
            <div
              className="flex shrink-0 items-center gap-1 text-red-500"
              title="입력 확인 필요"
              aria-label="입력 확인 필요"
            >
              <AlertCircle className="size-4" />
              <Typo.Body size="small" className="font-semibold text-red-500">
                {validationIssueCount}
              </Typo.Body>
            </div>
          ) : null}
        </div>
      </div>

      <FormProvider {...form}>
        <form
          onSubmit={event => {
            event.preventDefault();
          }}
          className="flex flex-col gap-5 px-5 py-5"
        >
          <CreateRewardSettingsStep />
        </form>
      </FormProvider>
    </div>
  );
}

export const RewardSettingsCard = forwardRef<SectionSaveHandle, RewardSettingsCardProps>(
  RewardSettingsCardComponent,
);
RewardSettingsCard.displayName = "RewardSettingsCard";
