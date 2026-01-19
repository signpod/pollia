import type { Event, Mission } from "@prisma/client";

export interface CreateEventRequest {
  title: string;
  description?: string;
  startDate?: Date;
  endDate?: Date;
}

export interface CreateEventResponse {
  data: Pick<
    Event,
    | "id"
    | "title"
    | "description"
    | "startDate"
    | "endDate"
    | "creatorId"
    | "createdAt"
    | "updatedAt"
  >;
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

export interface UpdateEventRequest {
  title?: string;
  description?: string;
  startDate?: Date;
  endDate?: Date;
}

export interface UpdateEventResponse {
  data: Event;
}

export interface DeleteEventResponse {
  data: { success: true };
}
