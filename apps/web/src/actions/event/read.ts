"use server";

import { requireActiveUser } from "@/actions/common/auth";
import UBQUITOUS_CONSTANTS from "@/constants/ubiquitous";
import { eventService } from "@/server/services/event";
import type { SortOrderType } from "@/types/common/sort";
import type {
  GetEventResponse,
  GetEventWithMissionsResponse,
  GetUserEventsResponse,
} from "@/types/dto/event";

export interface GetUserEventsRequest {
  cursor?: string;
  limit?: number;
  sortOrder?: SortOrderType;
}

export async function getUserEvents(
  request?: GetUserEventsRequest,
): Promise<GetUserEventsResponse & { nextCursor?: string }> {
  try {
    const user = await requireActiveUser();
    const limit = request?.limit ?? 10;
    const options = request ? { ...request, limit: limit + 1 } : { limit: limit + 1 };

    const events = await eventService.getUserEvents(user.id, options);

    let nextCursor: string | undefined = undefined;
    if (events.length > limit) {
      const nextItem = events.pop();
      nextCursor = nextItem?.id;
    }

    return { data: events, nextCursor };
  } catch (error) {
    console.error("getUserEvents error:", error);
    if (error instanceof Error && error.cause) {
      throw error;
    }
    const serverError = new Error(`${UBQUITOUS_CONSTANTS.EVENT} 목록을 불러올 수 없습니다.`);
    serverError.cause = 500;
    throw serverError;
  }
}

export async function getEvent(eventId: string): Promise<GetEventResponse> {
  try {
    const event = await eventService.getEvent(eventId);
    return { data: event };
  } catch (error) {
    console.error("getEvent error:", error);
    if (error instanceof Error && error.cause) {
      throw error;
    }
    const serverError = new Error(`${UBQUITOUS_CONSTANTS.EVENT}를 불러올 수 없습니다.`);
    serverError.cause = 500;
    throw serverError;
  }
}

export async function getEventWithMissions(eventId: string): Promise<GetEventWithMissionsResponse> {
  try {
    const event = await eventService.getEventWithMissions(eventId);
    return { data: event };
  } catch (error) {
    console.error("getEventWithMissions error:", error);
    if (error instanceof Error && error.cause) {
      throw error;
    }
    const serverError = new Error(
      `${UBQUITOUS_CONSTANTS.EVENT}와 ${UBQUITOUS_CONSTANTS.MISSION} 목록을 불러올 수 없습니다.`,
    );
    serverError.cause = 500;
    throw serverError;
  }
}
