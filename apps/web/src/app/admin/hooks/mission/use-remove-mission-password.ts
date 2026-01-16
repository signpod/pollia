"use client";

import { removeMissionPassword } from "@/actions/mission/update";
import { adminMissionQueryKeys } from "@/app/admin/constants/queryKeys";
import { useMutation, useQueryClient } from "@tanstack/react-query";

export function useRemoveMissionPassword(missionId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => removeMissionPassword(missionId),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: adminMissionQueryKeys.mission(missionId),
      });
    },
  });
}

export type UseRemoveMissionPasswordReturn = ReturnType<typeof useRemoveMissionPassword>;
