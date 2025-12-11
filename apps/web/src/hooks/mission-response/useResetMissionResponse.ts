import { deleteMissionResponse } from "@/actions/mission-response/delete";
import { missionQueryKeys } from "@/constants/queryKeys/missionQueryKeys";
import { useMutation, useQueryClient } from "@tanstack/react-query";

export function useResetMissionResponse({ missionId }: { missionId: string }) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (responseId: string) => {
      return await deleteMissionResponse(responseId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: missionQueryKeys.missionResponseForMission(missionId),
      });
    },
    onError: error => {
      console.error("❌ 설문 응답 초기화 실패:", error);
    },
  });
}
