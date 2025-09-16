"use client";

import { cn } from "@/lib/utils";
import PollTypeSelect from "@/components/poll/PollTypeSelect";

type PollType = "ox" | "hobullho" | "multiple";

interface PollTypeStepProps {
  selectedType?: PollType;
  onTypeChange?: (type: PollType) => void;
  className?: string;
}

export default function PollTypeStep({
  selectedType,
  onTypeChange,
  className,
}: PollTypeStepProps) {
  return (
    <div className={cn("px-5", className)}>
      <PollTypeSelect selectedType={selectedType} onTypeChange={onTypeChange} />
    </div>
  );
}
