"use client";

import * as ProgressPrimitive from "@radix-ui/react-progress";
import * as React from "react";
import { cn } from "../../lib/utils";

interface ProgressBarProps extends React.ComponentPropsWithoutRef<typeof ProgressPrimitive.Root> {
  containerClassName?: string;
  indicatorClassName?: string;
}

export function ProgressBar({
  containerClassName,
  indicatorClassName,
  value,
  ...props
}: ProgressBarProps) {
  return (
    <ProgressPrimitive.Root
      className={cn("bg-light relative h-2 w-full overflow-hidden", containerClassName)}
      {...props}
    >
      <ProgressPrimitive.Indicator
        className={cn("bg-icon-default h-full w-full flex-1 transition-all", indicatorClassName)}
        style={{ transform: `translateX(-${100 - (value || 0)}%)` }}
      />
    </ProgressPrimitive.Root>
  );
}
