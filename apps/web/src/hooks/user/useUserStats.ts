import { useQuery } from "@tanstack/react-query";
import { getUserStats } from "@/actions/user";
import { userQueryKeys } from "@/constants/queryKeys/userQueryKeys";

export const useUserStats = () => {
  return useQuery({
    queryKey: userQueryKeys.userStats(),
    queryFn: () => {
      return getUserStats();
    },
    staleTime: 2 * 60 * 1000, // 2분
    refetchInterval: 2 * 60 * 1000, // 2분마다 자동 갱신
    retry: 3,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
  });
};

export type UseUserStatsReturn = ReturnType<typeof useUserStats>;
