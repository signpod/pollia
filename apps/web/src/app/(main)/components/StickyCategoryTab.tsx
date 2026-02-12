"use client";

import { Tab } from "@repo/ui/components";
import type { RefObject } from "react";
import { CATEGORIES, type Category } from "./CategoryFilter";

interface StickyCategoryTabProps {
  containerRef?: RefObject<HTMLDivElement | null>;
  selected: Category;
  onSelect: (category: Category) => void;
}

export function StickyCategoryTab({ containerRef, selected, onSelect }: StickyCategoryTabProps) {
  return (
    <div
      ref={containerRef}
      className="fixed top-12 left-1/2 z-40 w-full max-w-[600px] -translate-x-1/2 overflow-hidden bg-white transition-opacity duration-150"
      style={{ opacity: 0, pointerEvents: "none" }}
    >
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
