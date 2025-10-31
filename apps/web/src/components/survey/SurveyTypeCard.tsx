import { Typo } from "@repo/ui/components";
import { TYPE_LABELS } from "@/constants/survey";
import { cn } from "@/lib/utils";
import { SurveyType } from "@/types/domain/survey";

interface SurveyTypeCardProps extends React.HTMLAttributes<HTMLDivElement> {
  type: SurveyType;
  selected?: boolean;
}

export function SurveyTypeCard({
  type,
  className,
  selected = false,
  ...props
}: SurveyTypeCardProps) {
  return (
    <div
      className={cn(
        "flex items-center justify-between gap-6 rounded-[var(--radius-sm)] p-4 ring-1 ring-zinc-200",
        selected && "ring-primary bg-violet-50",
        className,
      )}
      {...props}
    >
      {type === SurveyType.EITHER_OR && (
        <CardContent
          label={TYPE_LABELS[SurveyType.EITHER_OR]}
          description="단순한 찬반 여부를 확인할 때"
        />
      )}
      {type === SurveyType.MULTIPLE_CHOICE && (
        <CardContent
          label={TYPE_LABELS[SurveyType.MULTIPLE_CHOICE]}
          description="여러 선택지에 대한 선호도를 파악할 때"
        />
      )}
      {type === SurveyType.SCALE && (
        <CardContent
          label={TYPE_LABELS[SurveyType.SCALE]}
          description="숫자로 표현할 수 있는 값을 파악할 때"
        />
      )}
      {type === SurveyType.SUBJECTIVE && (
        <CardContent
          label={TYPE_LABELS[SurveyType.SUBJECTIVE]}
          description="주관식 답변을 파악할 때"
        />
      )}
    </div>
  );
}

function CardContent({ label, description }: { label: string; description: string }) {
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
