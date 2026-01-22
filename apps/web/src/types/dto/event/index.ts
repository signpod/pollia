import type { EventInput, EventUpdate } from "@/schemas/event";
import type { Event, Mission } from "@prisma/client";

export type CreateEventRequest = EventInput;

export type UpdateEventRequest = EventUpdate;

export interface CreateEventResponse {
  data: Event;
}

export interface GetEventResponse {
  data: Event;
}

export interface GetEventWithMissionsResponse {
  data: Event & {
    missions: Mission[];
  };
}

export interface GetUserEventsResponse {
  data: Event[];
}

export interface UpdateEventResponse {
  data: Event;
}

export interface DeleteEventResponse {
  data: { success: true };
}
