"use client";

import { actionTypeAtom } from "@/atoms/action/missionTypeAtoms";
import { ActionTypeSelect } from "@/components/mission/ActionTypeSelect";
import { cn } from "@/lib/utils";
import { ActionType } from "@/types/domain/action";
import { Button, FixedBottomLayout, Typo, useStep } from "@repo/ui/components";
import { useAtom } from "jotai";

interface SurveyTypeStepProps {
  selectedType?: ActionType;
  onTypeChange?: (type: ActionType) => void;
  className?: string;
}

export function TypeStep() {
  const [selectedType, setSelectedType] = useAtom(actionTypeAtom);
  const { goNext } = useStep();

  const handleTypeChange = (type: ActionType) => {
    setSelectedType(type);
  };

  return (
    <>
      <SurveyQuestionTypeStep
        selectedType={selectedType ?? undefined}
        onTypeChange={handleTypeChange}
      />
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

function SurveyQuestionTypeStep({ selectedType, onTypeChange, className }: SurveyTypeStepProps) {
  return (
    <div className={cn("px-5", className)}>
      <ActionTypeSelect selectedType={selectedType} onTypeChange={onTypeChange} />
    </div>
  );
}
