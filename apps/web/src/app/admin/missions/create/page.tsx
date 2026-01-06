"use client";

import { Button } from "@/app/admin/components/shadcn-ui/button";
import { Spinner } from "@/app/admin/components/shadcn-ui/spinner";
import { useCreateMission } from "@/app/admin/hooks/use-create-mission";
import { useCreateMissionCompletion } from "@/app/admin/hooks/use-create-mission-completion";
import { zodResolver } from "@hookform/resolvers/zod";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { ADMIN_ROUTES } from "../../constants/routes";
import { BasicInfoCard } from "./components/BasicInfoCard";
import { CompletionStep } from "./components/CompletionStep";
import { ImageCard } from "./components/ImageCard";
import { StepIndicator } from "./components/StepIndicator";
import { type CreateMissionFunnelFormData, createMissionFunnelSchema } from "./schemas";
import { STEPS, STEP_LABELS, type Step } from "./types";

export default function AdminMissionCreatePage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const currentStepParam = searchParams.get("step");
  const currentStep: Step =
    currentStepParam && STEPS.includes(currentStepParam as Step)
      ? (currentStepParam as Step)
      : (STEPS[0] as Step);
  const currentStepIndex = STEPS.indexOf(currentStep);
  if (currentStepIndex === -1) {
    throw new Error(`Invalid step: ${currentStep}`);
  }

  const createMission = useCreateMission({
    onSuccess: async data => {
      const completion = form.getValues("completion");
      try {
        await createMissionCompletion.mutateAsync({
          title: completion.title,
          description: completion.description,
          missionId: data.data.id,
          ...(completion.imageUrl && { imageUrl: completion.imageUrl }),
          ...(completion.imageFileUploadId && {
            imageFileUploadId: completion.imageFileUploadId,
          }),
          ...(completion.links && { links: completion.links }),
        });
      } catch (error) {
        console.error("완료 화면 생성 실패:", error);
        toast.error("미션 생성 중 오류가 발생했습니다.");
      }
      toast.success("미션이 생성되었습니다.");
      router.push(ADMIN_ROUTES.ADMIN_MISSION(data.data.id));
    },
    onError: error => {
      toast.error(error.message || "미션 생성 중 오류가 발생했습니다.");
    },
  });

  const createMissionCompletion = useCreateMissionCompletion({
    onError: error => {
      console.error("완료 화면 생성 실패:", error);
    },
  });

  const defaultValues: CreateMissionFunnelFormData = {
    title: "",
    description: "",
    target: "",
    imageUrl: undefined,
    imageFileUploadId: undefined,
    brandLogoUrl: undefined,
    brandLogoFileUploadId: undefined,
    estimatedMinutes: undefined,
    deadline: undefined,
    maxParticipants: null,
    type: "GENERAL" as const,
    isActive: undefined,
    actionIds: [],
    completion: {
      title: "",
      description: "",
      imageUrl: undefined,
      imageFileUploadId: undefined,
      links: undefined,
    },
  };

  const form = useForm<CreateMissionFunnelFormData>({
    resolver: zodResolver(createMissionFunnelSchema),
    defaultValues,
  });

  const handleNext = async () => {
    if (currentStepIndex === STEPS.length - 1) {
      await handleSubmit();
      return;
    }

    const fieldsToValidate = getFieldsForStep(currentStep);
    const isValid = await form.trigger(fieldsToValidate);

    if (isValid) {
      const nextStep = STEPS[currentStepIndex + 1];
      router.push(`?step=${nextStep}`);
    }
  };

  const handleBack = () => {
    if (currentStepIndex === 0) {
      router.back();
      return;
    }
    const prevStep = STEPS[currentStepIndex - 1];
    router.push(`?step=${prevStep}`);
  };

  const handleSubmit = form.handleSubmit(
    async (data: CreateMissionFunnelFormData) => {
      const { completion, ...missionData } = data;

      const payload = {
        title: missionData.title,
        type: missionData.type,
        actionIds: Array.isArray(missionData.actionIds) ? missionData.actionIds : [],
        maxParticipants:
          typeof missionData.maxParticipants === "number" ? missionData.maxParticipants : null,
        ...(missionData.description && { description: missionData.description }),
        ...(missionData.target && { target: missionData.target }),
        ...(missionData.imageUrl && { imageUrl: missionData.imageUrl }),
        ...(missionData.imageFileUploadId && { imageFileUploadId: missionData.imageFileUploadId }),
        ...(missionData.brandLogoUrl && { brandLogoUrl: missionData.brandLogoUrl }),
        ...(missionData.brandLogoFileUploadId && {
          brandLogoFileUploadId: missionData.brandLogoFileUploadId,
        }),
        ...(missionData.estimatedMinutes && { estimatedMinutes: missionData.estimatedMinutes }),
        ...(missionData.deadline && { deadline: missionData.deadline }),
        ...(missionData.isActive !== undefined && { isActive: missionData.isActive }),
      };

      createMission.mutate(payload);
    },
    errors => {
      console.error("❌ 폼 검증 실패:", errors);
      console.error("🔍 에러 상세:", JSON.stringify(errors, null, 2));
    },
  );

  const getFieldsForStep = (step: Step): (keyof CreateMissionFunnelFormData)[] => {
    switch (step) {
      case "basic":
        return ["title", "type"];
      case "image":
        return [];
      case "completion":
        return [];
      default:
        return [];
    }
  };

  const renderStep = () => {
    switch (currentStep) {
      case "basic":
        return <BasicInfoCard form={form} />;
      case "image":
        return <ImageCard form={form} />;
      case "completion":
        return <CompletionStep form={form} />;
      default:
        return null;
    }
  };

  const isPending = createMission.isPending || createMissionCompletion.isPending;
  const isLastStep = currentStepIndex === STEPS.length - 1;

  return (
    <div className="px-6 py-8">
      <header className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">새 미션 만들기</h1>
        <p className="text-muted-foreground mt-2">
          미션의 기본 정보를 입력하세요. 액션과 리워드는 생성 후 추가할 수 있습니다.
        </p>
      </header>

      <div className="max-w-4xl">
        <StepIndicator currentStep={currentStep} steps={STEPS} stepLabels={STEP_LABELS} />
      </div>

      <form onSubmit={handleSubmit} className="space-y-6 max-w-4xl">
        {renderStep()}

        <div className="flex justify-between gap-3">
          <Button type="button" variant="outline" onClick={handleBack} disabled={isPending}>
            <ChevronLeft className="size-4" />
            {currentStepIndex === 0 ? "취소" : "이전"}
          </Button>
          <Button
            type={isLastStep ? "submit" : "button"}
            onClick={isLastStep ? undefined : handleNext}
            disabled={isPending}
          >
            {isPending ? (
              <>
                <Spinner />
                {isLastStep ? "생성 중..." : "처리 중..."}
              </>
            ) : isLastStep ? (
              "미션 생성"
            ) : (
              <>
                다음
                <ChevronRight className="size-4" />
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}
