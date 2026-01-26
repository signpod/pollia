import type { Category } from "./CategoryFilter";

interface CategoryConfig {
  label: string;
  bgClass: string;
  textClass: string;
}

const CATEGORY_STYLES: Record<Exclude<Category, "all">, CategoryConfig> = {
  promotion: {
    label: "프로모션",
    bgClass: "bg-orange-100/90",
    textClass: "text-orange-600",
  },
  event: {
    label: "행사",
    bgClass: "bg-pink-100/90",
    textClass: "text-pink-600",
  },
  research: {
    label: "리서치",
    bgClass: "bg-blue-100/90",
    textClass: "text-blue-600",
  },
  challenge: {
    label: "챌린지",
    bgClass: "bg-emerald-100/90",
    textClass: "text-emerald-600",
  },
  game: {
    label: "게임",
    bgClass: "bg-purple-100/90",
    textClass: "text-purple-600",
  },
};

const CATEGORY_KEYS = Object.keys(CATEGORY_STYLES) as Exclude<Category, "all">[];

export function getRandomCategory(id: string): Exclude<Category, "all"> {
  // id를 기반으로 일관된 카테고리 반환 (같은 id는 항상 같은 카테고리)
  let hash = 0;
  for (let i = 0; i < id.length; i++) {
    hash = (hash << 5) - hash + id.charCodeAt(i);
    hash |= 0;
  }
  const index = Math.abs(hash) % CATEGORY_KEYS.length;
  return CATEGORY_KEYS[index] as Exclude<Category, "all">;
}

interface CategoryBadgeProps {
  category: Exclude<Category, "all">;
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
