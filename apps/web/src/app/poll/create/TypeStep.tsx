"use client";

import { useAtom } from "jotai";
import { pollTypeAtom } from "@/atoms/create/pollTypeAtoms";
import { FixedBottomLayout, Button, Typo, useStep } from "@repo/ui/components";
import { cn } from "@/lib/utils";
import PollTypeSelect from "@/components/poll/PollTypeSelect";
import { PollType } from "@prisma/client";

interface PollTypeStepProps {
  selectedType?: PollType;
  onTypeChange?: (type: PollType) => void;
  className?: string;
}

export default function TypeStep() {
  const [selectedType, setSelectedType] = useAtom(pollTypeAtom);
  const { goNext } = useStep();

  const handleTypeChange = (type: PollType) => {
    setSelectedType(type);
  };

  return (
    <>
      <PollTypeStep
        selectedType={selectedType}
        onTypeChange={handleTypeChange}
      />
      <FixedBottomLayout.Content>
        <div className="p-5 pb-10">
          <Button
            onClick={goNext}
            disabled={!selectedType}
            variant="primary"
            fullWidth={true}
          >
            <Typo.ButtonText>다음</Typo.ButtonText>
          </Button>
        </div>
      </FixedBottomLayout.Content>
    </>
  );
}

function PollTypeStep({
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
