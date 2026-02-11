"use client";

import { cn } from "@/lib/utils";
import { Tab } from "@repo/ui/components";
import { type Category, CATEGORIES } from "./CategoryFilter";

interface StickyCategoryTabProps {
  selected: Category;
  onSelect: (category: Category) => void;
  visible: boolean;
}

export function StickyCategoryTab({ selected, onSelect, visible }: StickyCategoryTabProps) {
  return (
    <div
      className={cn(
        "sticky top-12 z-40 overflow-hidden bg-white",
        "transition-[max-height,opacity] duration-200",
        visible ? "max-h-12 opacity-100" : "max-h-0 opacity-0",
      )}
    >
      <Tab.Root value={selected} onValueChange={(v) => onSelect(v as Category)}>
        <Tab.List>
          {CATEGORIES.map((category) => (
            <Tab.Item key={category.id} value={category.id}>
              <span className="text-sm font-semibold">{category.label}</span>
            </Tab.Item>
          ))}
        </Tab.List>
      </Tab.Root>
    </div>
  );
}
