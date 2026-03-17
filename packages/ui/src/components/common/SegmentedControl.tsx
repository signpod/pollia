"use client";

import { motion } from "framer-motion";
import { cn } from "../../lib/utils";
import { Typo } from "./Typo";

interface SegmentedControlItem {
  value: string;
  label: string;
}

interface SegmentedControlProps {
  items: SegmentedControlItem[];
  value: string;
  onValueChange: (value: string) => void;
  className?: string;
}

export function SegmentedControl({
  items,
  value,
  onValueChange,
  className,
}: SegmentedControlProps) {
  const activeIndex = items.findIndex(item => item.value === value);

  return (
    <div className={cn("relative flex items-center rounded-xl bg-zinc-100 p-1", className)}>
      <motion.div
        className="absolute top-1 bottom-1 rounded-sm bg-white"
        initial={false}
        animate={{
          left: `calc(${(activeIndex / items.length) * 100}% + 4px)`,
          width: `calc(${100 / items.length}% - 8px)`,
        }}
        transition={{ type: "tween", duration: 0.2, ease: "easeInOut" }}
      />
      {items.map(item => {
        const isActive = item.value === value;
        return (
          <button
            key={item.value}
            type="button"
            onClick={() => onValueChange(item.value)}
            className={cn(
              "relative flex h-9 shrink-0 flex-1 items-center justify-center rounded-sm px-3",
              "transition-colors",
              isActive ? "text-zinc-950" : "text-zinc-400",
            )}
          >
            <Typo.ButtonText size="medium" className="whitespace-nowrap">
              {item.label}
            </Typo.ButtonText>
          </button>
        );
      })}
    </div>
  );
}
