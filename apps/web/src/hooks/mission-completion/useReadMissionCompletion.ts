import { getMissionCompletion } from "@/actions/mission-completion";
import { missionCompletionQueryKeys } from "@/constants/queryKeys/missionCompletionQueryKeys";
import { useQuery } from "@tanstack/react-query";

export function useReadMissionCompletion(missionId: string) {
  return useQuery({
    queryKey: missionCompletionQueryKeys.missionCompletion(missionId),
    queryFn: () => getMissionCompletion(missionId),
    staleTime: 5 * 60 * 1000,
    refetchInterval: false,
    retry: 3,
    retryDelay: attemptIndex => Math.min(1000 * 2 ** attemptIndex, 30000),
    enabled: !!missionId,
  });
}

export type UseReadMissionCompletionReturn = ReturnType<typeof useReadMissionCompletion>;
