"use client";

import { assertActionSuccess } from "@/actions/common/error";
import { deleteMission } from "@/actions/mission/delete";
import { adminV2MissionQueryKeys } from "@/app/admin/(v2)/v2/constants/queryKeys";
import { useMutation, useQueryClient } from "@tanstack/react-query";

export function useAdminDeleteMission() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (missionId: string) => {
      const result = await deleteMission(missionId);
      assertActionSuccess(result);
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: adminV2MissionQueryKeys.all() });
    },
  });
}

export type UseAdminDeleteMissionReturn = ReturnType<typeof useAdminDeleteMission>;
