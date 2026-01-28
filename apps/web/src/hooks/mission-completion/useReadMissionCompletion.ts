import { getCompletionsByMissionId, getMissionCompletion } from "@/actions/mission-completion";
import { missionCompletionQueryKeys } from "@/constants/queryKeys/missionCompletionQueryKeys";
import type { GetMissionCompletionResponse } from "@/types/dto";
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

export function useReadMissionCompletionById(missionId: string, completionId: string | null) {
  return useQuery({
    queryKey: missionCompletionQueryKeys.missionCompletionById(missionId, completionId ?? ""),
    queryFn: async (): Promise<GetMissionCompletionResponse> => {
      const response = await getCompletionsByMissionId(missionId);
      const completion = response.data.find(c => c.id === completionId);
      if (!completion) {
        throw new Error("완료 화면을 찾을 수 없습니다.");
      }
      return { data: completion };
    },
    staleTime: 5 * 60 * 1000,
    refetchInterval: false,
    retry: 3,
    retryDelay: attemptIndex => Math.min(1000 * 2 ** attemptIndex, 30000),
    enabled: !!missionId && !!completionId,
  });
}

export type UseReadMissionCompletionByIdReturn = ReturnType<typeof useReadMissionCompletionById>;
