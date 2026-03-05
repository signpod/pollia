import type { EventRepository } from "@/server/repositories/event/eventRepository";
import { EventService } from ".";
import { createMockEvent } from "./testUtils";

describe("EventService", () => {
  let eventService: EventService;
  let mockRepository: jest.Mocked<EventRepository>;

  beforeEach(() => {
    mockRepository = {
      findById: jest.fn(),
      findByIdWithMissions: jest.fn(),
      findByUserId: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    } as jest.Mocked<EventRepository>;

    eventService = new EventService(mockRepository);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe("getEvent", () => {
    it("Event가 존재하면 정상적으로 반환한다", async () => {
      const mockEvent = createMockEvent({
        id: "event-1",
        title: "테스트 이벤트",
        description: "설명",
        creatorId: "user-1",
      });
      mockRepository.findById.mockResolvedValue(mockEvent);

      const result = await eventService.getEvent("event-1");

      expect(result).toEqual(mockEvent);
      expect(mockRepository.findById).toHaveBeenCalledWith("event-1");
      expect(mockRepository.findById).toHaveBeenCalledTimes(1);
    });

    it("Event가 없으면 404 에러를 던진다", async () => {
      mockRepository.findById.mockResolvedValue(null);

      await expect(eventService.getEvent("invalid-id")).rejects.toThrow(
        "이벤트를 찾을 수 없습니다.",
      );

      try {
        await eventService.getEvent("invalid-id");
      } catch (error) {
        expect((error as Error & { cause: number }).cause).toBe(404);
      }

      expect(mockRepository.findById).toHaveBeenCalledWith("invalid-id");
    });
  });

  describe("getEventWithMissions", () => {
    it("Event와 Mission 목록을 정상적으로 반환한다", async () => {
      const mockEventWithMissions = {
        ...createMockEvent({ id: "event-1" }),
        missions: [
          {
            id: "mission-1",
            title: "미션 1",
            choseong: "",
            description: null,
            imageUrl: null,
            brandLogoUrl: null,
            estimatedMinutes: null,
            startDate: null,
            deadline: null,
            isActive: true,
            allowGuestResponse: false,
            allowMultipleResponses: false,
            maxParticipants: null,
            creatorId: "user-1",
            rewardId: null,
            eventId: "event-1",
            createdAt: new Date("2024-01-01"),
            updatedAt: new Date("2024-01-01"),
            target: null,
            type: "GENERAL" as const,
            category: "EVENT" as const,
            password: null,
            likesCount: 0,
            imageFileUploadId: null,
            brandLogoFileUploadId: null,
            entryActionId: null,
            editorDraft: null,
            useAiCompletion: false,
            aiStatisticsReport: null,
            viewCount: 0,
          },
        ],
      };
      mockRepository.findByIdWithMissions.mockResolvedValue(mockEventWithMissions);

      const result = await eventService.getEventWithMissions("event-1");

      expect(result).toEqual(mockEventWithMissions);
      expect(mockRepository.findByIdWithMissions).toHaveBeenCalledWith("event-1");
    });

    it("미션이 없는 Event도 정상적으로 반환한다", async () => {
      const mockEventWithMissions = {
        ...createMockEvent({ id: "event-1" }),
        missions: [],
      };
      mockRepository.findByIdWithMissions.mockResolvedValue(mockEventWithMissions);

      const result = await eventService.getEventWithMissions("event-1");

      expect(result).toEqual(mockEventWithMissions);
      expect(result.missions).toHaveLength(0);
    });

    it("Event가 없으면 404 에러를 던진다", async () => {
      mockRepository.findByIdWithMissions.mockResolvedValue(null);

      await expect(eventService.getEventWithMissions("invalid-id")).rejects.toThrow(
        "이벤트를 찾을 수 없습니다.",
      );

      try {
        await eventService.getEventWithMissions("invalid-id");
      } catch (error) {
        expect((error as Error & { cause: number }).cause).toBe(404);
      }
    });
  });

  describe("getUserEvents", () => {
    it("User의 Event 목록을 성공적으로 조회한다", async () => {
      const mockEvents = [
        createMockEvent({ id: "event-1", title: "이벤트 1" }),
        createMockEvent({ id: "event-2", title: "이벤트 2" }),
      ];
      mockRepository.findByUserId.mockResolvedValue(mockEvents);

      const result = await eventService.getUserEvents("user-1");

      expect(result).toEqual(mockEvents);
      expect(mockRepository.findByUserId).toHaveBeenCalledWith("user-1", {
        limit: 10,
      });
    });

    it("limit 옵션을 전달하면 해당 limit으로 조회한다", async () => {
      const mockEvents = [createMockEvent()];
      mockRepository.findByUserId.mockResolvedValue(mockEvents);

      await eventService.getUserEvents("user-1", { limit: 20 });

      expect(mockRepository.findByUserId).toHaveBeenCalledWith("user-1", {
        limit: 20,
      });
    });

    it("limit보다 많은 Event가 있을 때 마지막 항목을 제거한다", async () => {
      const mockEvents = [
        createMockEvent({ id: "event-1" }),
        createMockEvent({ id: "event-2" }),
        createMockEvent({ id: "event-3" }),
      ];
      mockRepository.findByUserId.mockResolvedValue(mockEvents);

      const result = await eventService.getUserEvents("user-1", { limit: 2 });

      expect(result).toHaveLength(2);
      expect(result[0]?.id).toBe("event-1");
      expect(result[1]?.id).toBe("event-2");
    });

    it("Event가 없는 User는 빈 배열을 반환한다", async () => {
      mockRepository.findByUserId.mockResolvedValue([]);

      const result = await eventService.getUserEvents("user-1");

      expect(result).toEqual([]);
    });
  });

  describe("createEvent", () => {
    it("모든 필드를 포함한 Event를 생성한다", async () => {
      const input = {
        title: "새 이벤트",
        description: "설명",
        startDate: new Date("2024-01-01"),
        endDate: new Date("2024-12-31"),
      };
      const mockCreatedEvent = createMockEvent({
        id: "event-new",
        ...input,
        creatorId: "user-1",
      });
      mockRepository.create.mockResolvedValue(mockCreatedEvent);

      const result = await eventService.createEvent(input, "user-1");

      expect(result).toEqual({
        id: "event-new",
        title: "새 이벤트",
        description: "설명",
        startDate: new Date("2024-01-01"),
        endDate: new Date("2024-12-31"),
        creatorId: "user-1",
        createdAt: mockCreatedEvent.createdAt,
        updatedAt: mockCreatedEvent.updatedAt,
      });
      expect(mockRepository.create).toHaveBeenCalledWith({
        title: "새 이벤트",
        description: "설명",
        startDate: new Date("2024-01-01"),
        endDate: new Date("2024-12-31"),
        creatorId: "user-1",
      });
    });

    it("최소 필드만 포함한 Event를 생성한다", async () => {
      const input = {
        title: "최소 이벤트",
      };
      const mockCreatedEvent = createMockEvent({
        id: "event-minimal",
        title: "최소 이벤트",
        description: null,
        startDate: null,
        endDate: null,
        creatorId: "user-1",
      });
      mockRepository.create.mockResolvedValue(mockCreatedEvent);

      const result = await eventService.createEvent(input, "user-1");

      expect(result.title).toBe("최소 이벤트");
      expect(result.description).toBeNull();
      expect(mockRepository.create).toHaveBeenCalledWith({
        title: "최소 이벤트",
        creatorId: "user-1",
      });
    });

    it("title이 빈 문자열이면 400 에러를 던진다", async () => {
      const input = {
        title: "",
      };

      await expect(eventService.createEvent(input, "user-1")).rejects.toThrow();

      try {
        await eventService.createEvent(input, "user-1");
      } catch (error) {
        expect((error as Error & { cause: number }).cause).toBe(400);
      }
    });

    it("title이 최대 길이를 초과하면 400 에러를 던진다", async () => {
      const input = {
        title: "a".repeat(101),
      };

      await expect(eventService.createEvent(input, "user-1")).rejects.toThrow();

      try {
        await eventService.createEvent(input, "user-1");
      } catch (error) {
        expect((error as Error & { cause: number }).cause).toBe(400);
      }
    });

    it("description이 최대 길이를 초과하면 400 에러를 던진다", async () => {
      const input = {
        title: "이벤트",
        description: "a".repeat(2001),
      };

      await expect(eventService.createEvent(input, "user-1")).rejects.toThrow();

      try {
        await eventService.createEvent(input, "user-1");
      } catch (error) {
        expect((error as Error & { cause: number }).cause).toBe(400);
      }
    });

    it("startDate가 endDate보다 이후면 400 에러를 던진다", async () => {
      const input = {
        title: "이벤트",
        startDate: new Date("2024-12-31"),
        endDate: new Date("2024-01-01"),
      };

      await expect(eventService.createEvent(input, "user-1")).rejects.toThrow(
        "시작일은 종료일보다 이전이어야 합니다.",
      );

      try {
        await eventService.createEvent(input, "user-1");
      } catch (error) {
        expect((error as Error & { cause: number }).cause).toBe(400);
      }
    });
  });

  describe("updateEvent", () => {
    it("Event를 성공적으로 수정한다", async () => {
      const mockEvent = createMockEvent({
        id: "event-1",
        creatorId: "user-1",
      });
      const updatedMockEvent = {
        ...mockEvent,
        title: "수정된 제목",
        description: "수정된 설명",
      };
      mockRepository.findById.mockResolvedValue(mockEvent);
      mockRepository.update.mockResolvedValue(updatedMockEvent);

      const result = await eventService.updateEvent(
        "event-1",
        { title: "수정된 제목", description: "수정된 설명" },
        "user-1",
      );

      expect(result.title).toBe("수정된 제목");
      expect(result.description).toBe("수정된 설명");
      expect(mockRepository.update).toHaveBeenCalledWith("event-1", {
        title: "수정된 제목",
        description: "수정된 설명",
      });
    });

    it("권한이 없는 사용자는 403 에러를 던진다", async () => {
      const mockEvent = createMockEvent({
        id: "event-1",
        creatorId: "user-1",
      });
      mockRepository.findById.mockResolvedValue(mockEvent);

      await expect(
        eventService.updateEvent("event-1", { title: "수정" }, "user-2"),
      ).rejects.toThrow("수정 권한이 없습니다.");

      try {
        await eventService.updateEvent("event-1", { title: "수정" }, "user-2");
      } catch (error) {
        expect((error as Error & { cause: number }).cause).toBe(403);
      }

      expect(mockRepository.update).not.toHaveBeenCalled();
    });

    it("존재하지 않는 Event는 404 에러를 던진다", async () => {
      mockRepository.findById.mockResolvedValue(null);

      await expect(
        eventService.updateEvent("invalid-id", { title: "수정" }, "user-1"),
      ).rejects.toThrow("이벤트를 찾을 수 없습니다.");

      try {
        await eventService.updateEvent("invalid-id", { title: "수정" }, "user-1");
      } catch (error) {
        expect((error as Error & { cause: number }).cause).toBe(404);
      }
    });

    it("빈 수정 데이터는 400 에러를 던진다", async () => {
      const mockEvent = createMockEvent({
        id: "event-1",
        creatorId: "user-1",
      });
      mockRepository.findById.mockResolvedValue(mockEvent);

      await expect(eventService.updateEvent("event-1", {}, "user-1")).rejects.toThrow();

      try {
        await eventService.updateEvent("event-1", {}, "user-1");
      } catch (error) {
        expect((error as Error & { cause: number }).cause).toBe(400);
      }
    });

    it("startDate가 endDate보다 이후면 400 에러를 던진다", async () => {
      const mockEvent = createMockEvent({
        id: "event-1",
        creatorId: "user-1",
      });
      mockRepository.findById.mockResolvedValue(mockEvent);

      await expect(
        eventService.updateEvent(
          "event-1",
          {
            startDate: new Date("2024-12-31"),
            endDate: new Date("2024-01-01"),
          },
          "user-1",
        ),
      ).rejects.toThrow("시작일은 종료일보다 이전이어야 합니다.");

      try {
        await eventService.updateEvent(
          "event-1",
          {
            startDate: new Date("2024-12-31"),
            endDate: new Date("2024-01-01"),
          },
          "user-1",
        );
      } catch (error) {
        expect((error as Error & { cause: number }).cause).toBe(400);
      }
    });
  });

  describe("deleteEvent", () => {
    it("Event를 성공적으로 삭제한다", async () => {
      const mockEvent = createMockEvent({
        id: "event-1",
        creatorId: "user-1",
      });
      mockRepository.findById.mockResolvedValue(mockEvent);
      mockRepository.delete.mockResolvedValue(mockEvent);

      await eventService.deleteEvent("event-1", "user-1");

      expect(mockRepository.delete).toHaveBeenCalledWith("event-1");
      expect(mockRepository.delete).toHaveBeenCalledTimes(1);
    });

    it("권한이 없는 사용자는 403 에러를 던진다", async () => {
      const mockEvent = createMockEvent({
        id: "event-1",
        creatorId: "user-1",
      });
      mockRepository.findById.mockResolvedValue(mockEvent);

      await expect(eventService.deleteEvent("event-1", "user-2")).rejects.toThrow(
        "삭제 권한이 없습니다.",
      );

      try {
        await eventService.deleteEvent("event-1", "user-2");
      } catch (error) {
        expect((error as Error & { cause: number }).cause).toBe(403);
      }

      expect(mockRepository.delete).not.toHaveBeenCalled();
    });

    it("존재하지 않는 Event는 404 에러를 던진다", async () => {
      mockRepository.findById.mockResolvedValue(null);

      await expect(eventService.deleteEvent("invalid-id", "user-1")).rejects.toThrow(
        "이벤트를 찾을 수 없습니다.",
      );

      try {
        await eventService.deleteEvent("invalid-id", "user-1");
      } catch (error) {
        expect((error as Error & { cause: number }).cause).toBe(404);
      }

      expect(mockRepository.delete).not.toHaveBeenCalled();
    });
  });
});
