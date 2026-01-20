"use client";

import { sendActionResponseBeacon } from "@/lib/tracking";
import type { RecordActionResponseInput } from "@/server/services/tracking-action-response/types";
import { useMutation } from "@tanstack/react-query";

interface UseRecordActionResponseOptions {
  onSuccess?: () => void;
  onError?: (error: Error) => void;
}

export function useRecordActionResponse(options: UseRecordActionResponseOptions = {}) {
  return useMutation<void, Error, RecordActionResponseInput>({
    mutationFn: async (payload): Promise<void> => {
      const success = sendActionResponseBeacon(payload);

      if (!success) {
        throw new Error("Failed to send beacon");
      }

      return Promise.resolve();
    },
    onSuccess: () => {
      options.onSuccess?.();
    },
    onError: (error, payload) => {
      console.error("[Tracking] Failed to record action response:", error, payload);
      options.onError?.(error);
    },
  });
}

export type UseRecordActionResponseReturn = ReturnType<typeof useRecordActionResponse>;
