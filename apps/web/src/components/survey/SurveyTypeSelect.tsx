import { cn } from "@/lib/utils";
import { SurveyQuestionType } from "@/types/domain/survey";
import { SurveyTypeCard } from "./SurveyTypeCard";

interface SurveyTypeSelectProps {
  selectedType?: SurveyQuestionType;
  onTypeChange?: (type: SurveyQuestionType) => void;
  className?: string;
}

const surveyTypes: { type: SurveyQuestionType; description: string }[] = [
  {
    type: SurveyQuestionType.MULTIPLE_CHOICE,
    description: "여러 선택지",
  },
  {
    type: SurveyQuestionType.SCALE,
    description: "스케일",
  },
  {
    type: SurveyQuestionType.SUBJECTIVE,
    description: "주관식",
  },
];

export function SurveyTypeSelect({ selectedType, onTypeChange, className }: SurveyTypeSelectProps) {
  return (
    <div className={cn("space-y-3", className)}>
      <div className="grid gap-3">
        {surveyTypes.map(({ type }) => (
          <button
            key={type}
            type="button"
            onClick={() => onTypeChange?.(type)}
            className="text-left"
          >
            <SurveyTypeCard
              type={type}
              selected={selectedType === type}
              className={cn("hover:ring-primary")}
            />
          </button>
        ))}
      </div>
    </div>
  );
}
