"use client";

import { completeMissionResponse, getMyResponseForMission } from "@/actions/mission-response";
import { missionQueryKeys } from "@/constants/queryKeys/missionQueryKeys";
import { useMutation, useQueryClient } from "@tanstack/react-query";

interface CompleteMissionPayload {
  responseId: string;
}

interface UseCompleteMissionOptions {
  missionId: string;
  onSuccess?: () => void;
  onError?: (error: Error) => void;
  onAlreadyCompleted?: () => void;
}

export function useCompleteMission(options: UseCompleteMissionOptions) {
  const queryClient = useQueryClient();
  const { missionId } = options;

  return useMutation({
    mutationFn: async ({ responseId }: CompleteMissionPayload) => {
      const freshResponse = await getMyResponseForMission(missionId);
      if (freshResponse?.data?.completedAt) {
        throw new Error("ALREADY_COMPLETED");
      }

      return await completeMissionResponse({ responseId });
    },
    onSuccess: () => {
      options.onSuccess?.();
      queryClient.invalidateQueries({
        queryKey: missionQueryKeys.missionResponseForMission(missionId),
      });
    },
    onError: error => {
      if (error instanceof Error && error.message === "ALREADY_COMPLETED") {
        options.onAlreadyCompleted?.();
        return;
      }
      console.error("❌ 미션 완료 처리 실패:", error);
      options.onError?.(error as Error);
    },
  });
}

export type UseCompleteMissionReturn = ReturnType<typeof useCompleteMission>;
