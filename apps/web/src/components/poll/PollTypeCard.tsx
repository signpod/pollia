import { TYPE_LABELS } from "@/constants/poll";
import { cn } from "@/lib/utils";
import { PollType } from "@prisma/client";
import { CenterOverlay, Typo } from "@repo/ui/components";
import { CircleIcon, ThumbsDownIcon, ThumbsUpIcon, XIcon } from "lucide-react";

interface PollTypeCardProps extends React.HTMLAttributes<HTMLDivElement> {
  type: PollType;
  selected?: boolean;
}

export default function PollTypeCard({
  type,
  className,
  selected = false,
  ...props
}: PollTypeCardProps) {
  return (
    <div
      className={cn(
        "flex items-center justify-between gap-6 rounded-[var(--radius-sm)] p-4 ring-1 ring-zinc-200",
        selected && "ring-primary bg-violet-50",
        className,
      )}
      {...props}
    >
      {type === PollType.YES_NO && <OxCard selected={selected} />}
      {type === PollType.LIKE_DISLIKE && <HobullhoCard selected={selected} />}
      {type === PollType.MULTIPLE_CHOICE && <MultipleCard selected={selected} />}
    </div>
  );
}

function OxCard() {
  return (
    <>
      <div className="flex flex-col items-start gap-1">
        <Typo.SubTitle size="large" className="text-zinc-950">
          {TYPE_LABELS[PollType.YES_NO]}
        </Typo.SubTitle>
        <Typo.Body size="medium" className="text-zinc-400">
          단순한 찬반 여부를 확인할 때
        </Typo.Body>
      </div>

      <div className="flex h-[62px] items-center gap-1">
        <CenterOverlay targetElement={<div className="size-12 rounded-sm bg-zinc-50" />}>
          <CircleIcon className="size-[16px]" strokeWidth={2} />
        </CenterOverlay>

        <CenterOverlay targetElement={<div className="size-12 rounded-sm bg-zinc-50" />}>
          <XIcon className="size-[20px]" strokeWidth={2} />
        </CenterOverlay>
      </div>
    </>
  );
}

function HobullhoCard() {
  return (
    <>
      <div className="flex flex-col items-start gap-1">
        <Typo.SubTitle size="large" className="text-zinc-950">
          {TYPE_LABELS[PollType.LIKE_DISLIKE]}
        </Typo.SubTitle>
        <Typo.Body size="medium" className="text-zinc-400">
          빠르게 호감도나 선호도를 파악할 때
        </Typo.Body>
      </div>

      <div className="flex h-[62px] items-center gap-1">
        <CenterOverlay targetElement={<div className="size-12 rounded-sm bg-zinc-50" />}>
          <ThumbsUpIcon className="size-[20px]" strokeWidth={1.7} />
        </CenterOverlay>
        <CenterOverlay targetElement={<div className="size-12 rounded-sm bg-zinc-50" />}>
          <ThumbsDownIcon className="size-[20px]" strokeWidth={1.7} />
        </CenterOverlay>
      </div>
    </>
  );
}

function MultipleCard({ selected }: { selected: boolean }) {
  return (
    <>
      <div className="flex flex-col items-start gap-1">
        <Typo.SubTitle size="large" className="text-zinc-950">
          {TYPE_LABELS[PollType.MULTIPLE_CHOICE]}
        </Typo.SubTitle>
        <Typo.Body size="medium" className="text-zinc-400">
          여러 의견이나 선택지를 비교할 때
        </Typo.Body>
      </div>
      <div className="flex flex-col gap-1">
        <p
          className={cn(
            "w-25 rounded-[var(--radius-sm)] bg-zinc-50 text-center text-[12px] leading-[150%] font-bold text-zinc-950",
            selected && "bg-white",
          )}
        >
          A
        </p>
        <p
          className={cn(
            "w-25 rounded-[var(--radius-sm)] bg-zinc-50 text-center text-[12px] leading-[150%] font-bold text-zinc-950",
            selected && "bg-white",
          )}
        >
          B
        </p>
        <p
          className={cn(
            "w-25 rounded-[var(--radius-sm)] bg-zinc-50 text-center text-[12px] leading-[150%] font-bold text-zinc-950",
            selected && "bg-white",
          )}
        >
          C
        </p>
      </div>
    </>
  );
}
