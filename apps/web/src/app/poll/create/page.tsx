"use client";

import { isBinaryPollTypeAtom, isMultiplePollTypeAtom } from "@/atoms/create/pollTypeAtoms";
import { CREATE_POLL_STEPS, createStepConfigs } from "@/constants/createPoll";
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
import { BinaryInfoStep } from "./BinaryInfoStep";
import { CategoryStep } from "./CategoryStep";
import { MultipleInfoStep } from "./MultipleInfoStep";
import { TypeStep } from "./TypeStep";

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
