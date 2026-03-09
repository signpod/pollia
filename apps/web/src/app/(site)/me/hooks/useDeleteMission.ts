"use client";

import { toMutationFn } from "@/actions/common/error";
import { deleteMission } from "@/actions/mission/delete";
import { toast } from "@/components/common/Toast";
import { missionQueryKeys } from "@/constants/queryKeys/missionQueryKeys";
import UBIQUITOUS_CONSTANTS from "@/constants/ubiquitous";
import { useMutation, useQueryClient } from "@tanstack/react-query";

export function useDeleteMission() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: toMutationFn(deleteMission),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: missionQueryKeys.userMissions(),
      });
      toast.success(`${UBIQUITOUS_CONSTANTS.MISSION}가 삭제되었습니다.`);
    },
    onError: error => {
      console.error(`${UBIQUITOUS_CONSTANTS.MISSION} 삭제 실패:`, error);
      toast.warning(`${UBIQUITOUS_CONSTANTS.MISSION} 삭제 중 오류가 발생했습니다.`);
    },
  });
}

export type UseDeleteMissionReturn = ReturnType<typeof useDeleteMission>;
