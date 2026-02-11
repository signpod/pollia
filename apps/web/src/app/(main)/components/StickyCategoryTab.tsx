"use client";

import { cn } from "@/lib/utils";
import { Tab } from "@repo/ui/components";
import useEmblaCarousel from "embla-carousel-react";
import { useCallback, useEffect } from "react";
import { CATEGORIES, type Category } from "./CategoryFilter";

interface StickyCategoryTabProps {
  selected: Category;
  onSelect: (category: Category) => void;
  visible: boolean;
}

export function StickyCategoryTab({ selected, onSelect, visible }: StickyCategoryTabProps) {
  const [emblaRef, emblaApi] = useEmblaCarousel({
    align: "start",
    containScroll: "trimSnaps",
    dragFree: true,
  });

  const scrollToSelected = useCallback(() => {
    if (!emblaApi) return;
    const index = CATEGORIES.findIndex(c => c.id === selected);
    if (index >= 0) emblaApi.scrollTo(index);
  }, [emblaApi, selected]);

  useEffect(() => {
    scrollToSelected();
  }, [scrollToSelected]);

  return (
    <div
      className={cn(
        "sticky top-12 z-40 overflow-hidden bg-white",
        "transition-[max-height,opacity] duration-200",
        visible ? "max-h-12 opacity-100" : "max-h-0 opacity-0",
      )}
    >
      <Tab.Root
        value={selected}
        onValueChange={v => onSelect(v as Category)}
        pointColor="secondary"
        scrollable
      >
        <div className="overflow-hidden" ref={emblaRef}>
          <Tab.List className="w-max border-b-0">
            {CATEGORIES.map(category => (
              <Tab.Item key={category.id} value={category.id}>
                <span className="text-sm font-semibold">{category.label}</span>
              </Tab.Item>
            ))}
          </Tab.List>
        </div>
      </Tab.Root>
    </div>
  );
}
