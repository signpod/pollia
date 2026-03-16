"use server";

import { requireContentManager } from "@/actions/common/auth";
import { handleActionError } from "@/actions/common/error";
import UBIQUITOUS_CONSTANTS from "@/constants/ubiquitous";
import { eventService } from "@/server/services/event";
import type { UpdateEventRequest, UpdateEventResponse } from "@/types/dto/event";

export async function updateEvent(
  eventId: string,
  request: UpdateEventRequest,
): Promise<UpdateEventResponse> {
  try {
    const { user, isAdmin } = await requireContentManager();
    const event = await eventService.updateEvent(eventId, request, user.id, isAdmin);
    return { data: event };
  } catch (error) {
    return handleActionError(error, `${UBIQUITOUS_CONSTANTS.EVENT} 수정 중 오류가 발생했습니다.`);
  }
}
