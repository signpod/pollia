"use client";

import { deleteMission } from "@/actions/mission/delete";
import { adminEventQueryKeys, adminMissionQueryKeys } from "@/app/admin/constants/queryKeys";
import UBIQUITOUS_CONSTANTS from "@/constants/ubiquitous";
import { useMutation, useQueryClient } from "@tanstack/react-query";

interface UseDeleteMissionOptions {
  onSuccess?: () => void;
  onError?: (error: Error) => void;
}

export function useDeleteMission(options: UseDeleteMissionOptions = {}) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (missionId: string) => {
      return deleteMission(missionId);
    },
    onSuccess: (_data, missionId) => {
      queryClient.removeQueries({
        queryKey: adminMissionQueryKeys.detail(missionId),
      });
      queryClient.invalidateQueries({
        queryKey: adminMissionQueryKeys.all(),
      });
      queryClient.invalidateQueries({
        queryKey: adminEventQueryKeys.all(),
      });
      options.onSuccess?.();
    },
    onError: error => {
      console.error(`${UBIQUITOUS_CONSTANTS.MISSION} 삭제 실패:`, error);
      options.onError?.(error as Error);
    },
  });
}

export type UseDeleteMissionReturn = ReturnType<typeof useDeleteMission>;
