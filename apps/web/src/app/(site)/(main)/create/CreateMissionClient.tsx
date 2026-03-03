"use client";

import UBIQUITOUS_CONSTANTS from "@/constants/ubiquitous";
import { zodResolver } from "@hookform/resolvers/zod";
import { MissionCategory } from "@prisma/client";
import { Button, Typo } from "@repo/ui/components";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronLeft } from "lucide-react";
import { useSearchParams } from "next/navigation";
import { useEffect, useMemo, useRef } from "react";
import { FormProvider, useForm } from "react-hook-form";
import { CreateCategoryStep } from "./components/CreateCategoryStep";
import { CreateModeStep } from "./components/CreateModeStep";
import { CreateProjectInfoStep } from "./components/CreateProjectInfoStep";
import { CreateSuccessScreen } from "./components/CreateSuccessScreen";
import { type CreateMissionStep } from "./logic/types";
import { useCreateMissionFunnel } from "./logic/useCreateMissionFunnel";
import { type CreateMissionFormData, createMissionFormSchema } from "./schema";

const CREATE_FORM_DEFAULT_VALUES: CreateMissionFormData = {
  category: null,
  creationMode: null,
  title: "",
  description: "",
  hasReward: false,
  reward: undefined,
  isActive: false,
  isExposed: true,
  allowGuestResponse: false,
  allowMultipleResponses: false,
};

const CREATE_STEP_ORDER: CreateMissionStep[] = ["category", "mode", "project-info", "success"];

const CREATE_STEP_INDEX: Record<CreateMissionStep, number> = CREATE_STEP_ORDER.reduce(
  (acc, step, index) => {
    acc[step] = index;
    return acc;
  },
  {} as Record<CreateMissionStep, number>,
);

const STEP_TRANSITION_VARIANTS = {
  enter: (direction: 1 | -1) => ({
    x: direction > 0 ? "24%" : "-24%",
    opacity: 0.7,
  }),
  center: {
    x: "0%",
    opacity: 1,
    transition: { duration: 0.24, ease: [0.22, 1, 0.36, 1] as const },
  },
  exit: (direction: 1 | -1) => ({
    x: direction > 0 ? "-20%" : "20%",
    opacity: 0.7,
    transition: { duration: 0.18, ease: [0.4, 0, 1, 1] as const },
  }),
};

const VALID_CATEGORIES = new Set<string>([MissionCategory.RESEARCH, MissionCategory.TEST]);

export function CreateMissionClient() {
  const searchParams = useSearchParams();

  const preselectedCategory = useMemo(() => {
    const param = searchParams.get("category");
    if (param && VALID_CATEGORIES.has(param)) return param as MissionCategory;
    return null;
  }, [searchParams]);

  const form = useForm<CreateMissionFormData>({
    resolver: zodResolver(createMissionFormSchema),
    defaultValues: {
      ...CREATE_FORM_DEFAULT_VALUES,
      ...(preselectedCategory && { category: preselectedCategory }),
    },
  });

  const controller = useCreateMissionFunnel({
    form,
    initialStep: preselectedCategory ? "mode" : "category",
  });

  const prevStepRef = useRef<CreateMissionStep>(controller.currentStep);
  const lastDirectionRef = useRef<1 | -1>(1);

  const direction: 1 | -1 = (() => {
    const prevStep = prevStepRef.current;
    const nextStep = controller.currentStep;

    if (prevStep === nextStep) {
      return lastDirectionRef.current;
    }

    const prevIndex = CREATE_STEP_INDEX[prevStep];
    const nextIndex = CREATE_STEP_INDEX[nextStep];
    const nextDirection: 1 | -1 = nextIndex > prevIndex ? 1 : -1;
    lastDirectionRef.current = nextDirection;
    return nextDirection;
  })();

  useEffect(() => {
    prevStepRef.current = controller.currentStep;
  }, [controller.currentStep]);

  const renderCurrentStep = () => {
    switch (controller.currentStep) {
      case "category":
        return <CreateCategoryStep onSelectCategory={controller.selectCategory} />;
      case "mode":
        return <CreateModeStep onSelectCustom={controller.selectCustomMode} />;
      case "project-info":
        return <CreateProjectInfoStep showRewardSettings />;
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

  const showBackButton = preselectedCategory
    ? controller.currentStep !== "mode"
    : controller.currentStep !== "category";
  const showNextButton =
    controller.currentStep !== "category" &&
    controller.currentStep !== "mode" &&
    controller.currentStep !== "success";

  return (
    <FormProvider {...form}>
      <div className="bg-white px-5 py-6">
        <header className="mb-4 flex items-center gap-3">
          <button
            type="button"
            aria-label="이전 단계로 이동"
            aria-hidden={!showBackButton}
            tabIndex={showBackButton ? 0 : -1}
            onClick={controller.goBack}
            disabled={!showBackButton || !controller.canGoBack || controller.isSubmitting}
            className={`flex size-8 items-center justify-center rounded-full text-zinc-700 disabled:cursor-not-allowed disabled:opacity-40 ${
              showBackButton ? "" : "pointer-events-none opacity-0"
            }`}
          >
            <ChevronLeft className="size-5" />
          </button>
          <Typo.SubTitle>{controller.screenTitle}</Typo.SubTitle>
        </header>

        <div className="mb-5 flex flex-col gap-2">
          <Typo.Body size="medium" className="text-zinc-500">
            {controller.currentStep === "success"
              ? `${UBIQUITOUS_CONSTANTS.MISSION} 생성 완료`
              : `${controller.progress.current} / ${controller.progress.total}`}
          </Typo.Body>
        </div>

        <div className="relative overflow-x-hidden overflow-y-visible pb-3">
          <div className="px-1 py-1">
            <AnimatePresence mode="wait" initial={false} custom={direction}>
              <motion.div
                key={controller.currentStep}
                custom={direction}
                variants={STEP_TRANSITION_VARIANTS}
                initial="enter"
                animate="center"
                exit="exit"
                className="will-change-transform"
              >
                {renderCurrentStep()}
                {showNextButton ? (
                  <div className="pb-4 pt-3">
                    <Button
                      fullWidth
                      loading={controller.isSubmitting}
                      disabled={controller.isSubmitting}
                      onClick={controller.goNext}
                    >
                      {controller.nextButtonLabel}
                    </Button>
                  </div>
                ) : null}
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </div>
    </FormProvider>
  );
}
