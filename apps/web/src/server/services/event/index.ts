import { eventInputSchema, eventUpdateSchema } from "@/schemas/event";
import { eventRepository } from "@/server/repositories/event/eventRepository";
import type {
  CreateEventInput,
  EventCreatedResult,
  GetUserEventsOptions,
  UpdateEventInput,
} from "./types";

export class EventService {
  constructor(private repo = eventRepository) {}

  async getEvent(eventId: string) {
    const event = await this.repo.findById(eventId);

    if (!event) {
      const error = new Error("이벤트를 찾을 수 없습니다.");
      error.cause = 404;
      throw error;
    }

    return event;
  }

  async getEventWithMissions(eventId: string) {
    const event = await this.repo.findByIdWithMissions(eventId);

    if (!event) {
      const error = new Error("이벤트를 찾을 수 없습니다.");
      error.cause = 404;
      throw error;
    }

    return event;
  }

  async getUserEvents(userId: string, options?: GetUserEventsOptions) {
    const limit = options?.limit ?? 10;
    const events = await this.repo.findByUserId(userId, {
      ...options,
      limit,
    });

    if (events.length > limit) {
      events.pop();
    }

    return events;
  }

  async createEvent(input: CreateEventInput, userId: string): Promise<EventCreatedResult> {
    const result = eventInputSchema.safeParse(input);
    if (!result.success) {
      const error = new Error(result.error.issues[0]?.message || "유효성 검사 실패");
      error.cause = 400;
      throw error;
    }

    const validated = result.data;
    const event = await this.repo.create({
      title: validated.title,
      description: validated.description,
      startDate: validated.startDate,
      endDate: validated.endDate,
      creatorId: userId,
    });

    return {
      id: event.id,
      title: event.title,
      description: event.description,
      startDate: event.startDate,
      endDate: event.endDate,
      creatorId: event.creatorId,
      createdAt: event.createdAt,
      updatedAt: event.updatedAt,
    };
  }

  async updateEvent(eventId: string, data: UpdateEventInput, userId: string) {
    const event = await this.getEvent(eventId);

    if (event.creatorId !== userId) {
      const error = new Error("수정 권한이 없습니다.");
      error.cause = 403;
      throw error;
    }

    const result = eventUpdateSchema.safeParse(data);
    if (!result.success) {
      const error = new Error(result.error.issues[0]?.message || "유효성 검사 실패");
      error.cause = 400;
      throw error;
    }

    const updatedEvent = await this.repo.update(eventId, result.data);
    return updatedEvent;
  }

  async deleteEvent(eventId: string, userId: string): Promise<void> {
    const event = await this.getEvent(eventId);

    if (event.creatorId !== userId) {
      const error = new Error("삭제 권한이 없습니다.");
      error.cause = 403;
      throw error;
    }

    await this.repo.delete(eventId);
  }
}

export const eventService = new EventService();
