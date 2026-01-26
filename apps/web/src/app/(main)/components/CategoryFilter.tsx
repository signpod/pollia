"use client";

import { cn } from "@repo/ui/lib";
import { Megaphone, PartyPopper, Search, Trophy, Gamepad2 } from "lucide-react";
import type { ReactNode } from "react";

export type Category = "all" | "promotion" | "event" | "research" | "challenge" | "game";

interface CategoryItem {
  id: Category;
  label: string;
  icon: ReactNode;
}

const CATEGORIES: CategoryItem[] = [
  { id: "all", label: "전체", icon: null },
  { id: "promotion", label: "프로모션", icon: <Megaphone className="size-4" /> },
  { id: "event", label: "행사", icon: <PartyPopper className="size-4" /> },
  { id: "research", label: "리서치", icon: <Search className="size-4" /> },
  { id: "challenge", label: "챌린지", icon: <Trophy className="size-4" /> },
  { id: "game", label: "게임", icon: <Gamepad2 className="size-4" /> },
];

interface CategoryFilterProps {
  selected: Category;
  onSelect: (category: Category) => void;
}

export function CategoryFilter({ selected, onSelect }: CategoryFilterProps) {
  return (
    <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
      {CATEGORIES.map((category) => (
        <button
          key={category.id}
          type="button"
          onClick={() => onSelect(category.id)}
          className={cn(
            "flex shrink-0 items-center gap-1.5 rounded-full border px-4 py-2 text-sm font-medium transition-all",
            selected === category.id
              ? "border-violet-500 bg-violet-500 text-white"
              : "border-default bg-white text-sub hover:border-violet-300 hover:text-violet-500"
          )}
        >
          {category.icon}
          {category.label}
        </button>
      ))}
    </div>
  );
}
