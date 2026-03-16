export const adminV2UserQueryKeys = {
  all: () => ["admin-v2", "users"] as const,
  list: (params?: Record<string, unknown>) =>
    params
      ? (["admin-v2", "users", "list", params] as const)
      : (["admin-v2", "users", "list"] as const),
} as const;

export const adminV2MissionQueryKeys = {
  all: () => ["admin-v2", "missions"] as const,
  list: (params?: Record<string, unknown>) =>
    params
      ? (["admin-v2", "missions", "list", params] as const)
      : (["admin-v2", "missions", "list"] as const),
} as const;

export const adminV2BannerQueryKeys = {
  all: () => ["admin-v2", "banners"] as const,
  list: () => ["admin-v2", "banners", "list"] as const,
} as const;
