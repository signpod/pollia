"use client";

import {
  useStep,
  Typo,
  StepProvider,
  FixedBottomLayout,
  FixedTopLayout,
  IconButton,
} from "@repo/ui/components";
import { useAtomValue } from "jotai";
import {
  isBinaryPollTypeAtom,
  isMultiplePollTypeAtom,
} from "@/atoms/create/pollTypeAtoms";
import { CREATE_POLL_STEPS, createStepConfigs } from "@/constants/createPoll";
import { useRouter } from "next/navigation";

import { TypeStep } from "./TypeStep";
import { BinaryInfoStep } from "./BinaryInfoStep";
import { CategoryStep } from "./CategoryStep";
import { MultipleInfoStep } from "./MultipleInfoStep";

export default function CreatePollPage() {
  return (
    <FixedBottomLayout>
      <StepProvider steps={CREATE_POLL_STEPS} initialStep={0}>
        <CreatePollPageContent />
      </StepProvider>
    </FixedBottomLayout>
  );
}

function CreatePollPageContent() {
  const router = useRouter();
  const isBinaryPollType = useAtomValue(isBinaryPollTypeAtom);
  const isMultiplePollType = useAtomValue(isMultiplePollTypeAtom);
  const { currentStep, goBack } = useStep();

  const currentStepConfig = createStepConfigs({
    router,
    goBack,
    isBinaryPollType,
    isMultiplePollType,
    TypeStep,
    BinaryInfoStep,
    CategoryStep,
    MultipleInfoStep,
  })[currentStep];

  return (
    <FixedTopLayout className="bg-white flex flex-col h-full">
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

      <div className="px-5 space-y-1">
        <Typo.MainTitle size="medium">
          {currentStepConfig?.title}
        </Typo.MainTitle>
        {currentStepConfig?.description && (
          <Typo.Body size="large" className="text-zinc-600">
            {currentStepConfig.description}
          </Typo.Body>
        )}
      </div>

      {currentStepConfig?.content()}
    </FixedTopLayout>
  );
}
