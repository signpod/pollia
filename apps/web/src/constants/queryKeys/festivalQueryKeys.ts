export const festivalQueryKeys = {
  all: () => ["festival"] as const,
  list: (areaCode?: string) =>
    areaCode ? (["festival", "list", areaCode] as const) : (["festival", "list"] as const),
  infinite: (areaCode?: string) =>
    areaCode
      ? (["festival", "infinite", areaCode] as const)
      : (["festival", "infinite"] as const),
  detail: (festivalId: string) => ["festival", "detail", festivalId] as const,
} as const;

export type FestivalQueryKeys = typeof festivalQueryKeys;
