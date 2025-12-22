"use server";

import { trackingActionResponseService } from "@/server/services/tracking-action-response";
import type { RecordActionResponseInput } from "@/server/services/tracking-action-response/types";

export async function recordActionResponse(input: RecordActionResponseInput): Promise<void> {
  try {
    await trackingActionResponseService.recordActionResponse(input);
  } catch (error) {
    console.error("[Tracking] Failed to record action response:", error);
  }
}
