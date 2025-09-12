import { cn } from "@/lib/utils";
import { CircleIcon, XIcon, ThumbsDownIcon, ThumbsUpIcon } from "lucide-react";
import { CenterOverlay, Typo } from "@repo/ui/components";

type PollType = "ox" | "hobullho" | "multiple";
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
        "flex justify-between items-center gap-6 p-4 ring-1 ring-zinc-200 rounded-[var(--radius-sm)]",
        selected && "bg-violet-50 ring-primary",
        className
      )}
      {...props}
    >
      {type === "ox" && <OxCard selected={selected} />}
      {type === "hobullho" && <HobullhoCard selected={selected} />}
      {type === "multiple" && <MultipleCard selected={selected} />}
    </div>
  );
}

function OxCard({ selected }: { selected: boolean }) {
  return (
    <>
      <div className="flex flex-col gap-1 items-start">
        <Typo.SubTitle size="large" className="text-zinc-950">
          O, X
        </Typo.SubTitle>
        <Typo.Body size="medium" className="text-zinc-400">
          단순한 찬반 여부를 확인할 때
        </Typo.Body>
      </div>

      <div className="flex gap-1 h-[62px] items-center">
        <CenterOverlay
          targetElement={<div className="size-12 bg-zinc-50 rounded-sm" />}
        >
          <CircleIcon className="size-[16px]" strokeWidth={2} />
        </CenterOverlay>

        <CenterOverlay
          targetElement={<div className="size-12 bg-zinc-50 rounded-sm" />}
        >
          <XIcon className="size-[20px]" strokeWidth={2} />
        </CenterOverlay>
      </div>
    </>
  );
}

function HobullhoCard({ selected }: { selected: boolean }) {
  return (
    <>
      <div className="flex flex-col gap-1 items-start">
        <Typo.SubTitle size="large" className="text-zinc-950">
          좋아요, 싫어요
        </Typo.SubTitle>
        <Typo.Body size="medium" className="text-zinc-400">
          빠르게 호감도나 선호도를 파악할 때
        </Typo.Body>
      </div>

      <div className="flex gap-1 h-[62px] items-center">
        <CenterOverlay
          targetElement={<div className="size-12 bg-zinc-50 rounded-sm" />}
        >
          <ThumbsUpIcon className="size-[20px]" strokeWidth={1.7} />
        </CenterOverlay>
        <CenterOverlay
          targetElement={<div className="size-12 bg-zinc-50 rounded-sm" />}
        >
          <ThumbsDownIcon className="size-[20px]" strokeWidth={1.7} />
        </CenterOverlay>
      </div>
    </>
  );
}

function MultipleCard({ selected }: { selected: boolean }) {
  return (
    <>
      <div className="flex flex-col gap-1 items-start">
        <Typo.SubTitle size="large" className="text-zinc-950">
          여러 선택지
        </Typo.SubTitle>
        <Typo.Body size="medium" className="text-zinc-400">
          여러 의견이나 선택지를 비교할 때
        </Typo.Body>
      </div>
      <div className="flex flex-col gap-1">
        <p
          className={cn(
            "text-[12px] font-bold leading-[150%] text-zinc-950 w-25 text-center bg-zinc-50 rounded-[var(--radius-sm)]",
            selected && "bg-white"
          )}
        >
          A
        </p>
        <p
          className={cn(
            "text-[12px] font-bold leading-[150%] text-zinc-950 w-25 text-center bg-zinc-50 rounded-[var(--radius-sm)]",
            selected && "bg-white"
          )}
        >
          B
        </p>
        <p
          className={cn(
            "text-[12px] font-bold leading-[150%] text-zinc-950 w-25 text-center bg-zinc-50 rounded-[var(--radius-sm)]",
            selected && "bg-white"
          )}
        >
          C
        </p>
      </div>
    </>
  );
}
