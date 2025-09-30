import { useQuery } from "@tanstack/react-query";
import { getCurrentUser, getUserStats } from "@/actions/user";
import { userQueryKeys } from "@/constants/queryKeys/userQueryKeys";

export const useCurrentUser = () => {
  return useQuery({
    queryKey: userQueryKeys.currentUser(),
    queryFn: () => {
      return getCurrentUser();
    },
    staleTime: 5 * 60 * 1000,
    refetchInterval: 5 * 60 * 1000,
    retry: 3,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
  });
};

export type UseCurrentUserReturn = ReturnType<typeof useCurrentUser>;

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
