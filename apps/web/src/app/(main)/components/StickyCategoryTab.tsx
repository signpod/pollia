"use client";

import { cn } from "@/lib/utils";
import { Tab } from "@repo/ui/components";
import { CATEGORIES, type Category } from "./CategoryFilter";

interface StickyCategoryTabProps {
  selected: Category;
  onSelect: (category: Category) => void;
  visible: boolean;
}

export function StickyCategoryTab({ selected, onSelect, visible }: StickyCategoryTabProps) {
  if (!visible) return null;

  return (
    <div className="sticky top-12 z-40 overflow-hidden bg-white">
      <Tab.Root
        value={selected}
        onValueChange={v => onSelect(v as Category)}
        pointColor="secondary"
        scrollable
      >
        <Tab.List>
          {CATEGORIES.map(category => (
            <Tab.Item key={category.id} value={category.id}>
              <span className="text-sm font-semibold">{category.label}</span>
            </Tab.Item>
          ))}
        </Tab.List>
      </Tab.Root>
    </div>
  );
}
