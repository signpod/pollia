"use client";

import { sendActionResponseBeacon } from "@/lib/tracking";
import type { RecordActionResponseInput } from "@/server/services/tracking-action-response/types";
import { useCallback } from "react";

export function useRecordActionResponse() {
  return useCallback((payload: RecordActionResponseInput) => {
    const success = sendActionResponseBeacon(payload);

    if (!success) {
      console.error("[Tracking] Failed to send beacon:", payload);
    }
  }, []);
}

export type UseRecordActionResponseReturn = ReturnType<typeof useRecordActionResponse>;
