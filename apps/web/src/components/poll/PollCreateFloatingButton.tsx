import { cn } from "@/lib/utils";
import { PlusIcon } from "lucide-react";
import { PointIcon } from "../common/PointIcon";
import { Typo } from "@repo/ui/components";

interface PollCreateFloatingButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "icon-only" | "with-text";
}

export default function PollCreateFloatingButton({
  variant = "icon-only",
  className,
  ...props
}: PollCreateFloatingButtonProps) {
  return (
    <button
      className={cn(
        "relative p-4 rounded-full shadow-lg",
        "flex items-center justify-center gap-3",
        "bg-zinc-800",
        "active:scale-95",
        "transition-all duration-200",
        className
      )}
      aria-label="투표 만들기"
      {...props}
    >
      <PointIcon className="size-6 text-white">
        <PlusIcon className="size-4.5 text-zinc-950" strokeWidth={2.8} />
      </PointIcon>
      {variant === "with-text" && (
        <Typo.ButtonText size="large" className="text-white">
          투표 만들기
        </Typo.ButtonText>
      )}
    </button>
  );
}
