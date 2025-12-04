"use client";

import { actionTypeAtom } from "@/atoms/action/missionTypeAtoms";
import { CREATE_MISSION_STEPS, createStepConfigs } from "@/constants/createMission";
import {
  FixedBottomLayout,
  FixedTopLayout,
  IconButton,
  StepProvider,
  Typo,
  useStep,
} from "@repo/ui/components";
import { useAtomValue } from "jotai";
import { useRouter } from "next/navigation";
import { MultipleChoiceInfoStep } from "./components/steps/MultipleChoiceInfoStep";
import { ScaleInfoStep } from "./components/steps/ScaleInfoStep";
import { SubjectiveInfoStep } from "./components/steps/SubjectiveInfoStep";
import { TypeStep } from "./components/steps/TypeStep";

export default function CreateActionPage() {
  return (
    <FixedBottomLayout>
      <StepProvider steps={CREATE_MISSION_STEPS} initialStep={0}>
        <CreateActionPageContent />
      </StepProvider>
    </FixedBottomLayout>
  );
}

function CreateActionPageContent() {
  const router = useRouter();
  const actionType = useAtomValue(actionTypeAtom);
  const { currentStep, goBack } = useStep();

  const currentStepConfig = createStepConfigs({
    router,
    goBack,
    stepType: actionType ?? "ChoiceType",
    stepComponents: {
      TypeStep,
      MultipleChoiceInfoStep,
      ScaleInfoStep,
      SubjectiveInfoStep,
    },
  })[currentStep];

  return (
    <FixedTopLayout className="flex h-full flex-col bg-white">
      <FixedTopLayout.Content className="flex flex-col gap-4">
        <div className="px-1">
          {currentStepConfig?.header.icon && (
            <IconButton
              onClick={currentStepConfig.header.action}
              icon={currentStepConfig.header.icon}
              className="size-12"
            >
              <span className="sr-only">뒤로가기</span>
            </IconButton>
          )}
        </div>
      </FixedTopLayout.Content>

      <div className="space-y-1 px-5">
        <Typo.MainTitle size="medium">{currentStepConfig?.title}</Typo.MainTitle>
        {currentStepConfig?.description && (
          <Typo.Body size="large" className="text-zinc-600">
            {currentStepConfig.description}
          </Typo.Body>
        )}
      </div>

      <div className="py-6">{currentStepConfig?.content()}</div>
    </FixedTopLayout>
  );
}
