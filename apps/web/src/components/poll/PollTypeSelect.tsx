import { cn } from "@/lib/utils";
import { PollType } from "@prisma/client";
import PollTypeCard from "./PollTypeCard";

interface PollTypeSelectProps {
  selectedType?: PollType;
  onTypeChange?: (type: PollType) => void;
  className?: string;
}

const pollTypes: { type: PollType; description: string }[] = [
  {
    type: PollType.YES_NO,
    description: "예/아니오 선택",
  },
  {
    type: PollType.LIKE_DISLIKE,
    description: "좋아요/싫어요",
  },
  {
    type: PollType.MULTIPLE_CHOICE,
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
          <button key={type} onClick={() => onTypeChange?.(type)} className="text-left">
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
