"use server";

import { trackingActionEntryService } from "@/server/services/tracking-action-entry";
import type { RecordActionEntryInput } from "@/server/services/tracking-action-entry/types";

export async function recordActionEntry(input: RecordActionEntryInput): Promise<void> {
  try {
    await trackingActionEntryService.recordActionEntry(input);
  } catch (error) {
    console.error("[Tracking] Failed to record action entry:", error);
  }
}
