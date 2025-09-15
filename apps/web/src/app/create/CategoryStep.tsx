"use client";

import { cn } from "@/lib/utils";
import PollTypeSelect from "@/components/poll/PollTypeSelect";
import {
  BottomCTALayout,
  Button,
  CenterOverlay,
  Typo,
} from "@repo/ui/components";
import { X } from "lucide-react";

type PollType = "ox" | "hobullho" | "multiple";

interface CategoryStepProps {
  selectedType?: PollType;
  onTypeChange?: (type: PollType) => void;
  onNext?: () => void;
  onBack?: () => void;
  isNextEnabled?: boolean;
  className?: string;
}

export default function CategoryStep({
  selectedType,
  onTypeChange,
  onNext,
  onBack,
  isNextEnabled = false,
  className,
}: CategoryStepProps) {
  return (
    <div className={cn("bg-white flex flex-col h-full gap-6", className)}>
      {/* Header Section */}
      <div className="flex flex-col gap-4">
        {/* Back Button */}
        <div className="px-1">
          <CenterOverlay
            targetElement={
              <button
                onClick={onBack}
                className="size-12 block"
                aria-label="뒤로가기"
              />
            }
          >
            <X className="size-4 text-zinc-900 pointer-events-none" />
          </CenterOverlay>
        </div>

        {/* Title Section */}
        <div className="px-5 space-y-1">
          <Typo.MainTitle size="medium">
            어떤 유형의 폴을 생성할까요?
          </Typo.MainTitle>
          <Typo.Body size="large" className="text-zinc-600">
            원하는 질문 방식을 골라주세요
          </Typo.Body>
        </div>
      </div>

      {/* Poll Type Selection */}
      <div className="flex-1 px-5">
        <PollTypeSelect
          selectedType={selectedType}
          onTypeChange={onTypeChange}
        />
      </div>

      {/* Bottom CTA Button */}
      <BottomCTALayout.CTA>
        <div className="p-5 pb-10">
          <Button
            onClick={onNext}
            disabled={!isNextEnabled}
            variant="primary"
            fullWidth={true}
          >
            <Typo.ButtonText>다음</Typo.ButtonText>
          </Button>
        </div>
      </BottomCTALayout.CTA>
    </div>
  );
}
