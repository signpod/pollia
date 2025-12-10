import { getMyResponseForMission } from "@/actions/mission-response";
import { missionQueryKeys } from "@/constants/queryKeys/missionQueryKeys";
import { useCurrentUser } from "@/hooks/user";
import { useQuery } from "@tanstack/react-query";

export function useReadMissionResponseForMission({ missionId }: { missionId: string }) {
  const { data: currentUser } = useCurrentUser();
  const isLoggedIn = !!currentUser?.id;

  return useQuery({
    queryKey: missionQueryKeys.missionResponseForMission(missionId),
    queryFn: () => getMyResponseForMission(missionId),
    staleTime: 5 * 60 * 1000,
    refetchInterval: 5 * 60 * 1000,
    retry: 3,
    retryDelay: attemptIndex => Math.min(1000 * 2 ** attemptIndex, 30000),
    enabled: !!missionId && isLoggedIn,
  });
}

export type UseReadMissionResponseForMissionReturn = ReturnType<
  typeof useReadMissionResponseForMission
>;
