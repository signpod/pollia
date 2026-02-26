"use client";

import { updateMission } from "@/actions/mission/update";
import { CreateProjectInfoStep } from "@/app/(site)/(main)/create/components/CreateProjectInfoStep";
import {
  type CreateMissionFormData,
  createMissionFormSchema,
} from "@/app/(site)/(main)/create/schema";
import UBIQUITOUS_CONSTANTS from "@/constants/ubiquitous";
import type { GetMissionResponse } from "@/types/dto";
import { zodResolver } from "@hookform/resolvers/zod";
import { MissionType } from "@prisma/client";
import { Button, Typo, toast } from "@repo/ui/components";
import { AlertCircle } from "lucide-react";
import { FormProvider, useForm } from "react-hook-form";

interface ProjectBasicInfoCardProps {
  mission: GetMissionResponse["data"];
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
    isExposed: mission.type === MissionType.GENERAL,
    allowGuestResponse: mission.allowGuestResponse,
    allowMultipleResponses: mission.allowMultipleResponses,
  };
}

export function ProjectBasicInfoCard({ mission }: ProjectBasicInfoCardProps) {
  const form = useForm<CreateMissionFormData>({
    resolver: zodResolver(createMissionFormSchema),
    defaultValues: buildDefaultValues(mission),
  });

  const handleSubmit = form.handleSubmit(async values => {
    try {
      await updateMission(mission.id, {
        title: values.title,
        description: values.description,
        isActive: values.isActive,
        type: values.isExposed ? MissionType.GENERAL : MissionType.EXPERIENCE_GROUP,
        allowGuestResponse: values.allowGuestResponse,
        allowMultipleResponses: values.allowMultipleResponses,
      });

      form.reset(values);
      toast({ message: `${UBIQUITOUS_CONSTANTS.MISSION} 기본 정보가 수정되었습니다.` });
    } catch (error) {
      toast({
        message:
          error instanceof Error
            ? error.message
            : `${UBIQUITOUS_CONSTANTS.MISSION} 수정에 실패했습니다.`,
        icon: AlertCircle,
        iconClassName: "text-red-500",
      });
    }
  });

  return (
    <div className="border border-zinc-200 bg-white">
      <div className="border-b border-zinc-100 px-5 py-4">
        <Typo.SubTitle>프로젝트 기본정보 수정</Typo.SubTitle>
        <Typo.Body size="medium" className="mt-1 text-zinc-500">
          프로젝트 기본 정보를 수정합니다.
        </Typo.Body>
      </div>

      <FormProvider {...form}>
        <form onSubmit={handleSubmit} className="flex flex-col gap-5 px-5 py-5">
          <CreateProjectInfoStep />

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
