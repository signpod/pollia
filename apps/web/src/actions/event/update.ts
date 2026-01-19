"use server";

import { requireAuth } from "@/actions/common/auth";
import { eventService } from "@/server/services/event";
import type { UpdateEventInput } from "@/server/services/event/types";
import type { UpdateEventRequest, UpdateEventResponse } from "@/types/dto/event";

function toUpdateEventInput(dto: UpdateEventRequest): UpdateEventInput {
  return {
    title: dto.title,
    description: dto.description,
    startDate: dto.startDate,
    endDate: dto.endDate,
  };
}

export async function updateEvent(
  eventId: string,
  request: UpdateEventRequest,
): Promise<UpdateEventResponse> {
  try {
    const user = await requireAuth();
    const input = toUpdateEventInput(request);
    const event = await eventService.updateEvent(eventId, input, user.id);
    return { data: event };
  } catch (error) {
    console.error("updateEvent error:", error);
    if (error instanceof Error && error.cause) {
      throw error;
    }
    const serverError = new Error("이벤트 수정 중 오류가 발생했습니다.");
    serverError.cause = 500;
    throw serverError;
  }
}
