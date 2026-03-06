"use client";

import UBIQUITOUS_CONSTANTS from "@/constants/ubiquitous";
import { PaymentType } from "@prisma/client";
import {
  DateAndTimePicker,
  Input,
  LabelText,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Textarea,
  Typo,
} from "@repo/ui/components";
import type { ReactNode } from "react";
import { Controller, type FieldErrors, useFormContext } from "react-hook-form";
import { type CreateMissionFormData, type RewardFormValues, isRewardFormValues } from "../schema";
import { ToggleSettingRow } from "./ToggleSettingRow";

interface CreateRewardSettingsStepProps {
  imageUploader?: ReactNode;
}

const DEFAULT_REWARD_VALUES: RewardFormValues = {
  name: "",
  description: "",
  paymentType: PaymentType.IMMEDIATE,
  scheduledDate: undefined,
};

function getRewardErrorMessage(
  errors: FieldErrors<CreateMissionFormData>,
  field: "name" | "description" | "paymentType" | "scheduledDate",
): string | undefined {
  if (!errors.reward || typeof errors.reward !== "object") {
    return undefined;
  }

  const rewardErrors = errors.reward as Record<string, { message?: string } | undefined>;
  return rewardErrors[field]?.message;
}

export function CreateRewardSettingsStep({ imageUploader }: CreateRewardSettingsStepProps) {
  const {
    control,
    watch,
    setValue,
    getValues,
    clearErrors,
    formState: { errors },
  } = useFormContext<CreateMissionFormData>();

  const hasReward = watch("hasReward");
  const reward = watch("reward");
  const rewardPaymentType =
    hasReward && isRewardFormValues(reward) ? reward.paymentType : undefined;
  const paymentTypeError = getRewardErrorMessage(errors, "paymentType");
  const scheduledDateError = getRewardErrorMessage(errors, "scheduledDate");

  return (
    <div className="flex flex-col gap-6">
      <ToggleSettingRow
        label="완료 리워드 설정"
        description={`${UBIQUITOUS_CONSTANTS.MISSION} 완료 시 참여자에게 지급할 리워드를 설정합니다.`}
        checked={hasReward}
        onChange={checked => {
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

      {hasReward && (
        <div className="flex flex-col gap-5 rounded-lg border border-zinc-100 bg-zinc-50 p-4">
          <Typo.SubTitle className="text-zinc-800">리워드 정보</Typo.SubTitle>

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
                onBlur={field.onBlur}
              />
            )}
          />

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
                onBlur={field.onBlur}
              />
            )}
          />

          {imageUploader}

          <div className="flex flex-col gap-2">
            <LabelText required>지급 유형</LabelText>
            <Controller
              control={control}
              name="reward.paymentType"
              render={({ field }) => (
                <Select
                  value={field.value}
                  onValueChange={value => {
                    field.onChange(value);
                    field.onBlur();

                    if (value === PaymentType.SCHEDULED) {
                      const currentScheduledDate = getValues("reward.scheduledDate");
                      if (!currentScheduledDate) {
                        const defaultScheduledDate = new Date();
                        defaultScheduledDate.setDate(defaultScheduledDate.getDate() + 1);
                        defaultScheduledDate.setHours(12, 0, 0, 0);
                        setValue("reward.scheduledDate", defaultScheduledDate, {
                          shouldDirty: true,
                          shouldValidate: true,
                        });
                      }
                      return;
                    }

                    setValue("reward.scheduledDate", undefined, {
                      shouldDirty: true,
                      shouldValidate: true,
                    });
                  }}
                >
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
            {paymentTypeError ? (
              <Typo.Body size="medium" className="text-red-500">
                {paymentTypeError}
              </Typo.Body>
            ) : null}
          </div>

          {rewardPaymentType === PaymentType.SCHEDULED && (
            <div className="flex flex-col gap-2">
              <LabelText required>예약 일시</LabelText>
              <Controller
                control={control}
                name="reward.scheduledDate"
                render={({ field }) => {
                  const dateValue = field.value ?? undefined;
                  const timeValue = dateValue
                    ? `${String(dateValue.getHours()).padStart(2, "0")}:${String(
                        dateValue.getMinutes(),
                      ).padStart(2, "0")}`
                    : "12:00";

                  const handleDateChange = (newDate: Date | undefined) => {
                    if (!newDate) {
                      field.onChange(undefined);
                      field.onBlur();
                      return;
                    }
                    const current = dateValue ?? newDate;
                    if (!dateValue) {
                      current.setHours(12, 0, 0, 0);
                    }
                    newDate.setHours(current.getHours(), current.getMinutes(), 0, 0);
                    field.onChange(newDate);
                    field.onBlur();
                  };

                  const handleTimeChange = (newTime: string) => {
                    const [h, m] = newTime.split(":").map(Number);
                    const nextDate = dateValue ? new Date(dateValue) : new Date();
                    nextDate.setHours(h ?? 0, m ?? 0, 0, 0);
                    field.onChange(nextDate);
                    field.onBlur();
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
              {scheduledDateError ? (
                <Typo.Body size="medium" className="text-red-500">
                  {scheduledDateError}
                </Typo.Body>
              ) : null}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
