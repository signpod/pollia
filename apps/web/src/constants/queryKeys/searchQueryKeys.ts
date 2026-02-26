export const searchQueryKeys = {
  missions: (query: string) => ["search-missions", query] as const,
} as const;

export type SearchQueryKeys = typeof searchQueryKeys;
