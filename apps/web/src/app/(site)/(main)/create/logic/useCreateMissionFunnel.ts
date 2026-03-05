"use client";

import { createMission } from "@/actions/mission";
import { updateMission } from "@/actions/mission/update";
import { createReward } from "@/actions/reward/create";
import { MISSION_CATEGORY_LABELS } from "@/constants/mission";
import { ROUTES } from "@/constants/routes";
import UBIQUITOUS_CONSTANTS from "@/constants/ubiquitous";
import { toast } from "@repo/ui/components";
import { AlertCircle } from "lucide-react";
import { useRouter } from "next/navigation";
import { useCallback, useMemo, useState } from "react";
import { useWatch } from "react-hook-form";
import { mapCreateMissionRequest, mapCreateRewardRequest, mapIntroUpdateRequest } from "./mappers";
import {
  CREATE_MISSION_PROGRESS_STEPS,
  type CreateMissionStep,
  type CreateMissionSuccessResult,
  type UseCreateMissionFunnelParams,
} from "./types";

const STEP_TITLES: Record<Exclude<CreateMissionStep, "success">, string> = {
  mode: "생성 방식 선택",
  "project-info": "프로젝트 정보 입력",
};

const NEXT_STEP: Record<Exclude<CreateMissionStep, "success">, CreateMissionStep> = {
  mode: "project-info",
  "project-info": "success",
};

const PREV_STEP: Partial<Record<CreateMissionStep, Exclude<CreateMissionStep, "success">>> = {
  "project-info": "mode",
};

export function useCreateMissionFunnel({ form, initialStep }: UseCreateMissionFunnelParams) {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState<CreateMissionStep>(initialStep ?? "mode");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [result, setResult] = useState<CreateMissionSuccessResult | null>(null);
  const category = useWatch({ control: form.control, name: "category" });

  const validateCurrentStep = useCallback(async () => {
    if (currentStep === "mode") {
      const mode = form.getValues("creationMode");
      if (!mode) {
        form.setError("creationMode", {
          type: "manual",
          message: "생성 방식을 선택해주세요.",
        });
        return false;
      }
      if (mode !== "custom") {
        form.setError("creationMode", {
          type: "manual",
          message: "현재는 자유롭게 만들기만 지원합니다.",
        });
        return false;
      }

      form.clearErrors("creationMode");
      return true;
    }

    if (currentStep === "project-info") {
      return form.trigger([
        "title",
        "description",
        "allowGuestResponse",
        "allowMultipleResponses",
        "hasReward",
        "reward",
      ]);
    }

    return true;
  }, [currentStep, form]);

  const handleSubmit = useCallback(async () => {
    const isValid = await form.trigger();
    if (!isValid) return false;

    const values = form.getValues();
    if (values.creationMode !== "custom") {
      form.setError("creationMode", {
        type: "manual",
        message: "현재는 자유롭게 만들기만 지원합니다.",
      });
      setCurrentStep("mode");
      return false;
    }

    setIsSubmitting(true);

    try {
      const missionPayload = mapCreateMissionRequest(values);
      const missionResult = await createMission(missionPayload);
      const missionId = missionResult.data.id;
      const warnings: string[] = [];

      try {
        await updateMission(missionId, mapIntroUpdateRequest(values));
      } catch {
        warnings.push("비회원/다중 응답 설정 적용에 실패했습니다.");
      }

      if (values.hasReward) {
        try {
          await createReward(mapCreateRewardRequest(missionId, values));
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

      setResult({ missionId, warnings });
      router.replace(ROUTES.EDITOR_MISSION(missionId));

      return true;
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : `${UBIQUITOUS_CONSTANTS.MISSION} 생성 중 오류가 발생했습니다.`;
      toast({ message, icon: AlertCircle, iconClassName: "text-red-500" });
      return false;
    } finally {
      setIsSubmitting(false);
    }
  }, [form, router]);

  const goNext = useCallback(async () => {
    if (currentStep === "success") return;

    if (currentStep === "project-info") {
      await handleSubmit();
      return;
    }

    const isStepValid = await validateCurrentStep();
    if (!isStepValid) return;

    setCurrentStep(NEXT_STEP[currentStep]);
  }, [currentStep, handleSubmit, validateCurrentStep]);

  const goBack = useCallback(() => {
    if (currentStep === "project-info") {
      form.setValue("creationMode", null, { shouldDirty: true, shouldValidate: false });
      form.clearErrors("creationMode");
    }

    const prev = PREV_STEP[currentStep];
    if (!prev) return;
    setCurrentStep(prev);
  }, [currentStep, form]);

  const selectCustomMode = useCallback(() => {
    form.clearErrors("creationMode");
    form.setValue("creationMode", "custom", {
      shouldDirty: true,
      shouldValidate: false,
    });
    setCurrentStep("project-info");
  }, [form]);

  const progress = useMemo(() => {
    const steps = initialStep
      ? CREATE_MISSION_PROGRESS_STEPS.filter(
          s =>
            CREATE_MISSION_PROGRESS_STEPS.indexOf(s) >=
            CREATE_MISSION_PROGRESS_STEPS.indexOf(
              initialStep as Exclude<CreateMissionStep, "success">,
            ),
        )
      : CREATE_MISSION_PROGRESS_STEPS;

    const stepIndex = steps.indexOf(currentStep as Exclude<CreateMissionStep, "success">);

    return {
      current: stepIndex >= 0 ? stepIndex + 1 : steps.length,
      total: steps.length,
    };
  }, [currentStep, initialStep]);

  const screenTitle = useMemo(() => {
    if (currentStep === "success") return `${UBIQUITOUS_CONSTANTS.MISSION} 생성 완료`;
    if (currentStep === "mode" && category) {
      return `${MISSION_CATEGORY_LABELS[category]} 만들기`;
    }
    if (currentStep === "project-info" && category) {
      return `${MISSION_CATEGORY_LABELS[category]} 정보 입력`;
    }
    return STEP_TITLES[currentStep];
  }, [category, currentStep]);

  const nextButtonLabel =
    currentStep === "project-info" ? `${UBIQUITOUS_CONSTANTS.MISSION} 생성` : "다음";

  return {
    currentStep,
    progress,
    screenTitle,
    nextButtonLabel,
    isSubmitting,
    canGoBack: Boolean(PREV_STEP[currentStep]),
    goNext,
    goBack,
    selectCustomMode,
    result,
  };
}
