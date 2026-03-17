"use server";

import { requireContentManager } from "@/actions/common/auth";
import { handleActionError } from "@/actions/common/error";
import UBIQUITOUS_CONSTANTS from "@/constants/ubiquitous";
import { eventService } from "@/server/services/event";
import type { DeleteEventResponse } from "@/types/dto/event";

export async function deleteEvent(eventId: string): Promise<DeleteEventResponse> {
  try {
    const { user, isAdmin } = await requireContentManager();
    await eventService.deleteEvent(eventId, user.id, isAdmin);
    return { data: { success: true } };
  } catch (error) {
    return handleActionError(error, `${UBIQUITOUS_CONSTANTS.EVENT} 삭제 중 오류가 발생했습니다.`);
  }
}
