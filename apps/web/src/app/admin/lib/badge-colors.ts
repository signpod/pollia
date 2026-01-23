export const BADGE_COLORS = {
  active:
    "bg-green-500/10 text-green-700 dark:bg-green-500/20 dark:text-green-400 hover:bg-green-500/20",
  inactive: "bg-gray-500/10 text-gray-700 dark:bg-gray-500/20 dark:text-gray-400",
  ongoing: "bg-green-500/10 text-green-700 dark:bg-green-500/20 dark:text-green-400",
  upcoming: "bg-blue-500/10 text-blue-700 dark:bg-blue-500/20 dark:text-blue-400",
  ended: "bg-gray-500/10 text-gray-700 dark:bg-gray-500/20 dark:text-gray-400",
  unset: "bg-gray-500/10 text-gray-700 dark:bg-gray-500/20 dark:text-gray-400",
} as const;

export type BadgeColorKey = keyof typeof BADGE_COLORS;
