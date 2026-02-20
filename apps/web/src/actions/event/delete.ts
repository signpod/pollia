"use server";

import { requireActiveUser } from "@/actions/common/auth";
import UBIQUITOUS_CONSTANTS from "@/constants/ubiquitous";
import { eventService } from "@/server/services/event";
import type { DeleteEventResponse } from "@/types/dto/event";

export async function deleteEvent(eventId: string): Promise<DeleteEventResponse> {
  try {
    const user = await requireActiveUser();
    await eventService.deleteEvent(eventId, user.id);
    return { data: { success: true } };
  } catch (error) {
    console.error("deleteEvent error:", error);
    if (error instanceof Error && error.cause) {
      throw error;
    }
    const serverError = new Error(`${UBIQUITOUS_CONSTANTS.EVENT} 삭제 중 오류가 발생했습니다.`);
    serverError.cause = 500;
    throw serverError;
  }
}
