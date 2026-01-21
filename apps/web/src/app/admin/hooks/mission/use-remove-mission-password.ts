"use client";

import { removeMissionPassword } from "@/actions/mission/update";
import { adminMissionQueryKeys } from "@/app/admin/constants/queryKeys";
import { useMutation, useQueryClient } from "@tanstack/react-query";

interface UseRemoveMissionPasswordOptions {
  onSuccess?: () => void;
  onError?: (error: Error) => void;
}

export function useRemoveMissionPassword(
  missionId: string,
  options: UseRemoveMissionPasswordOptions = {},
) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => removeMissionPassword(missionId),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: adminMissionQueryKeys.detail(missionId),
      });
      options.onSuccess?.();
    },
    onError: error => {
      console.error("미션 비밀번호 삭제 실패:", error);
      options.onError?.(error as Error);
    },
  });
}

export type UseRemoveMissionPasswordReturn = ReturnType<typeof useRemoveMissionPassword>;
