"use client";

import { startMissionResponse } from "@/actions/mission-response";
import { missionQueryKeys } from "@/constants/queryKeys/missionQueryKeys";
import type {
  StartMissionResponseRequest,
  StartMissionResponseResponse,
} from "@/types/dto/mission-response";
import { useMutation, useQueryClient } from "@tanstack/react-query";

interface UseStartMissionResponseOptions {
  onSuccess?: (data: StartMissionResponseResponse) => void;
  onError?: (error: Error) => void;
}

export function useStartMissionResponse(options: UseStartMissionResponseOptions = {}) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (
      payload: StartMissionResponseRequest,
    ): Promise<StartMissionResponseResponse> => startMissionResponse(payload),
    onSuccess: (data, payload) => {
      options.onSuccess?.(data);
      queryClient.invalidateQueries({
        queryKey: missionQueryKeys.missionResponseForMission(payload.missionId),
      });
    },
    onError: error => {
      console.error("❌ 설문 응답 시작 실패:", error);
      options.onError?.(error as Error);
    },
  });
}

export type UseStartMissionResponseReturn = ReturnType<typeof useStartMissionResponse>;
