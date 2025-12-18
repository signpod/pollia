"use client";

import { setMissionPassword } from "@/actions/mission/update";
import { adminMissionQueryKeys } from "@/app/admin/constants/queryKeys";
import { useMutation, useQueryClient } from "@tanstack/react-query";

export function useSetMissionPassword(missionId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (password: string) => setMissionPassword(missionId, password),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: adminMissionQueryKeys.mission(missionId),
      });
      console.log("success");
    },
  });
}

export type UseSetMissionPasswordReturn = ReturnType<typeof useSetMissionPassword>;
