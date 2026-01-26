import { getFestivals } from "@/actions/festival";
import { festivalQueryKeys } from "@/constants/queryKeys/festivalQueryKeys";
import { useInfiniteQuery, useQuery } from "@tanstack/react-query";

interface UseReadFestivalsOptions {
  areaCode?: string;
  numOfRows?: number;
  enabled?: boolean;
}

export const useReadFestivals = (options: UseReadFestivalsOptions = {}) => {
  const { areaCode, numOfRows = 8, enabled = true } = options;

  return useQuery({
    queryKey: festivalQueryKeys.list(areaCode),
    queryFn: () => getFestivals({ areaCode, numOfRows }),
    staleTime: 30 * 60 * 1000,
    refetchInterval: 30 * 60 * 1000,
    retry: 3,
    retryDelay: attemptIndex => Math.min(1000 * 2 ** attemptIndex, 30000),
    enabled,
  });
};

export type UseReadFestivalsReturn = ReturnType<typeof useReadFestivals>;

export const useReadFestivalsInfinite = (options: UseReadFestivalsOptions = {}) => {
  const { areaCode, numOfRows = 12, enabled = true } = options;

  return useInfiniteQuery({
    queryKey: festivalQueryKeys.infinite(areaCode),
    queryFn: ({ pageParam = 1 }) => getFestivals({ areaCode, numOfRows, pageNo: pageParam }),
    getNextPageParam: (lastPage) => {
      const totalPages = Math.ceil(lastPage.totalCount / lastPage.numOfRows);
      if (lastPage.pageNo < totalPages) {
        return lastPage.pageNo + 1;
      }
      return undefined;
    },
    initialPageParam: 1,
    staleTime: 30 * 60 * 1000,
    retry: 3,
    retryDelay: attemptIndex => Math.min(1000 * 2 ** attemptIndex, 30000),
    enabled,
  });
};

export type UseReadFestivalsInfiniteReturn = ReturnType<typeof useReadFestivalsInfinite>;
