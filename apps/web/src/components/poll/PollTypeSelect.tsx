import { cn } from "@/lib/utils";
import PollTypeCard from "./PollTypeCard";

type PollType = "ox" | "hobullho" | "multiple";

interface PollTypeSelectProps {
  selectedType?: PollType;
  onTypeChange?: (type: PollType) => void;
  className?: string;
}

const pollTypes: { type: PollType; label: string; description: string }[] = [
  {
    type: "ox",
    label: "O/X",
    description: "예/아니오 선택",
  },
  {
    type: "hobullho",
    label: "호불호",
    description: "좋아요/싫어요",
  },
  {
    type: "multiple",
    label: "객관식",
    description: "여러 선택지",
  },
];

export default function PollTypeSelect({
  selectedType,
  onTypeChange,
  className,
}: PollTypeSelectProps) {
  return (
    <div className={cn("space-y-3", className)}>
      <div className="grid gap-3">
        {pollTypes.map(({ type }) => (
          <button
            key={type}
            onClick={() => onTypeChange?.(type)}
            className="text-left"
          >
            <PollTypeCard
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
