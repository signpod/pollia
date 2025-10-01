export const userQueryKeys = {
  currentUser: () => ["current-user"] as const,
  userStats: () => ["user-stats"] as const,
} as const;

export type UserQueryKeys = typeof userQueryKeys;
