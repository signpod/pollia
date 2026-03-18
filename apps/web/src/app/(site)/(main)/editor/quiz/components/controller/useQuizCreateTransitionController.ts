"use client";

import { createMission } from "@/actions/mission";
import { updateMission } from "@/actions/mission/update";
import { createReward } from "@/actions/reward/create";
import { ROUTES } from "@/constants/routes";
import UBIQUITOUS_CONSTANTS from "@/constants/ubiquitous";
import { toast } from "@repo/ui/components";
import { AlertCircle } from "lucide-react";
import { useRouter } from "next/navigation";
import { useCallback, useState } from "react";
import type { UseFormReturn } from "react-hook-form";
import { useEditorMissionBootstrap } from "../../../components/model/EditorMissionBootstrapContext";
import {
  mapCreateQuizMissionRequest,
  mapQuizCreateRewardRequest,
  mapQuizIntroUpdateRequest,
} from "../../logic/mappers";
import type { CreateQuizMissionFormData } from "../../schema";

interface UseQuizCreateTransitionControllerParams {
  form: UseFormReturn<CreateQuizMissionFormData>;
}

export function useQuizCreateTransitionController({
  form,
}: UseQuizCreateTransitionControllerParams) {
  const router = useRouter();
  const { setDraft } = useEditorMissionBootstrap();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleCreate = useCallback(async () => {
    const isValid = await form.trigger();
    if (!isValid) return;

    const values = form.getValues();

    setIsSubmitting(true);

    try {
      const missionPayload = mapCreateQuizMissionRequest(values);
      const missionResult = await createMission(missionPayload);
      const missionId = missionResult.data.id;
      const warnings: string[] = [];

      try {
        await updateMission(missionId, mapQuizIntroUpdateRequest(values));
      } catch {
        warnings.push("비회원/다중 응답 설정 적용에 실패했습니다.");
      }

      if (values.hasReward) {
        try {
          await createReward(mapQuizCreateRewardRequest(missionId, values));
        } catch {
          warnings.push("리워드 설정에 실패했습니다. 생성 후 다시 설정해주세요.");
        }
      }

      toast({
        message:
          warnings.length > 0
            ? `${UBIQUITOUS_CONSTANTS.MISSION}은 생성되었지만 일부 설정 적용에 실패했습니다.`
            : `${UBIQUITOUS_CONSTANTS.MISSION}이 생성되었습니다.`,
        ...(warnings.length > 0 && {
          icon: AlertCircle,
          iconClassName: "text-red-500",
        }),
      });

      setDraft({ formData: values, missionId });
      router.replace(ROUTES.EDITOR_QUIZ_MISSION(missionId), { scroll: false });
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : `${UBIQUITOUS_CONSTANTS.MISSION} 생성 중 오류가 발생했습니다.`;
      toast({ message, icon: AlertCircle, iconClassName: "text-red-500" });
    } finally {
      setIsSubmitting(false);
    }
  }, [form, router, setDraft]);

  return {
    isSubmitting,
    handleCreate,
  };
}
