"use client";

import { useStep, Typo, CenterOverlay } from "@repo/ui/components";
import { useAtom } from "jotai";
import {
  isBinaryPollTypeAtom,
  isMultiplePollTypeAtom,
} from "@/atoms/create/pollTypeAtoms";
import { createStepConfigs } from "@/constants/createPoll";
import { useRouter } from "next/navigation";

import TypeStep from "./TypeStep";
import BinaryInfoStep from "./BinaryInfoStep";
import CategoryStep from "./CategoryStep";

export default function CreatePollPage() {
  const router = useRouter();
  const { currentStep, goBack } = useStep();
  const [isBinaryPollType] = useAtom(isBinaryPollTypeAtom);
  const [isMultiplePollType] = useAtom(isMultiplePollTypeAtom);

  const stepConfigs = createStepConfigs(
    router,
    goBack,
    isBinaryPollType,
    isMultiplePollType,
    TypeStep,
    BinaryInfoStep,
    CategoryStep
  );

  const currentStepConfig = stepConfigs[currentStep];
  const HeaderIcon = currentStepConfig?.header.icon;

  return (
    <>
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
              {HeaderIcon && <HeaderIcon className="size-4 text-zinc-900" />}
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
    </>
  );
}
