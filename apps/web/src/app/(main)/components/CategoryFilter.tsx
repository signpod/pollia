"use client";

import { cn } from "@repo/ui/lib";
import { HelpCircle, Megaphone, PartyPopper, Search, Trophy } from "lucide-react";
import { type ReactNode, useRef, useState } from "react";

export type Category = "all" | "PROMOTION" | "EVENT" | "RESEARCH" | "CHALLENGE" | "QUIZ";

interface CategoryItem {
  id: Category;
  label: string;
  icon: ReactNode;
}

const CATEGORIES: CategoryItem[] = [
  { id: "all", label: "전체", icon: null },
  { id: "PROMOTION", label: "프로모션", icon: <Megaphone className="size-4" /> },
  { id: "EVENT", label: "행사", icon: <PartyPopper className="size-4" /> },
  { id: "RESEARCH", label: "리서치", icon: <Search className="size-4" /> },
  { id: "CHALLENGE", label: "챌린지", icon: <Trophy className="size-4" /> },
  { id: "QUIZ", label: "퀴즈", icon: <HelpCircle className="size-4" /> },
];

interface CategoryFilterProps {
  selected: Category;
  onSelect: (category: Category) => void;
}

export function CategoryFilter({ selected, onSelect }: CategoryFilterProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [scrollLeft, setScrollLeft] = useState(0);

  const handleMouseDown = (e: React.MouseEvent) => {
    if (!scrollRef.current) return;
    setIsDragging(true);
    setStartX(e.pageX - scrollRef.current.offsetLeft);
    setScrollLeft(scrollRef.current.scrollLeft);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || !scrollRef.current) return;
    e.preventDefault();
    const x = e.pageX - scrollRef.current.offsetLeft;
    const walk = (x - startX) * 1.5;
    scrollRef.current.scrollLeft = scrollLeft - walk;
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  return (
    <div
      ref={scrollRef}
      className={cn(
        "flex gap-2 overflow-x-auto pb-2",
        "[&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]",
        isDragging ? "cursor-grabbing" : "cursor-grab"
      )}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
    >
      {CATEGORIES.map(category => (
        <button
          key={category.id}
          type="button"
          onClick={() => !isDragging && onSelect(category.id)}
          className={cn(
            "flex shrink-0 items-center gap-1.5 rounded-full border px-4 py-2 text-sm font-medium transition-all select-none",
            selected === category.id
              ? "border-violet-500 bg-violet-500 text-white"
              : "border-default bg-white text-sub hover:border-violet-300 hover:text-violet-500",
          )}
        >
          {category.icon}
          {category.label}
        </button>
      ))}
    </div>
  );
}
