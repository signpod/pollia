import { verifyMissionPassword } from "@/actions/mission";
import { missionQueryKeys } from "@/constants/queryKeys/missionQueryKeys";
import { useQuery } from "@tanstack/react-query";

export const useVerifyMissionPassword = ({
  missionId,
  password,
}: { missionId: string; password: string }) => {
  return useQuery({
    queryKey: missionQueryKeys.verifyMissionPassword(missionId, password),
    queryFn: () => verifyMissionPassword(missionId, password),
    staleTime: 0,
    gcTime: 0,
    retry: 3,
    retryDelay: attemptIndex => Math.min(1000 * 2 ** attemptIndex, 30000),
    enabled: !!missionId && password.length === 6,
  });
};

export type UseVerifyMissionPasswordReturn = ReturnType<typeof useVerifyMissionPassword>;
