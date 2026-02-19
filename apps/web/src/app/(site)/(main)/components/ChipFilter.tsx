"use client";

import { cn } from "@repo/ui/lib";
import { useState } from "react";

interface ChipFilterProps {
  chips: string[];
  defaultActive?: number;
  onSelect?: (chip: string, index: number) => void;
}

export function ChipFilter({ chips, defaultActive = 0, onSelect }: ChipFilterProps) {
  const [activeIndex, setActiveIndex] = useState(defaultActive);

  const handleClick = (chip: string, index: number) => {
    setActiveIndex(index);
    onSelect?.(chip, index);
  };

  return (
    <div className="mb-5 flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
      {chips.map((chip, index) => (
        <button
          key={chip}
          type="button"
          onClick={() => handleClick(chip, index)}
          className={cn(
            "shrink-0 rounded-full border px-4 py-2 text-sm font-medium transition-colors",
            activeIndex === index
              ? "border-violet-500 bg-violet-500 text-white"
              : "border-default bg-default text-sub hover:border-violet-500 hover:text-violet-500",
          )}
        >
          {chip}
        </button>
      ))}
    </div>
  );
}
