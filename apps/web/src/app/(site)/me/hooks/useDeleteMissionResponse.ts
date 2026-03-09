"use client";

import { toMutationFn } from "@/actions/common/error";
import { deleteMissionResponse } from "@/actions/mission-response/delete";
import { toast } from "@/components/common/Toast";
import { missionQueryKeys } from "@/constants/queryKeys/missionQueryKeys";
import { useMutation, useQueryClient } from "@tanstack/react-query";

export function useDeleteMissionResponse() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: toMutationFn(deleteMissionResponse),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: missionQueryKeys.myResponses(),
      });
      toast.success("응답이 삭제되었습니다.");
    },
    onError: error => {
      console.error("응답 삭제 실패:", error);
      toast.warning("응답 삭제 중 오류가 발생했습니다.");
    },
  });
}

export type UseDeleteMissionResponseReturn = ReturnType<typeof useDeleteMissionResponse>;
