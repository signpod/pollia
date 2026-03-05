import { searchMissionsPublic } from "@/actions/search";
import { searchQueryKeys } from "@/constants/queryKeys/searchQueryKeys";
import { useQuery } from "@tanstack/react-query";

export const useSearchMissions = (query: string) => {
  return useQuery({
    queryKey: searchQueryKeys.missions(query),
    queryFn: () => searchMissionsPublic(query),
    enabled: query.trim().length > 0,
    staleTime: 5 * 60 * 1000,
    retry: 3,
    retryDelay: attemptIndex => Math.min(1000 * 2 ** attemptIndex, 30000),
  });
};

export type UseSearchMissionsReturn = ReturnType<typeof useSearchMissions>;
