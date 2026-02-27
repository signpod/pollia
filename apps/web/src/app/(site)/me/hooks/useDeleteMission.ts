"use client";

import { deleteMission } from "@/actions/mission/delete";
import { toast } from "@/components/common/Toast";
import { missionQueryKeys } from "@/constants/queryKeys/missionQueryKeys";
import { useMutation, useQueryClient } from "@tanstack/react-query";

export function useDeleteMission() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (missionId: string) => {
      return await deleteMission(missionId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: missionQueryKeys.userMissions(),
      });
      toast.success("콘텐츠가 삭제되었습니다.");
    },
    onError: error => {
      console.error("콘텐츠 삭제 실패:", error);
      toast.warning("콘텐츠 삭제 중 오류가 발생했습니다.");
    },
  });
}

export type UseDeleteMissionReturn = ReturnType<typeof useDeleteMission>;
