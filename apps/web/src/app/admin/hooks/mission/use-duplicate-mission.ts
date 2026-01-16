"use client";

import { duplicateMission } from "@/actions/mission";
import { adminMissionQueryKeys } from "@/app/admin/constants/queryKeys";
import type { DuplicateMissionRequest, DuplicateMissionResponse } from "@/types/dto";
import { useMutation, useQueryClient } from "@tanstack/react-query";

interface UseDuplicateMissionOptions {
  onSuccess?: (data: DuplicateMissionResponse) => void;
  onError?: (error: Error) => void;
}

export function useDuplicateMission(options: UseDuplicateMissionOptions = {}) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: DuplicateMissionRequest): Promise<DuplicateMissionResponse> => {
      return duplicateMission(payload);
    },
    onSuccess: data => {
      queryClient.invalidateQueries({
        queryKey: adminMissionQueryKeys.all(),
      });
      options.onSuccess?.(data);
    },
    onError: error => {
      console.error("미션 복제 실패:", error);
      options.onError?.(error as Error);
    },
  });
}

export type UseDuplicateMissionReturn = ReturnType<typeof useDuplicateMission>;
