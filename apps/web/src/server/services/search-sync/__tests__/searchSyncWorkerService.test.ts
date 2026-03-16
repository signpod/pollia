import type { MissionRepository } from "@/server/repositories/mission/missionRepository";
import type { SearchSyncOutboxRepository } from "@/server/repositories/search-sync-outbox";
import { createMockMission } from "@/server/services/testUtils";
import { SearchSyncAction, SearchSyncEntityType, SearchSyncStatus } from "@prisma/client";
import type { MissionSearchSyncService } from "../missionSearchSyncService";
import { SearchSyncWorkerService } from "../searchSyncWorkerService";

describe("SearchSyncWorkerService", () => {
  let service: SearchSyncWorkerService;
  let mockOutboxRepo: jest.Mocked<SearchSyncOutboxRepository>;
  let mockMissionRepo: jest.Mocked<MissionRepository>;
  let mockSyncService: jest.Mocked<MissionSearchSyncService>;

  const createOutboxEvent = (
    overrides: {
      id?: string;
      action?: SearchSyncAction;
      entityId?: string;
      retryCount?: number;
    } = {},
  ) => ({
    id: overrides.id ?? "outbox-1",
    entityType: SearchSyncEntityType.MISSION,
    entityId: overrides.entityId ?? "mission-1",
    action: overrides.action ?? SearchSyncAction.CREATE,
    payload: null,
    status: SearchSyncStatus.PENDING,
    retryCount: overrides.retryCount ?? 0,
    nextRetryAt: null,
    processedAt: null,
    errorMessage: null,
    createdAt: new Date("2026-01-01T00:00:00.000Z"),
    updatedAt: new Date("2026-01-01T00:00:00.000Z"),
  });

  beforeEach(() => {
    mockOutboxRepo = {
      findPending: jest.fn(),
      markProcessing: jest.fn(),
      markDone: jest.fn(),
      markFailed: jest.fn(),
    } as unknown as jest.Mocked<SearchSyncOutboxRepository>;

    mockMissionRepo = {
      findById: jest.fn(),
      findAllPaged: jest.fn(),
      countAll: jest.fn(),
    } as unknown as jest.Mocked<MissionRepository>;

    mockSyncService = {
      indexMission: jest.fn(),
      deleteMission: jest.fn(),
    } as unknown as jest.Mocked<MissionSearchSyncService>;

    service = new SearchSyncWorkerService(mockOutboxRepo, mockMissionRepo, mockSyncService, {
      batchSize: 50,
      maxRetries: 4,
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it.each([SearchSyncAction.CREATE, SearchSyncAction.UPDATE, SearchSyncAction.DUPLICATE])(
    "%s 이벤트는 mission을 인덱싱한다",
    async action => {
      const event = createOutboxEvent({ action });
      const mission = createMockMission({ id: event.entityId });

      mockOutboxRepo.findPending.mockResolvedValue([event]);
      mockOutboxRepo.markProcessing.mockResolvedValue({ count: 1, ids: [event.id] });
      mockMissionRepo.findById.mockResolvedValue(mission);
      mockOutboxRepo.markDone.mockResolvedValue(event);

      const result = await service.processPending(new Date("2026-01-01T00:00:00.000Z"));

      expect(mockMissionRepo.findById).toHaveBeenCalledWith(event.entityId);
      expect(mockSyncService.indexMission).toHaveBeenCalledWith(mission);
      expect(mockOutboxRepo.markDone).toHaveBeenCalledWith(event.id, expect.any(Date));
      expect(mockOutboxRepo.markFailed).not.toHaveBeenCalled();
      expect(result.successCount).toBe(1);
    },
  );

  it("DELETE 이벤트는 mission을 인덱스에서 삭제한다", async () => {
    const event = createOutboxEvent({ action: SearchSyncAction.DELETE, entityId: "mission-2" });

    mockOutboxRepo.findPending.mockResolvedValue([event]);
    mockOutboxRepo.markProcessing.mockResolvedValue({ count: 1, ids: [event.id] });
    mockOutboxRepo.markDone.mockResolvedValue(event);

    const result = await service.processPending(new Date("2026-01-01T00:00:00.000Z"));

    expect(mockSyncService.deleteMission).toHaveBeenCalledWith("mission-2");
    expect(mockMissionRepo.findById).not.toHaveBeenCalled();
    expect(mockOutboxRepo.markDone).toHaveBeenCalledWith(event.id, expect.any(Date));
    expect(result.successCount).toBe(1);
  });

  it("실패 시 1차 재시도 시간을 계산해 PENDING으로 되돌린다", async () => {
    const event = createOutboxEvent({ action: SearchSyncAction.UPDATE, retryCount: 0 });
    const mission = createMockMission({ id: event.entityId });
    const now = new Date("2026-01-01T00:00:00.000Z");

    mockOutboxRepo.findPending.mockResolvedValue([event]);
    mockOutboxRepo.markProcessing.mockResolvedValue({ count: 1, ids: [event.id] });
    mockMissionRepo.findById.mockResolvedValue(mission);
    mockSyncService.indexMission.mockRejectedValue(new Error("algolia failure"));
    mockOutboxRepo.markFailed.mockResolvedValue(event);

    const result = await service.processPending(now);

    expect(mockOutboxRepo.markFailed).toHaveBeenCalledWith(
      event.id,
      1,
      expect.any(Date),
      "algolia failure",
    );

    const markFailedArgs = mockOutboxRepo.markFailed.mock.calls[0];
    const nextRetryAt = markFailedArgs?.[2];
    expect(nextRetryAt?.toISOString()).toBe("2026-01-01T00:00:30.000Z");
    expect(result.failureCount).toBe(1);
    expect(result.retryScheduledCount).toBe(1);
    expect(result.permanentFailureCount).toBe(0);
  });

  it("최대 재시도 초과 시 FAILED로 고정한다", async () => {
    const event = createOutboxEvent({ action: SearchSyncAction.UPDATE, retryCount: 4 });
    const mission = createMockMission({ id: event.entityId });

    mockOutboxRepo.findPending.mockResolvedValue([event]);
    mockOutboxRepo.markProcessing.mockResolvedValue({ count: 1, ids: [event.id] });
    mockMissionRepo.findById.mockResolvedValue(mission);
    mockSyncService.indexMission.mockRejectedValue(new Error("hard failure"));
    mockOutboxRepo.markFailed.mockResolvedValue(event);

    const result = await service.processPending(new Date("2026-01-01T00:00:00.000Z"));

    expect(mockOutboxRepo.markFailed).toHaveBeenCalledWith(event.id, 5, null, "hard failure");
    expect(result.retryScheduledCount).toBe(0);
    expect(result.permanentFailureCount).toBe(1);
  });

  it("선점 실패한 이벤트는 스킵한다", async () => {
    const first = createOutboxEvent({ id: "outbox-1", action: SearchSyncAction.DELETE });
    const second = createOutboxEvent({ id: "outbox-2", action: SearchSyncAction.DELETE });

    mockOutboxRepo.findPending.mockResolvedValue([first, second]);
    mockOutboxRepo.markProcessing.mockResolvedValue({ count: 1, ids: ["outbox-1"] });
    mockOutboxRepo.markDone.mockResolvedValue(first);

    const result = await service.processPending(new Date("2026-01-01T00:00:00.000Z"));

    expect(mockSyncService.deleteMission).toHaveBeenCalledTimes(1);
    expect(mockSyncService.deleteMission).toHaveBeenCalledWith(first.entityId);
    expect(result.claimedCount).toBe(1);
    expect(result.skippedCount).toBe(1);
  });
});
