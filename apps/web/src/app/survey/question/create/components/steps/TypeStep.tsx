"use client";

import { surveyQuestionTypeAtom } from "@/atoms/survey/create/surveyTypeAtoms";
import { SurveyTypeSelect } from "@/components/survey/SurveyTypeSelect";
import { cn } from "@/lib/utils";
import { SurveyQuestionType } from "@/types/domain/survey";
import { Button, FixedBottomLayout, Typo, useStep } from "@repo/ui/components";
import { useAtom } from "jotai";

interface SurveyTypeStepProps {
  selectedType?: SurveyQuestionType;
  onTypeChange?: (type: SurveyQuestionType) => void;
  className?: string;
}

export function TypeStep() {
  const [selectedType, setSelectedType] = useAtom(surveyQuestionTypeAtom);
  const { goNext } = useStep();

  const handleTypeChange = (type: SurveyQuestionType) => {
    setSelectedType(type);
  };

  return (
    <>
      <SurveyQuestionTypeStep
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

function SurveyQuestionTypeStep({
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
