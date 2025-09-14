"use client";

import { cn } from "@/lib/utils";
import PollTypeSelect from "@/components/poll/PollTypeSelect";
import { BottomCTALayout, Button } from "@repo/ui/components";
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
    <div className={cn("bg-white flex flex-col h-full", className)}>
      {/* Header Section */}
      <div className="flex flex-col gap-6">
        {/* Back Button */}
        <div className="px-1 py-0">
          <button
            onClick={onBack}
            className="p-3 hover:bg-gray-50 rounded-lg transition-colors"
            aria-label="뒤로가기"
          >
            <X className="w-6 h-6 text-zinc-900" />
          </button>
        </div>

        {/* Title Section */}
        <div className="px-5 space-y-1">
          <h1 className="text-2xl font-bold text-zinc-950 leading-[1.5]">
            어떤 유형의 폴을 생성할까요?
          </h1>
          <p className="text-base font-medium text-zinc-600 leading-[1.5]">
            원하는 질문 방식을 골라주세요
          </p>
        </div>
      </div>

      {/* Poll Type Selection */}
      <div className="flex-1 px-5 py-6">
        <PollTypeSelect
          selectedType={selectedType}
          onTypeChange={onTypeChange}
        />
      </div>

      {/* Bottom CTA Button */}
      <BottomCTALayout.CTA className="bg-white border-t border-zinc-100">
        <div className="p-5 pb-10">
          <Button
            onClick={onNext}
            disabled={!isNextEnabled}
            variant="primary"
            fullWidth={true}
          >
            다음
          </Button>
        </div>
      </BottomCTALayout.CTA>
    </div>
  );
}
