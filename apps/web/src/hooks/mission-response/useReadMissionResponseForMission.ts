import { getMyResponseForMission } from "@/actions/mission-response";
import { missionQueryKeys } from "@/constants/queryKeys/missionQueryKeys";
import { useQuery } from "@tanstack/react-query";

export function useReadMissionResponseForMission({ missionId }: { missionId: string }) {
  return useQuery({
    queryKey: missionQueryKeys.missionResponseForMission(missionId),
    queryFn: () => getMyResponseForMission(missionId),
    staleTime: 5 * 60 * 1000,
    refetchInterval: 5 * 60 * 1000,
    retry: 3,
    retryDelay: attemptIndex => Math.min(1000 * 2 ** attemptIndex, 30000),
    enabled: !!missionId,
  });
}

export type UseReadMissionResponseForMissionReturn = ReturnType<
  typeof useReadMissionResponseForMission
>;
