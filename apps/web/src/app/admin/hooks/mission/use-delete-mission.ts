"use client";

import { deleteMission } from "@/actions/mission/delete";
import { adminMissionQueryKeys } from "@/app/admin/constants/queryKeys";
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
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: adminMissionQueryKeys.missions(),
      });
      options.onSuccess?.();
    },
    onError: error => {
      console.error("미션 삭제 실패:", error);
      options.onError?.(error as Error);
    },
  });
}

export type UseDeleteMissionReturn = ReturnType<typeof useDeleteMission>;
