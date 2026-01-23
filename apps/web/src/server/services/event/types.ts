import type { SortOrderType } from "@/types/common/sort";
import type { Prisma } from "@prisma/client";

type EventCreateFields = Pick<
  Prisma.EventUncheckedCreateInput,
  "title" | "description" | "startDate" | "endDate"
>;

export type CreateEventInput = EventCreateFields;

export type UpdateEventInput = Partial<EventCreateFields>;

export interface GetUserEventsOptions {
  cursor?: string;
  limit?: number;
  sortOrder?: SortOrderType;
}

export interface EventCreatedResult {
  id: string;
  title: string;
  description: string | null;
  startDate: Date | null;
  endDate: Date | null;
  creatorId: string;
  createdAt: Date;
  updatedAt: Date;
}
