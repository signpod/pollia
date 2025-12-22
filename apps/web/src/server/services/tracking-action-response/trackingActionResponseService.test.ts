import type { TrackingActionResponseRepository } from "@/server/repositories/tracking-action-response";
import type { TrackingActionResponse } from "@prisma/client";
import { TrackingActionResponseService } from "./trackingActionResponseService";

const TEST_SESSION_ID = "session-123";
const TEST_USER_ID = "user-123";
const TEST_MISSION_ID = "mission-123";
const TEST_ACTION_ID = "action-123";

function createMockTrackingActionResponse(
  overrides?: Partial<TrackingActionResponse>,
): TrackingActionResponse {
  return {
    id: "response-123",
    missionId: TEST_MISSION_ID,
    sessionId: TEST_SESSION_ID,
    userId: TEST_USER_ID,
    actionId: TEST_ACTION_ID,
    metadata: { responseTime: 1500, device: "mobile" },
    respondedAt: new Date("2024-01-01T10:00:00Z"),
    ...overrides,
  };
}

describe("TrackingActionResponseService", () => {
  let service: TrackingActionResponseService;
  let mockRepo: jest.Mocked<TrackingActionResponseRepository>;

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
    } as jest.Mocked<TrackingActionResponseRepository>;

    service = new TrackingActionResponseService(mockRepo);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe("recordActionResponse", () => {
    it("액션 응답 이벤트를 성공적으로 기록한다", async () => {
      // Given
      const input = {
        missionId: TEST_MISSION_ID,
        sessionId: TEST_SESSION_ID,
        userId: TEST_USER_ID,
        actionId: TEST_ACTION_ID,
        metadata: { responseTime: 1500, device: "mobile" },
      };
      const mockResponse = createMockTrackingActionResponse(input);
      mockRepo.create.mockResolvedValue(mockResponse);

      // When
      const result = await service.recordActionResponse(input);

      // Then
      expect(result).toEqual(mockResponse);
      expect(mockRepo.create).toHaveBeenCalledWith(input);
      expect(mockRepo.create).toHaveBeenCalledTimes(1);
    });

    it("비로그인 사용자(userId null)의 응답을 기록한다", async () => {
      // Given
      const input = {
        missionId: TEST_MISSION_ID,
        sessionId: TEST_SESSION_ID,
        userId: undefined,
        actionId: TEST_ACTION_ID,
        metadata: { responseTime: 2000 },
      };
      const mockResponse = createMockTrackingActionResponse({ ...input, userId: null });
      mockRepo.create.mockResolvedValue(mockResponse);

      // When
      const result = await service.recordActionResponse(input);

      // Then
      expect(result).toEqual(mockResponse);
      expect(result.userId).toBeNull();
    });

    it("같은 세션-액션 조합에 여러 응답을 기록할 수 있다", async () => {
      // Given
      const input1 = {
        missionId: TEST_MISSION_ID,
        sessionId: TEST_SESSION_ID,
        userId: TEST_USER_ID,
        actionId: TEST_ACTION_ID,
        metadata: { responseTime: 1500, attemptCount: 1 },
      };
      const input2 = {
        ...input1,
        metadata: { responseTime: 3000, attemptCount: 2 },
      };
      const mockResponse1 = createMockTrackingActionResponse({
        ...input1,
        id: "response-1",
        respondedAt: new Date("2024-01-01T10:00:00Z"),
      });
      const mockResponse2 = createMockTrackingActionResponse({
        ...input2,
        id: "response-2",
        respondedAt: new Date("2024-01-01T10:05:00Z"),
      });

      mockRepo.create.mockResolvedValueOnce(mockResponse1).mockResolvedValueOnce(mockResponse2);

      // When
      const result1 = await service.recordActionResponse(input1);
      const result2 = await service.recordActionResponse(input2);

      // Then
      expect(result1.id).toBe("response-1");
      expect(result2.id).toBe("response-2");
      expect(mockRepo.create).toHaveBeenCalledTimes(2);
    });
  });

  describe("getActionResponses", () => {
    it("sessionId로 응답 이벤트를 조회한다", async () => {
      // Given
      const mockResponses = [createMockTrackingActionResponse()];
      mockRepo.findBySessionId.mockResolvedValue(mockResponses);

      // When
      const result = await service.getActionResponses({ sessionId: TEST_SESSION_ID });

      // Then
      expect(result).toEqual(mockResponses);
      expect(mockRepo.findBySessionId).toHaveBeenCalledWith(TEST_SESSION_ID);
    });

    it("missionId로 응답 이벤트를 조회한다", async () => {
      // Given
      const mockResponses = [createMockTrackingActionResponse()];
      mockRepo.findByMissionId.mockResolvedValue(mockResponses);

      // When
      const result = await service.getActionResponses({ missionId: TEST_MISSION_ID });

      // Then
      expect(result).toEqual(mockResponses);
      expect(mockRepo.findByMissionId).toHaveBeenCalledWith(TEST_MISSION_ID);
    });

    it("actionId로 응답 이벤트를 조회한다", async () => {
      // Given
      const mockResponses = [createMockTrackingActionResponse()];
      mockRepo.findByActionId.mockResolvedValue(mockResponses);

      // When
      const result = await service.getActionResponses({ actionId: TEST_ACTION_ID });

      // Then
      expect(result).toEqual(mockResponses);
      expect(mockRepo.findByActionId).toHaveBeenCalledWith(TEST_ACTION_ID);
    });

    it("userId로 응답 이벤트를 조회한다", async () => {
      // Given
      const mockResponses = [createMockTrackingActionResponse()];
      mockRepo.findByUserId.mockResolvedValue(mockResponses);

      // When
      const result = await service.getActionResponses({ userId: TEST_USER_ID });

      // Then
      expect(result).toEqual(mockResponses);
      expect(mockRepo.findByUserId).toHaveBeenCalledWith(TEST_USER_ID);
    });

    it("조건이 없으면 빈 배열을 반환한다", async () => {
      // When
      const result = await service.getActionResponses({});

      // Then
      expect(result).toEqual([]);
      expect(mockRepo.findBySessionId).not.toHaveBeenCalled();
    });

    it("우선순위: sessionId > missionId > actionId > userId", async () => {
      // Given
      const mockResponses = [createMockTrackingActionResponse()];
      mockRepo.findBySessionId.mockResolvedValue(mockResponses);

      // When
      await service.getActionResponses({
        sessionId: TEST_SESSION_ID,
        missionId: TEST_MISSION_ID,
        actionId: TEST_ACTION_ID,
        userId: TEST_USER_ID,
      });

      // Then
      expect(mockRepo.findBySessionId).toHaveBeenCalled();
      expect(mockRepo.findByMissionId).not.toHaveBeenCalled();
      expect(mockRepo.findByActionId).not.toHaveBeenCalled();
      expect(mockRepo.findByUserId).not.toHaveBeenCalled();
    });
  });

  describe("getLatestActionResponseBySessionId", () => {
    it("세션의 특정 액션에 대한 최신 응답을 조회한다", async () => {
      // Given
      const mockResponse = createMockTrackingActionResponse();
      mockRepo.findLatestBySessionAndAction.mockResolvedValue(mockResponse);

      // When
      const result = await service.getLatestActionResponseBySessionId(
        TEST_SESSION_ID,
        TEST_ACTION_ID,
      );

      // Then
      expect(result).toEqual(mockResponse);
      expect(mockRepo.findLatestBySessionAndAction).toHaveBeenCalledWith(
        TEST_SESSION_ID,
        TEST_ACTION_ID,
      );
    });

    it("응답 기록이 없으면 null을 반환한다", async () => {
      // Given
      mockRepo.findLatestBySessionAndAction.mockResolvedValue(null);

      // When
      const result = await service.getLatestActionResponseBySessionId(
        TEST_SESSION_ID,
        TEST_ACTION_ID,
      );

      // Then
      expect(result).toBeNull();
    });
  });

  describe("getLatestActionResponseByUserId", () => {
    it("사용자의 특정 액션에 대한 최신 응답을 조회한다", async () => {
      // Given
      const mockResponse = createMockTrackingActionResponse();
      mockRepo.findLatestByUserAndAction.mockResolvedValue(mockResponse);

      // When
      const result = await service.getLatestActionResponseByUserId(TEST_USER_ID, TEST_ACTION_ID);

      // Then
      expect(result).toEqual(mockResponse);
      expect(mockRepo.findLatestByUserAndAction).toHaveBeenCalledWith(TEST_USER_ID, TEST_ACTION_ID);
    });
  });

  describe("countActionResponses", () => {
    it("조건에 맞는 응답 이벤트 수를 반환한다", async () => {
      // Given
      mockRepo.count.mockResolvedValue(15);

      // When
      const result = await service.countActionResponses({ actionId: TEST_ACTION_ID });

      // Then
      expect(result).toBe(15);
      expect(mockRepo.count).toHaveBeenCalledWith({ actionId: TEST_ACTION_ID });
    });
  });

  describe("linkSessionToUser", () => {
    it("세션의 모든 응답 이벤트를 사용자와 연결한다", async () => {
      // Given
      mockRepo.updateUserIdBySessionId.mockResolvedValue({ count: 3 });

      // When
      const result = await service.linkSessionToUser(TEST_SESSION_ID, TEST_USER_ID);

      // Then
      expect(result).toEqual({ count: 3 });
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
