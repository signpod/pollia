"use client";

import { useAtom } from "jotai";
import { surveyTypeAtom } from "@/atoms/survey/create/surveyTypeAtoms";
import { FixedBottomLayout, Button, Typo, useStep } from "@repo/ui/components";
import { cn } from "@/lib/utils";
import { SurveyType } from "@/types/domain/survey";
import { SurveyTypeSelect } from "@/components/survey/SurveyTypeSelect";

interface SurveyTypeStepProps {
  selectedType?: SurveyType;
  onTypeChange?: (type: SurveyType) => void;
  className?: string;
}

export function TypeStep() {
  const [selectedType, setSelectedType] = useAtom(surveyTypeAtom);
  const { goNext } = useStep();

  const handleTypeChange = (type: SurveyType) => {
    setSelectedType(type);
  };

  return (
    <>
      <SurveyTypeStep
        selectedType={selectedType}
        onTypeChange={handleTypeChange}
      />
      <FixedBottomLayout.Content>
        <div className="p-5">
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

function SurveyTypeStep({
  selectedType,
  onTypeChange,
  className,
}: SurveyTypeStepProps) {
  return (
    <div className={cn("px-5", className)}>
      <SurveyTypeSelect
        selectedType={selectedType}
        onTypeChange={onTypeChange}
      />
    </div>
  );
}
