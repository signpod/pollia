import { cn } from "../../lib/utils";
import { Typo } from "./Typo";

type ProcessStatus = "before" | "active" | "after";

interface ProcessChipProps {
  status: ProcessStatus;
  className?: string;
}

const STATUS_CONFIG = {
  before: {
    label: "시작전",
    bgColor: "bg-sky-50",
    textColor: "text-sky-600",
  },
  active: {
    label: "진행중",
    bgColor: "bg-violet-50",
    textColor: "text-violet-500",
  },
  after: {
    label: "종료",
    bgColor: "bg-zinc-100",
    textColor: "text-zinc-500",
  },
} as const;

export function ProcessChip({ status, className }: ProcessChipProps) {
  const config = STATUS_CONFIG[status];

  return (
    <div
      className={cn(
        "w-15 h-7",
        "inline-flex items-center justify-center",
        "rounded-full",
        config.bgColor,
        config.textColor,
        className
      )}
    >
      <Typo.ButtonText size="medium">{config.label}</Typo.ButtonText>
    </div>
  );
}
