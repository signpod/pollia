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
import { Button, Typo, toast } from "@repo/ui/components";
import { AlertCircle } from "lucide-react";
import { useState } from "react";
import { FormProvider, useForm } from "react-hook-form";

interface RewardSettingsCardProps {
  mission: GetMissionResponse["data"];
  initialReward: RewardSnapshot | null;
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
  };
}

export function RewardSettingsCard({ mission, initialReward }: RewardSettingsCardProps) {
  const [currentReward, setCurrentReward] = useState<RewardSnapshot | null>(initialReward);
  const form = useForm<CreateMissionFormData>({
    resolver: zodResolver(createMissionFormSchema),
    defaultValues: buildDefaultValues(mission, initialReward),
  });

  const handleSubmit = form.handleSubmit(async values => {
    try {
      if (!values.hasReward) {
        if (currentReward) {
          await deleteReward(currentReward.id, mission.id);
        }

        setCurrentReward(null);
        form.reset(buildDefaultValues(mission, null));
        toast({ message: "리워드 설정이 저장되었습니다." });
        return;
      }

      if (!isRewardFormValues(values.reward)) {
        throw new Error("리워드 정보를 확인해주세요.");
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

      toast({ message: "리워드 설정이 저장되었습니다." });
    } catch (error) {
      toast({
        message: error instanceof Error ? error.message : "리워드 설정 저장에 실패했습니다.",
        icon: AlertCircle,
        iconClassName: "text-red-500",
      });
    }
  });

  return (
    <div className="border border-zinc-200 bg-white">
      <div className="border-b border-zinc-100 px-5 py-4">
        <Typo.SubTitle>리워드 수정</Typo.SubTitle>
        <Typo.Body size="medium" className="mt-1 text-zinc-500">
          프로젝트 리워드를 설정하고 수정합니다.
        </Typo.Body>
      </div>

      <FormProvider {...form}>
        <form onSubmit={handleSubmit} className="flex flex-col gap-5 px-5 py-5">
          <CreateRewardSettingsStep />

          <div className="flex justify-end">
            <Button
              type="submit"
              loading={form.formState.isSubmitting}
              disabled={form.formState.isSubmitting || !form.formState.isDirty}
            >
              저장
            </Button>
          </div>
        </form>
      </FormProvider>
    </div>
  );
}
