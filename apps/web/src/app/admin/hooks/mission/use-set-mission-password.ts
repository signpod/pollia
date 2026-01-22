"use client";

import { setMissionPassword } from "@/actions/mission/update";
import { adminMissionQueryKeys } from "@/app/admin/constants/queryKeys";
import { useMutation, useQueryClient } from "@tanstack/react-query";

interface UseSetMissionPasswordOptions {
  onSuccess?: () => void;
  onError?: (error: Error) => void;
}

export function useSetMissionPassword(
  missionId: string,
  options: UseSetMissionPasswordOptions = {},
) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (password: string) => setMissionPassword(missionId, password),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: adminMissionQueryKeys.detail(missionId),
      });
      options.onSuccess?.();
    },
    onError: error => {
      console.error("미션 비밀번호 설정 실패:", error);
      options.onError?.(error as Error);
    },
  });
}

export type UseSetMissionPasswordReturn = ReturnType<typeof useSetMissionPassword>;
