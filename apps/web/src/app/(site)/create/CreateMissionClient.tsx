"use client";

import { createMission } from "@/actions/mission";
import { createReward } from "@/actions/reward/create";
import { ROUTES } from "@/constants/routes";
import UBIQUITOUS_CONSTANTS from "@/constants/ubiquitous";
import type { CreateMissionRequest } from "@/types/dto/mission";
import { zodResolver } from "@hookform/resolvers/zod";
import { PaymentType } from "@prisma/client";
import {
  Button,
  DateAndTimePicker,
  Input,
  LabelText,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Textarea,
  Toggle,
  Typo,
  toast,
} from "@repo/ui/components";
import { AlertCircle, ChevronLeft } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import {
  type CreateMissionFormData,
  MISSION_DESCRIPTION_MAX_LENGTH,
  MISSION_TITLE_MAX_LENGTH,
  createMissionFormSchema,
} from "./schema";

interface RewardFormValues {
  name: string;
  description?: string;
  paymentType: PaymentType;
  scheduledDate?: Date;
}

const DEFAULT_REWARD_VALUES: RewardFormValues = {
  name: "",
  description: "",
  paymentType: PaymentType.IMMEDIATE,
  scheduledDate: undefined,
};

function isRewardFormValues(value: unknown): value is RewardFormValues {
  return typeof value === "object" && value !== null && "name" in value && "paymentType" in value;
}

function getRewardErrorMessage(
  errors: ReturnType<typeof useForm<CreateMissionFormData>>["formState"]["errors"],
  field: "name" | "description" | "paymentType" | "scheduledDate",
): string | undefined {
  if (!errors.reward || typeof errors.reward !== "object") {
    return undefined;
  }

  const rewardErrors = errors.reward as Record<string, { message?: string } | undefined>;
  return rewardErrors[field]?.message;
}

