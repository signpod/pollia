import PollPollE from "@public/svgs/poll-poll-e.svg";
import { Typo } from "@repo/ui/components";
import { cn } from "@repo/ui/lib";

const EMPTY_FALLBACK_MESSAGE = "텅 -";

export function EmptyFallback({ className }: { className?: string }) {
  return (
    <div className={cn("flex flex-col items-center justify-center gap-4", className)}>
      <PollPollE className="size-20 text-zinc-100" />
      <Typo.Body size="large" className="text-zinc-400">
        {EMPTY_FALLBACK_MESSAGE}
      </Typo.Body>
    </div>
  );
}
