import React from "react";
import { cn } from "../../lib/utils";

type ChipVariant = "brand" | "neutral";

interface ChipProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: ChipVariant;
}

const CHIP_VARIANT_CLASS: Record<ChipVariant, string> = {
  brand: "border-violet-200 bg-violet-50 text-violet-600",
  neutral: "border-zinc-200 bg-zinc-50 text-zinc-600",
};

export function Chip({ variant = "neutral", className, children, ...props }: ChipProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[11px] font-semibold leading-none",
        CHIP_VARIANT_CLASS[variant],
        className,
      )}
      {...props}
    >
      {children}
    </span>
  );
}
