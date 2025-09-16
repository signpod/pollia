"use client";

import {
  useStep,
  BottomCTALayout,
  Button,
  Typo,
  CenterOverlay,
} from "@repo/ui/components";
import TypeStepWrapper from "./TypeStepWrapper";
import { useAtom } from "jotai";
import {
  isBinaryPollTypeAtom,
  isMultiplePollTypeAtom,
} from "@/atoms/create/pollTypeAtoms";
import { STEPS } from "@/constants/createPoll";
import { ChevronLeft, X } from "lucide-react";
import { useRouter } from "next/navigation";

export default function CreatePollPage() {
  const router = useRouter();
  const { currentStep, goBack } = useStep();
  const [isBinaryPollType] = useAtom(isBinaryPollTypeAtom);
  const [isMultiplePollType] = useAtom(isMultiplePollTypeAtom);

  const renderStepContent = () => {
    switch (currentStep) {
      case 0:
        return <TypeStepWrapper />;
      case 1:
        if (isBinaryPollType) {
          return <>Binary Info Step</>;
        } else if (isMultiplePollType) {
          return <>Multiple Info Step</>;
        }
        throw new Error("알 수 없는 폴 타입입니다.");
      case 2:
        return <>Category Step</>;
      default:
        throw new Error("알 수 없는 단계입니다.");
    }
  };

  const headerInfoMap: Record<
    number,
    { action: () => void; icon: React.ElementType }
  > = {
    0: {
      action: router.back,
      icon: X,
    },
    1: {
      action: goBack,
      icon: ChevronLeft,
    },
    2: {
      action: goBack,
      icon: ChevronLeft,
    },
  } as const;

  const HeaderIcon = headerInfoMap[currentStep]?.icon;

  return (
    <>
      <div className="bg-white flex flex-col h-full gap-6">
        <div className="flex flex-col gap-4">
          <div className="px-1">
            <CenterOverlay
              targetElement={
                <button
                  onClick={headerInfoMap[currentStep]?.action}
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
              {STEPS[currentStep]?.title}
            </Typo.MainTitle>
            <Typo.Body size="large" className="text-zinc-600">
              {STEPS[currentStep]?.description}
            </Typo.Body>
          </div>
        </div>

        {renderStepContent()}
      </div>
    </>
  );
}
