"use client";

import UBIQUITOUS_CONSTANTS from "@/constants/ubiquitous";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button, Typo } from "@repo/ui/components";
import { ChevronLeft } from "lucide-react";
import { FormProvider, useForm } from "react-hook-form";
import { CreateCategoryStep } from "./components/CreateCategoryStep";
import { CreateModeStep } from "./components/CreateModeStep";
import { CreateProjectInfoStep } from "./components/CreateProjectInfoStep";
import { CreateRewardSettingsStep } from "./components/CreateRewardSettingsStep";
import { CreateSuccessScreen } from "./components/CreateSuccessScreen";
import { useCreateMissionFunnel } from "./logic/useCreateMissionFunnel";
import { type CreateMissionFormData, createMissionFormSchema } from "./schema";

const CREATE_FORM_DEFAULT_VALUES: CreateMissionFormData = {
  category: null,
  creationMode: null,
  title: "",
  description: "",
  hasReward: false,
  reward: undefined,
  isActive: true,
  isExposed: true,
  allowGuestResponse: false,
  allowMultipleResponses: false,
};

export function CreateMissionClient() {
  const form = useForm<CreateMissionFormData>({
    resolver: zodResolver(createMissionFormSchema),
    defaultValues: CREATE_FORM_DEFAULT_VALUES,
  });

  const controller = useCreateMissionFunnel({ form });

  const renderCurrentStep = () => {
    switch (controller.currentStep) {
      case "category":
        return <CreateCategoryStep onSelectCategory={controller.selectCategory} />;
      case "mode":
        return <CreateModeStep onSelectCustom={controller.selectCustomMode} />;
      case "project-info":
        return <CreateProjectInfoStep />;
      case "reward-settings":
        return <CreateRewardSettingsStep />;
      case "success":
        return controller.result ? (
          <CreateSuccessScreen
            missionId={controller.result.missionId}
            warnings={controller.result.warnings}
          />
        ) : null;
      default:
        return null;
    }
  };

  const showBackButton = controller.currentStep !== "category";
  const showNextButton =
    controller.currentStep !== "category" &&
    controller.currentStep !== "mode" &&
    controller.currentStep !== "success";

  return (
    <FormProvider {...form}>
      <div className="bg-white px-5 py-6">
        <header className="mb-4 flex items-center gap-3">
          {showBackButton ? (
            <button
              type="button"
              aria-label="이전 단계로 이동"
              onClick={controller.goBack}
              disabled={!controller.canGoBack || controller.isSubmitting}
              className="flex size-8 items-center justify-center rounded-full border border-zinc-200 text-zinc-700 disabled:cursor-not-allowed disabled:opacity-40"
            >
              <ChevronLeft className="size-5" />
            </button>
          ) : null}
          <Typo.SubTitle>{controller.screenTitle}</Typo.SubTitle>
        </header>

        <div className="mb-5 flex flex-col gap-2">
          <Typo.Body size="medium" className="text-zinc-500">
            {controller.currentStep === "success"
              ? `${UBIQUITOUS_CONSTANTS.MISSION} 생성 완료`
              : `${controller.progress.current} / ${controller.progress.total}`}
          </Typo.Body>
        </div>

        <div className="pb-3">{renderCurrentStep()}</div>

        {showNextButton ? (
          <div className="pb-4 pt-2">
            {showNextButton ? (
              <Button
                fullWidth
                loading={controller.isSubmitting}
                disabled={controller.isSubmitting}
                onClick={controller.goNext}
              >
                {controller.nextButtonLabel}
              </Button>
            ) : null}
          </div>
        ) : null}
      </div>
    </FormProvider>
  );
}
