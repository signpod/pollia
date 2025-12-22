"use client";

import { recordActionEntry } from "@/actions/tracking";
import { clientConfig } from "@/rollbar";
import type { RecordActionEntryInput } from "@/server/services/tracking-action-entry/types";
import { useMutation } from "@tanstack/react-query";
import Rollbar from "rollbar";

interface UseRecordActionEntryOptions {
  onSuccess?: () => void;
  onError?: (error: Error) => void;
}

export function useRecordActionEntry(options: UseRecordActionEntryOptions = {}) {
  return useMutation({
    mutationFn: async (payload: RecordActionEntryInput): Promise<void> => {
      await recordActionEntry(payload);
    },
    onSuccess: () => {
      options.onSuccess?.();
    },
    onError: error => {
      const rollbar = new Rollbar(clientConfig);
      rollbar.error("[Tracking] 액션 진입 기록 실패", {
        error,
        payload: error,
      });
      options.onError?.(error as Error);
    },
  });
}

export type UseRecordActionEntryReturn = ReturnType<typeof useRecordActionEntry>;
