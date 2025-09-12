import { cn } from "@/lib/utils";
import { CircleIcon, XIcon, ThumbsDownIcon, ThumbsUpIcon } from "lucide-react";

type PollType = "ox" | "hobullho" | "multiple";
interface PollTypeCardProps extends React.HTMLAttributes<HTMLDivElement> {
  type: PollType;
  selected?: boolean;
}

export default function PollTypeCard({ type, className, selected=false, ...props }: PollTypeCardProps) {

  return <div className={cn("flex justify-between items-center gap-6 p-4 ring-1 ring-zinc-200 rounded-[var(--radius-sm)]",
  selected && "bg-violet-50 ring-primary", className)} {...props}>
    {type === "ox" && <OxCard selected={selected} />}
    {type === "hobullho" && <HobullhoCard selected={selected} />}
    {type === "multiple" && <MultipleCard selected={selected} />}
  </div>;
}

function OxCard({ selected }: { selected: boolean }) {
  return <>
    <div className="flex flex-col gap-1 items-start">
    <p className="text-base leading-[150%] font-bold text-zinc-950">O, X</p>
    <p className="text-sm leading-[150%] font-semibold text-zinc-400">단순한 찬반 여부를 확인할 때</p>
    </div>
    <div className="flex gap-1 h-[62px] items-center">
    <div className={cn("flex p-3 bg-zinc-50 rounded-[var(--radius-sm)]", selected && "bg-white")}>  
    <CircleIcon className="w-6 h-6" />
    </div>
    <div className={cn("flex p-3 bg-zinc-50 rounded-[var(--radius-sm)]", selected && "bg-white")}>  
    <XIcon className="w-6 h-6" />
    </div>
  </div>
  </>;
}

function HobullhoCard({ selected }: { selected: boolean } ) {
  return <>
    <div className="flex flex-col gap-1 items-start">
    <p className="text-base leading-[150%] font-bold text-zinc-950">좋아요, 싫어요</p>
    <p className="text-sm leading-[150%] font-semibold text-zinc-400">빠르게 호감도나 선호도를 파악할 때</p>
    </div>
    <div className="flex gap-1 h-[62px] items-center">
    <div className={cn("flex p-3 bg-zinc-50 rounded-[var(--radius-sm)]", selected && "bg-white")}>  
    <ThumbsUpIcon className="w-6 h-6" />
    </div>
    <div className={cn("flex p-3 bg-zinc-50 rounded-[var(--radius-sm)]", selected && "bg-white")}>  
    <ThumbsDownIcon className="w-6 h-6" />
    </div>
  </div>
  </>
}

function MultipleCard({ selected }: { selected: boolean } ) {
  return <>
    <div className="flex flex-col gap-1 items-start">
    <p className="text-base leading-[150%] font-bold text-zinc-950">여러 선택지</p>
    <p className="text-sm leading-[150%] font-semibold text-zinc-400">여러 의견이나 선택지를 비교할 때</p>
    </div>
    <div className="flex flex-col gap-1">
    <p className={cn("text-[12px] font-bold leading-[150%] text-zinc-950 w-25 text-center bg-zinc-50 rounded-[var(--radius-sm)]", selected && "bg-white")}>A</p>
    <p className={cn("text-[12px] font-bold leading-[150%] text-zinc-950 w-25 text-center bg-zinc-50 rounded-[var(--radius-sm)]", selected && "bg-white")}>B</p>
    <p className={cn("text-[12px] font-bold leading-[150%] text-zinc-950 w-25 text-center bg-zinc-50 rounded-[var(--radius-sm)]", selected && "bg-white")}>C</p>
  </div>
  </>
}