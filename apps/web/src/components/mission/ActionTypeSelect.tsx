import { cn } from "@/lib/utils";
import { ActionType } from "@/types/domain/action";
import { ActionTypeCard } from "./ActionTypeCard";

interface ActionTypeSelectProps {
  selectedType?: ActionType;
  onTypeChange?: (type: ActionType) => void;
  className?: string;
}

const actionTypes: { type: ActionType; description: string }[] = [
  {
    type: ActionType.MULTIPLE_CHOICE,
    description: "여러 선택지",
  },
  {
    type: ActionType.SCALE,
    description: "스케일",
  },
  {
    type: ActionType.SUBJECTIVE,
    description: "주관식",
  },
];

export function ActionTypeSelect({ selectedType, onTypeChange, className }: ActionTypeSelectProps) {
  return (
    <div className={cn("space-y-3", className)}>
      <div className="grid gap-3">
        {actionTypes.map(({ type }) => (
          <button
            key={type}
            type="button"
            onClick={() => onTypeChange?.(type)}
            className="text-left"
          >
            <ActionTypeCard
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
