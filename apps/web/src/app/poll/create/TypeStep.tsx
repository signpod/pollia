"use client";

import { PollType } from "@prisma/client";
import { useAtom } from "jotai";
import { Button, FixedBottomLayout, Typo, useStep } from "@repo/ui/components";
import { pollTypeAtom } from "@/atoms/create/pollTypeAtoms";
import PollTypeSelect from "@/components/poll/PollTypeSelect";
import { cn } from "@/lib/utils";

interface PollTypeStepProps {
  selectedType?: PollType;
  onTypeChange?: (type: PollType) => void;
  className?: string;
}

export function TypeStep() {
  const [selectedType, setSelectedType] = useAtom(pollTypeAtom);
  const { goNext } = useStep();

  const handleTypeChange = (type: PollType) => {
    setSelectedType(type);
  };

  return (
    <>
      <PollTypeStep selectedType={selectedType} onTypeChange={handleTypeChange} />
      <FixedBottomLayout.Content>
        <div className="p-5">
          <Button onClick={goNext} disabled={!selectedType} variant="primary" fullWidth={true}>
            <Typo.ButtonText>다음</Typo.ButtonText>
          </Button>
        </div>
      </FixedBottomLayout.Content>
    </>
  );
}

function PollTypeStep({ selectedType, onTypeChange, className }: PollTypeStepProps) {
  return (
    <div className={cn("px-5", className)}>
      <PollTypeSelect selectedType={selectedType} onTypeChange={onTypeChange} />
    </div>
  );
}
