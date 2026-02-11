"use client";

import CategoryAllIcon from "@public/svgs/category-all-icon.svg";
import CategoryChallengeIcon from "@public/svgs/category-challenge-icon.svg";
import CategoryEventIcon from "@public/svgs/category-event-icon.svg";
import CategoryQuizIcon from "@public/svgs/category-quiz-icon.svg";
import CategoryResearchIcon from "@public/svgs/category-research-icon.svg";
import CategoryTestIcon from "@public/svgs/category-test-icon.svg";
import type { ComponentType, SVGProps } from "react";

// TODO: Prisma에 PSYCHOLOGICAL_TEST enum이 추가되면 MissionCategory 타입으로 변경
export type Category =
  | "all"
  | "PROMOTION"
  | "EVENT"
  | "RESEARCH"
  | "CHALLENGE"
  | "QUIZ"
  | "PSYCHOLOGICAL_TEST";

interface CategoryItem {
  id: Category;
  label: string;
  icon: ComponentType<SVGProps<SVGSVGElement>>;
}

export const CATEGORIES: CategoryItem[] = [
  { id: "all", label: "전체", icon: CategoryAllIcon },
  { id: "EVENT", label: "이벤트", icon: CategoryEventIcon },
  { id: "CHALLENGE", label: "챌린지", icon: CategoryChallengeIcon },
  { id: "RESEARCH", label: "리서치", icon: CategoryResearchIcon },
  // TODO: Prisma에 PSYCHOLOGICAL_TEST enum 추가 후 id 변경
  { id: "PSYCHOLOGICAL_TEST", label: "심리테스트", icon: CategoryTestIcon },
  { id: "QUIZ", label: "퀴즈/게임", icon: CategoryQuizIcon },
];

interface CategoryFilterProps {
  selected: Category;
  onSelect: (category: Category) => void;
}

export function CategoryFilter({ selected, onSelect }: CategoryFilterProps) {
  return (
    <div className="overflow-x-auto bg-white scrollbar-hide">
      <div className="flex min-w-full items-start justify-between gap-4 px-6 py-2">
        {CATEGORIES.map(category => {
          const isSelected = selected === category.id;
          const Icon = category.icon;

          return (
            <button
              key={category.id}
              type="button"
              onClick={() => onSelect(category.id)}
              className="flex shrink-0 flex-col items-center gap-2"
            >
              <div className="flex items-center justify-center rounded-full bg-zinc-50 p-4">
                <Icon className="size-8" />
              </div>
              <div className="flex flex-col items-center gap-0.5">
                <span className="text-sm font-semibold text-default">{category.label}</span>
                <div className="flex items-center justify-center size-3">
                  <span
                    className={`size-[4px] rounded-full ${isSelected ? "bg-zinc-800" : "bg-transparent"}`}
                  />
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
