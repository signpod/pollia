import { cn } from "@/lib/utils";
import { SurveyType } from "@/types/domain/survey";
import { SurveyTypeCard } from "./SurveyTypeCard";

interface SurveyTypeSelectProps {
  selectedType?: SurveyType;
  onTypeChange?: (type: SurveyType) => void;
  className?: string;
}

const surveyTypes: { type: SurveyType; description: string }[] = [
  {
    type: SurveyType.EITHER_OR,
    description: "예/아니오 선택",
  },
  {
    type: SurveyType.MULTIPLE_CHOICE,
    description: "여러 선택지",
  },
  {
    type: SurveyType.SCALE,
    description: "스케일",
  },
  {
    type: SurveyType.SUBJECTIVE,
    description: "주관식",
  },
];

export function SurveyTypeSelect({
  selectedType,
  onTypeChange,
  className,
}: SurveyTypeSelectProps) {
  return (
    <div className={cn("space-y-3", className)}>
      <div className="grid gap-3">
        {surveyTypes.map(({ type }) => (
          <button
            key={type}
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
