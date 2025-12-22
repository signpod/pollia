import type { TrackingActionEntryRepository } from "@/server/repositories/tracking-action-entry";
import type { TrackingActionEntry } from "@prisma/client";
import { TrackingActionEntryService } from "./trackingActionEntryService";

const TEST_SESSION_ID = "session-123";
const TEST_USER_ID = "user-123";
const TEST_MISSION_ID = "mission-123";
const TEST_ACTION_ID = "action-123";

function createMockTrackingActionEntry(
  overrides?: Partial<TrackingActionEntry>,
): TrackingActionEntry {
  return {
    id: "entry-123",
    missionId: TEST_MISSION_ID,
    sessionId: TEST_SESSION_ID,
    userId: TEST_USER_ID,
    actionId: TEST_ACTION_ID,
    utmParams: { source: "google", medium: "cpc" },
    enteredAt: new Date("2024-01-01T10:00:00Z"),
    ...overrides,
  };
}

describe("TrackingActionEntryService", () => {
  let service: TrackingActionEntryService;
  let mockRepo: jest.Mocked<TrackingActionEntryRepository>;

  beforeEach(() => {
    mockRepo = {
      create: jest.fn(),
      findBySessionId: jest.fn(),
      findByMissionId: jest.fn(),
      findByActionId: jest.fn(),
      findByUserId: jest.fn(),
      findLatestBySessionAndAction: jest.fn(),
      findLatestByUserAndAction: jest.fn(),
      count: jest.fn(),
      updateUserIdBySessionId: jest.fn(),
    } as jest.Mocked<TrackingActionEntryRepository>;

    service = new TrackingActionEntryService(mockRepo);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe("recordActionEntry", () => {
    it("액션 진입 이벤트를 성공적으로 기록한다", async () => {
      // Given
      const input = {
        missionId: TEST_MISSION_ID,
        sessionId: TEST_SESSION_ID,
        userId: TEST_USER_ID,
        actionId: TEST_ACTION_ID,
        utmParams: { source: "google" },
      };
      const mockEntry = createMockTrackingActionEntry(input);
      mockRepo.create.mockResolvedValue(mockEntry);

      // When
      const result = await service.recordActionEntry(input);

      // Then
      expect(result).toEqual(mockEntry);
      expect(mockRepo.create).toHaveBeenCalledWith(input);
      expect(mockRepo.create).toHaveBeenCalledTimes(1);
    });

    it("비로그인 사용자(userId null)의 진입을 기록한다", async () => {
      // Given
      const input = {
        missionId: TEST_MISSION_ID,
        sessionId: TEST_SESSION_ID,
        userId: null,
        actionId: TEST_ACTION_ID,
        utmParams: undefined,
      };
      const mockEntry = createMockTrackingActionEntry({ ...input, userId: null, utmParams: null });
      mockRepo.create.mockResolvedValue(mockEntry);

      // When
      const result = await service.recordActionEntry(input);

      // Then
      expect(result).toEqual(mockEntry);
      expect(result.userId).toBeNull();
    });

    it("같은 세션-액션 조합에 여러 진입을 기록할 수 있다", async () => {
      // Given
      const input1 = {
        missionId: TEST_MISSION_ID,
        sessionId: TEST_SESSION_ID,
        userId: TEST_USER_ID,
        actionId: TEST_ACTION_ID,
        utmParams: { source: "google" },
      };
      const input2 = {
        ...input1,
        utmParams: { source: "facebook" },
      };
      const mockEntry1 = createMockTrackingActionEntry({
        ...input1,
        id: "entry-1",
        enteredAt: new Date("2024-01-01T10:00:00Z"),
      });
      const mockEntry2 = createMockTrackingActionEntry({
        ...input2,
        id: "entry-2",
        enteredAt: new Date("2024-01-01T10:05:00Z"),
      });

      mockRepo.create.mockResolvedValueOnce(mockEntry1).mockResolvedValueOnce(mockEntry2);

      // When
      const result1 = await service.recordActionEntry(input1);
      const result2 = await service.recordActionEntry(input2);

      // Then
      expect(result1.id).toBe("entry-1");
      expect(result2.id).toBe("entry-2");
      expect(mockRepo.create).toHaveBeenCalledTimes(2);
    });
  });

  describe("getActionEntries", () => {
    it("sessionId로 진입 이벤트를 조회한다", async () => {
      // Given
      const mockEntries = [createMockTrackingActionEntry()];
      mockRepo.findBySessionId.mockResolvedValue(mockEntries);

      // When
      const result = await service.getActionEntries({ sessionId: TEST_SESSION_ID });

      // Then
      expect(result).toEqual(mockEntries);
      expect(mockRepo.findBySessionId).toHaveBeenCalledWith(TEST_SESSION_ID);
    });

    it("missionId로 진입 이벤트를 조회한다", async () => {
      // Given
      const mockEntries = [createMockTrackingActionEntry()];
      mockRepo.findByMissionId.mockResolvedValue(mockEntries);

      // When
      const result = await service.getActionEntries({ missionId: TEST_MISSION_ID });

      // Then
      expect(result).toEqual(mockEntries);
      expect(mockRepo.findByMissionId).toHaveBeenCalledWith(TEST_MISSION_ID);
    });

    it("actionId로 진입 이벤트를 조회한다", async () => {
      // Given
      const mockEntries = [createMockTrackingActionEntry()];
      mockRepo.findByActionId.mockResolvedValue(mockEntries);

      // When
      const result = await service.getActionEntries({ actionId: TEST_ACTION_ID });

      // Then
      expect(result).toEqual(mockEntries);
      expect(mockRepo.findByActionId).toHaveBeenCalledWith(TEST_ACTION_ID);
    });

    it("userId로 진입 이벤트를 조회한다", async () => {
      // Given
      const mockEntries = [createMockTrackingActionEntry()];
      mockRepo.findByUserId.mockResolvedValue(mockEntries);

      // When
      const result = await service.getActionEntries({ userId: TEST_USER_ID });

      // Then
      expect(result).toEqual(mockEntries);
      expect(mockRepo.findByUserId).toHaveBeenCalledWith(TEST_USER_ID);
    });

    it("조건이 없으면 빈 배열을 반환한다", async () => {
      // When
      const result = await service.getActionEntries({});

      // Then
      expect(result).toEqual([]);
      expect(mockRepo.findBySessionId).not.toHaveBeenCalled();
      expect(mockRepo.findByMissionId).not.toHaveBeenCalled();
      expect(mockRepo.findByActionId).not.toHaveBeenCalled();
      expect(mockRepo.findByUserId).not.toHaveBeenCalled();
    });

    it("우선순위: sessionId > missionId > actionId > userId", async () => {
      // Given
      const mockEntries = [createMockTrackingActionEntry()];
      mockRepo.findBySessionId.mockResolvedValue(mockEntries);

      // When
      const result = await service.getActionEntries({
        sessionId: TEST_SESSION_ID,
        missionId: TEST_MISSION_ID,
        actionId: TEST_ACTION_ID,
        userId: TEST_USER_ID,
      });

      // Then
      expect(mockRepo.findBySessionId).toHaveBeenCalledWith(TEST_SESSION_ID);
      expect(mockRepo.findByMissionId).not.toHaveBeenCalled();
      expect(mockRepo.findByActionId).not.toHaveBeenCalled();
      expect(mockRepo.findByUserId).not.toHaveBeenCalled();
    });
  });

  describe("getLatestActionEntryBySessionId", () => {
    it("세션의 특정 액션에 대한 최신 진입을 조회한다", async () => {
      // Given
      const mockEntry = createMockTrackingActionEntry();
      mockRepo.findLatestBySessionAndAction.mockResolvedValue(mockEntry);

      // When
      const result = await service.getLatestActionEntryBySessionId(TEST_SESSION_ID, TEST_ACTION_ID);

      // Then
      expect(result).toEqual(mockEntry);
      expect(mockRepo.findLatestBySessionAndAction).toHaveBeenCalledWith(
        TEST_SESSION_ID,
        TEST_ACTION_ID,
      );
    });

    it("진입 기록이 없으면 null을 반환한다", async () => {
      // Given
      mockRepo.findLatestBySessionAndAction.mockResolvedValue(null);

      // When
      const result = await service.getLatestActionEntryBySessionId(TEST_SESSION_ID, TEST_ACTION_ID);

      // Then
      expect(result).toBeNull();
    });
  });

  describe("getLatestActionEntryByUserId", () => {
    it("사용자의 특정 액션에 대한 최신 진입을 조회한다", async () => {
      // Given
      const mockEntry = createMockTrackingActionEntry();
      mockRepo.findLatestByUserAndAction.mockResolvedValue(mockEntry);

      // When
      const result = await service.getLatestActionEntryByUserId(TEST_USER_ID, TEST_ACTION_ID);

      // Then
      expect(result).toEqual(mockEntry);
      expect(mockRepo.findLatestByUserAndAction).toHaveBeenCalledWith(TEST_USER_ID, TEST_ACTION_ID);
    });
  });

  describe("countActionEntries", () => {
    it("조건에 맞는 진입 이벤트 수를 반환한다", async () => {
      // Given
      mockRepo.count.mockResolvedValue(10);

      // When
      const result = await service.countActionEntries({ missionId: TEST_MISSION_ID });

      // Then
      expect(result).toBe(10);
      expect(mockRepo.count).toHaveBeenCalledWith({ missionId: TEST_MISSION_ID });
    });
  });

  describe("linkSessionToUser", () => {
    it("세션의 모든 진입 이벤트를 사용자와 연결한다", async () => {
      // Given
      mockRepo.updateUserIdBySessionId.mockResolvedValue({ count: 5 });

      // When
      const result = await service.linkSessionToUser(TEST_SESSION_ID, TEST_USER_ID);

      // Then
      expect(result).toEqual({ count: 5 });
      expect(mockRepo.updateUserIdBySessionId).toHaveBeenCalledWith(TEST_SESSION_ID, TEST_USER_ID);
    });

    it("연결할 레코드가 없으면 count 0을 반환한다", async () => {
      // Given
      mockRepo.updateUserIdBySessionId.mockResolvedValue({ count: 0 });

      // When
      const result = await service.linkSessionToUser(TEST_SESSION_ID, TEST_USER_ID);

      // Then
      expect(result).toEqual({ count: 0 });
    });
  });
});
