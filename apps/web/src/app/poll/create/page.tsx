"use client";

import {
  useStep,
  Typo,
  CenterOverlay,
  StepProvider,
  FixedBottomLayout,
} from "@repo/ui/components";
import { useAtomValue } from "jotai";
import {
  isBinaryPollTypeAtom,
  isMultiplePollTypeAtom,
} from "@/atoms/create/pollTypeAtoms";
import { CREATE_POLL_STEPS, createStepConfigs } from "@/constants/createPoll";
import { useRouter } from "next/navigation";

import TypeStep from "./TypeStep";
import BinaryInfoStep from "./BinaryInfoStep";
import CategoryStep from "./CategoryStep";
import MultipleInfoStep from "./MultipleInfoStep";

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
    <div className="bg-white flex flex-col h-full gap-6">
      <div className="flex flex-col gap-4">
        <div className="px-1">
          <CenterOverlay
            targetElement={
              <button
                onClick={currentStepConfig?.header.action}
                className="size-12 block"
                aria-label="뒤로가기"
              />
            }
          >
            {currentStepConfig?.header.icon && (
              <currentStepConfig.header.icon className="size-4 text-zinc-900" />
            )}
          </CenterOverlay>
        </div>

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
      </div>

      {currentStepConfig?.content()}
    </div>
  );
}
