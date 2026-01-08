"use client";

import { syncMissionToNotion } from "@/actions/mission";
import type { SyncMissionToNotionResponse } from "@/types/dto";
import { useMutation } from "@tanstack/react-query";

interface UseSyncMissionToNotionOptions {
  onSuccess?: (data: SyncMissionToNotionResponse) => void;
  onError?: (error: Error) => void;
}

export function useSyncMissionToNotion(options: UseSyncMissionToNotionOptions = {}) {
  return useMutation({
    mutationFn: async (missionId: string): Promise<SyncMissionToNotionResponse> =>
      syncMissionToNotion(missionId),
    onSuccess: data => {
      options.onSuccess?.(data);
    },
    onError: error => {
      options.onError?.(error as Error);
    },
  });
}