export function CreateMissionClient() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    control,
    handleSubmit,
    watch,
    setValue,
    getValues,
    clearErrors,
    formState: { errors },
  } = useForm<CreateMissionFormData>({
    resolver: zodResolver(createMissionFormSchema),
    defaultValues: {
      title: "",
      description: "",
      hasReward: false,
      reward: undefined,
    },
  });

  const hasReward = watch("hasReward");
  const reward = watch("reward");
  const rewardPaymentType =
    hasReward && isRewardFormValues(reward) ? reward.paymentType : undefined;

  const onSubmit = async (data: CreateMissionFormData) => {
    setIsSubmitting(true);

    try {
      const missionPayload: CreateMissionRequest = {
        title: data.title,
        type: "GENERAL",
        category: "EVENT",
        actionIds: [],
        description: data.description || undefined,
        imageUrl: null,
        imageFileUploadId: null,
        brandLogoUrl: null,
        brandLogoFileUploadId: null,
        estimatedMinutes: null,
        startDate: null,
        deadline: null,
        maxParticipants: null,
        isActive: true,
        eventId: null,
      };

      const missionResult = await createMission(missionPayload);
      const missionId = missionResult.data.id;

      if (data.hasReward) {
        const rewardData = data.reward;
        try {
          await createReward({
            missionId,
            name: rewardData.name,
            description: rewardData.description,
            paymentType: rewardData.paymentType,
            scheduledDate: rewardData.scheduledDate,
          });
        } catch {
          toast({
            message: "리워드 설정 중 오류가 발생했습니다. 미션 상세에서 다시 설정해주세요.",
            icon: AlertCircle,
            iconClassName: "text-red-500",
          });
        }
      }

      toast({ message: `${UBIQUITOUS_CONSTANTS.MISSION}이 생성되었습니다.` });
      router.push(ROUTES.MISSION_MANAGE_ACTIONS(missionId));
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : `${UBIQUITOUS_CONSTANTS.MISSION} 생성 중 오류가 발생했습니다.`;
      toast({ message, icon: AlertCircle, iconClassName: "text-red-500" });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-white">
      <header className="sticky top-0 z-10 flex items-center gap-3 border-b border-zinc-100 bg-white px-4 py-3">
        <button type="button" onClick={() => router.back()} className="p-1">
          <ChevronLeft className="size-6" />
        </button>
        <Typo.SubTitle>새 {UBIQUITOUS_CONSTANTS.MISSION} 만들기</Typo.SubTitle>
      </header>

      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-6 px-5 py-6">
        {/* 제목 */}
        <Controller
          control={control}
          name="title"
          render={({ field }) => (
            <Input
              label={`${UBIQUITOUS_CONSTANTS.MISSION} 제목`}
              required
              placeholder="제목을 입력해주세요"
              maxLength={MISSION_TITLE_MAX_LENGTH}
              errorMessage={errors.title?.message}
              value={field.value}
              onChange={field.onChange}
            />
          )}
        />

        {/* 설명 */}
        <Controller
          control={control}
          name="description"
          render={({ field }) => (
            <Textarea
              label="설명"
              placeholder="프로젝트에 대한 설명을 입력해주세요"
              maxLength={MISSION_DESCRIPTION_MAX_LENGTH}
              rows={4}
              errorMessage={errors.description?.message}
              value={field.value ?? ""}
              onChange={field.onChange}
            />
          )}
        />

        {/* 리워드 토글 */}
        <div className="flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <LabelText required={false}>완료 리워드 설정</LabelText>
            <Toggle
              checked={hasReward}
              onCheckedChange={checked => {
                setValue("hasReward", checked, { shouldDirty: true, shouldValidate: true });

                if (checked) {
                  const currentReward = getValues("reward");
                  if (!isRewardFormValues(currentReward)) {
                    setValue("reward", { ...DEFAULT_REWARD_VALUES }, { shouldDirty: true });
                  }
                  return;
                }

                setValue("reward", undefined, { shouldDirty: true, shouldValidate: true });
                clearErrors("reward");
              }}
            />
          </div>
          <Typo.Body size="medium" className="text-zinc-400">
            {UBIQUITOUS_CONSTANTS.MISSION} 완료 시 참여자에게 지급할 리워드를 설정합니다.
          </Typo.Body>
        </div>

        {/* 리워드 입력 영역 */}
        {hasReward && (
          <div className="flex flex-col gap-5 rounded-lg border border-zinc-100 bg-zinc-50 p-4">
            <Typo.SubTitle className="text-zinc-800">리워드 정보</Typo.SubTitle>

            {/* 리워드 이름 */}
            <Controller
              control={control}
              name="reward.name"
              render={({ field }) => (
                <Input
                  label="리워드 이름"
                  required
                  placeholder="예: 스타벅스 아메리카노"
                  maxLength={100}
                  errorMessage={getRewardErrorMessage(errors, "name")}
                  value={field.value ?? ""}
                  onChange={field.onChange}
                />
              )}
            />

            {/* 리워드 설명 */}
            <Controller
              control={control}
              name="reward.description"
              render={({ field }) => (
                <Textarea
                  label="리워드 설명"
                  placeholder="리워드에 대한 설명을 입력하세요"
                  maxLength={500}
                  rows={2}
                  errorMessage={getRewardErrorMessage(errors, "description")}
                  value={field.value ?? ""}
                  onChange={field.onChange}
                />
              )}
            />

            {/* 지급 유형 */}
            <div className="flex flex-col gap-2">
              <LabelText required>지급 유형</LabelText>
              <Controller
                control={control}
                name="reward.paymentType"
                render={({ field }) => (
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger>
                      <SelectValue placeholder="지급 유형을 선택하세요" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value={PaymentType.IMMEDIATE}>즉시 지급</SelectItem>
                      <SelectItem value={PaymentType.SCHEDULED}>예약 지급</SelectItem>
                    </SelectContent>
                  </Select>
                )}
              />
              {getRewardErrorMessage(errors, "paymentType") && (
                <Typo.Body size="medium" className="text-red-500">
                  {getRewardErrorMessage(errors, "paymentType")}
                </Typo.Body>
              )}
            </div>

            {/* 예약 일시 */}
            {rewardPaymentType === PaymentType.SCHEDULED && (
              <div className="flex flex-col gap-2">
                <LabelText required>예약 일시</LabelText>
                <Controller
                  control={control}
                  name="reward.scheduledDate"
                  render={({ field }) => {
                    const dateValue = field.value ?? undefined;
                    const timeValue = dateValue
                      ? `${String(dateValue.getHours()).padStart(2, "0")}:${String(dateValue.getMinutes()).padStart(2, "0")}`
                      : "12:00";

                    const handleDateChange = (newDate: Date | undefined) => {
                      if (!newDate) {
                        field.onChange(undefined);
                        return;
                      }
                      const current = dateValue ?? new Date();
                      newDate.setHours(current.getHours(), current.getMinutes(), 0, 0);
                      field.onChange(newDate);
                    };

                    const handleTimeChange = (newTime: string) => {
                      const [h, m] = newTime.split(":").map(Number);
                      const d = dateValue ? new Date(dateValue) : new Date();
                      d.setHours(h ?? 0, m ?? 0, 0, 0);
                      field.onChange(d);
                    };

                    return (
                      <DateAndTimePicker
                        date={dateValue}
                        time={timeValue}
                        onDateChange={handleDateChange}
                        onTimeChange={handleTimeChange}
                        disabledDates={{ before: new Date() }}
                      />
                    );
                  }}
                />
                {getRewardErrorMessage(errors, "scheduledDate") && (
                  <Typo.Body size="medium" className="text-red-500">
                    {getRewardErrorMessage(errors, "scheduledDate")}
                  </Typo.Body>
                )}
              </div>
            )}
          </div>
        )}

        {/* 제출 */}
        <div className="pb-8 pt-2">
          <Button type="submit" fullWidth loading={isSubmitting} disabled={isSubmitting}>
            {UBIQUITOUS_CONSTANTS.MISSION} 생성
          </Button>
        </div>
      </form>
    </div>
  );
}
