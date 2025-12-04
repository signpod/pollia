import { getSurvey } from "@/actions/mission";
import { missionQueryKeys } from "@/constants/queryKeys/missionQueryKeys";
import { useQuery } from "@tanstack/react-query";

export const useReadMission = (missionId: string) => {
  return useQuery({
    queryKey: missionQueryKeys.mission(missionId),
    queryFn: () => getSurvey(missionId),
    staleTime: 5 * 60 * 1000,
    refetchInterval: 5 * 60 * 1000,
    retry: 3,
    retryDelay: attemptIndex => Math.min(1000 * 2 ** attemptIndex, 30000),
  });
};

export type UseReadMissionReturn = ReturnType<typeof useReadMission>;
