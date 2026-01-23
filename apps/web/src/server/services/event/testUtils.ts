import type { EventRepository } from "@/server/repositories/event/eventRepository";
import type { Event } from "@prisma/client";
import { EventService } from ".";

export function createMockEvent(overrides?: Partial<Event>): Event {
  return {
    id: "event-1",
    title: "테스트 이벤트",
    description: null,
    startDate: null,
    endDate: null,
    creatorId: "user-1",
    createdAt: new Date("2024-01-01"),
    updatedAt: new Date("2024-01-01"),
    ...overrides,
  };
}

export function createEventServiceTestContext() {
  const mockRepository = {
    findById: jest.fn(),
    findByIdWithMissions: jest.fn(),
    findByUserId: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  } as jest.Mocked<EventRepository>;

  const service = new EventService(mockRepository);

  return { service, mockRepository };
}

export type EventServiceTestContext = ReturnType<typeof createEventServiceTestContext>;
