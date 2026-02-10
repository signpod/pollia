import { getAllMissions } from "@/actions/mission";
import { missionQueryKeys } from "@/constants/queryKeys/missionQueryKeys";
import { MissionType } from "@prisma/client";
import { useInfiniteQuery } from "@tanstack/react-query";

export const useReadAllMissions = (params?: { options?: { limit?: number } }) => {
  return useInfiniteQuery({
    queryKey: missionQueryKeys.allMissions(),
    queryFn: ({ pageParam }) => {
      return getAllMissions({
        cursor: pageParam,
        limit: params?.options?.limit ?? 10,
        type: MissionType.GENERAL,
      });
    },
    initialPageParam: undefined as string | undefined,
    getNextPageParam: lastPage => lastPage.nextCursor,
    staleTime: 5 * 60 * 1000,
    refetchInterval: 5 * 60 * 1000,
    retry: 3,
    retryDelay: attemptIndex => Math.min(1000 * 2 ** attemptIndex, 30000),
  });
};

export type UseReadAllMissionsReturn = ReturnType<typeof useReadAllMissions>;
