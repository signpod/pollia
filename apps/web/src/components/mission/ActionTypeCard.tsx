import { ACTION_TYPE_LABELS } from "@/constants/action";
import { cn } from "@/lib/utils";
import { ActionType } from "@/types/domain/action";
import { Typo } from "@repo/ui/components";
import { ComponentProps } from "react";

interface ActionTypeCardProps extends ComponentProps<"div"> {
  type: ActionType;
  selected?: boolean;
}

export function ActionTypeCard({
  type,
  className,
  selected = false,
  ...props
}: ActionTypeCardProps) {
  return (
    <div
      className={cn(
        "flex items-center justify-between gap-6 rounded-[var(--radius-sm)] p-4 ring-1 ring-zinc-200",
        selected && "ring-primary bg-violet-50",
        className,
      )}
      {...props}
    >
      {type === ActionType.MULTIPLE_CHOICE && (
        <CardContent
          label={ACTION_TYPE_LABELS[ActionType.MULTIPLE_CHOICE]}
          description="여러 선택지에 대한 선호도를 파악할 때"
        />
      )}
      {type === ActionType.SCALE && (
        <CardContent
          label={ACTION_TYPE_LABELS[ActionType.SCALE]}
          description="숫자로 표현할 수 있는 값을 파악할 때"
        />
      )}
      {type === ActionType.SUBJECTIVE && (
        <CardContent
          label={ACTION_TYPE_LABELS[ActionType.SUBJECTIVE]}
          description="주관식 답변을 파악할 때"
        />
      )}
    </div>
  );
}

function CardContent({
  label,
  description,
}: {
  label: string;
  description: string;
}) {
  return (
    <div className="flex flex-col items-start gap-1">
      <Typo.SubTitle size="large" className="text-zinc-950">
        {label}
      </Typo.SubTitle>
      <Typo.Body size="medium" className="text-zinc-400">
        {description}
      </Typo.Body>
    </div>
  );
}
