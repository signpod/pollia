import * as React from "react";
import { cn } from "../../lib/utils";

interface ProgressBarV3Props {
  value: number;
  className?: string;
}

function ProgressBarV3Component({ value, className }: ProgressBarV3Props) {
  const clamped = Math.min(100, Math.max(0, value));

  return (
    <div className={cn("flex items-center gap-1", className)}>
      <div className="w-[50px] h-[4px] rounded-full bg-zinc-100 overflow-hidden">
        <div className="h-full rounded-full bg-zinc-600" style={{ width: `${clamped}%` }} />
      </div>
      <span className="text-[12px] font-extrabold text-info leading-none">
        {Math.round(clamped)}%
      </span>
    </div>
  );
}

export const ProgressBarV3 = React.memo(ProgressBarV3Component);
