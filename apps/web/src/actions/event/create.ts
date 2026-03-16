"use server";

import { requireContentManager } from "@/actions/common/auth";
import { handleActionError } from "@/actions/common/error";
import UBIQUITOUS_CONSTANTS from "@/constants/ubiquitous";
import { eventService } from "@/server/services/event";
import type { CreateEventRequest, CreateEventResponse } from "@/types/dto/event";

export async function createEvent(request: CreateEventRequest): Promise<CreateEventResponse> {
  try {
    const { user } = await requireContentManager();
    const event = await eventService.createEvent(request, user.id);
    return { data: event };
  } catch (error) {
    return handleActionError(error, `${UBIQUITOUS_CONSTANTS.EVENT} 생성 중 오류가 발생했습니다.`);
  }
}
