import type { MissionCategory } from "@prisma/client";

interface CategoryConfig {
  label: string;
  bgClass: string;
  textClass: string;
}

const CATEGORY_STYLES: Record<MissionCategory, CategoryConfig> = {
  PROMOTION: {
    label: "프로모션",
    bgClass: "bg-orange-100/90",
    textClass: "text-orange-600",
  },
  EVENT: {
    label: "이벤트",
    bgClass: "bg-pink-100/90",
    textClass: "text-pink-600",
  },
  RESEARCH: {
    label: "리서치",
    bgClass: "bg-blue-100/90",
    textClass: "text-blue-600",
  },
  CHALLENGE: {
    label: "챌린지",
    bgClass: "bg-emerald-100/90",
    textClass: "text-emerald-600",
  },
  QUIZ: {
    label: "퀴즈",
    bgClass: "bg-purple-100/90",
    textClass: "text-purple-600",
  },
};

// TODO: PSYCHOLOGICAL_TEST enum이 Prisma에 추가되면 여기에도 라벨 추가
export const CATEGORY_LABELS: Record<string, string> = {
  PROMOTION: "프로모션",
  EVENT: "이벤트",
  RESEARCH: "리서치",
  CHALLENGE: "챌린지",
  QUIZ: "퀴즈/게임",
  PSYCHOLOGICAL_TEST: "심리테스트",
};

interface CategoryBadgeProps {
  category: MissionCategory;
}

export function CategoryBadge({ category }: CategoryBadgeProps) {
  const config = CATEGORY_STYLES[category];

  return (
    <span
      className={`rounded-md px-2 py-1 text-xs font-semibold ${config.bgClass} ${config.textClass}`}
    >
      {config.label}
    </span>
  );
}
