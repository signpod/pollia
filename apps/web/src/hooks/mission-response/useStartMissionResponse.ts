"use client";

import { startMissionResponse } from "@/actions/mission-response";
import type {
  StartMissionResponseRequest,
  StartMissionResponseResponse,
} from "@/types/dto/mission-response";
import { useMutation } from "@tanstack/react-query";

interface UseStartMissionResponseOptions {
  onSuccess?: (data: StartMissionResponseResponse) => void;
  onError?: (error: Error) => void;
}

export function useStartMissionResponse(options: UseStartMissionResponseOptions = {}) {
  return useMutation({
    mutationFn: async (
      payload: StartMissionResponseRequest,
    ): Promise<StartMissionResponseResponse> => startMissionResponse(payload),
    onSuccess: data => {
      options.onSuccess?.(data);
    },
    onError: error => {
      console.error("❌ 설문 응답 시작 실패:", error);
      options.onError?.(error as Error);
    },
  });
}

export type UseStartMissionResponseReturn = ReturnType<typeof useStartMissionResponse>;
