"use server";

import { requireActiveUser } from "@/actions/common/auth";
import UBQUITOUS_CONSTANTS from "@/constants/ubiquitous";
import { eventService } from "@/server/services/event";
import type { CreateEventRequest, CreateEventResponse } from "@/types/dto/event";

export async function createEvent(request: CreateEventRequest): Promise<CreateEventResponse> {
  try {
    const user = await requireActiveUser();
    const event = await eventService.createEvent(request, user.id);
    return { data: event };
  } catch (error) {
    console.error("createEvent error:", error);
    if (error instanceof Error && error.cause) {
      throw error;
    }
    const serverError = new Error(`${UBQUITOUS_CONSTANTS.EVENT} 생성 중 오류가 발생했습니다.`);
    serverError.cause = 500;
    throw serverError;
  }
}
