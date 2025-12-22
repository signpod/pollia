"use client";

import { recordActionResponse } from "@/actions/tracking";
import { clientConfig } from "@/rollbar";
import type { RecordActionResponseInput } from "@/server/services/tracking-action-response/types";
import { useMutation } from "@tanstack/react-query";
import Rollbar from "rollbar";

interface UseRecordActionResponseOptions {
  onSuccess?: () => void;
  onError?: (error: Error) => void;
}

export function useRecordActionResponse(options: UseRecordActionResponseOptions = {}) {
  return useMutation({
    mutationFn: async (payload: RecordActionResponseInput): Promise<void> => {
      await recordActionResponse(payload);
    },
    onSuccess: () => {
      options.onSuccess?.();
    },
    onError: error => {
      const rollbar = new Rollbar(clientConfig);
      rollbar.error("[Tracking] 액션 응답 기록 실패", {
        error,
        payload: error,
      });
      options.onError?.(error as Error);
    },
  });
}

export type UseRecordActionResponseReturn = ReturnType<typeof useRecordActionResponse>;
