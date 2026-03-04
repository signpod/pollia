import type { ActionRepository } from "@/server/repositories/action/actionRepository";
import type { MissionCompletionInferenceCacheRepository } from "@/server/repositories/mission-completion-inference-cache/missionCompletionInferenceCacheRepository";
import type { MissionCompletionRepository } from "@/server/repositories/mission-completion/missionCompletionRepository";
import type { MissionResponseRepository } from "@/server/repositories/mission-response/missionResponseRepository";
import type { MissionRepository } from "@/server/repositories/mission/missionRepository";
import { MissionResponseService } from ".";
import type { AiService } from "../ai";

describe("MissionResponseService", () => {
  let service: MissionResponseService;
  let mockResponseRepo: jest.Mocked<MissionResponseRepository>;
  let mockMissionRepo: jest.Mocked<MissionRepository>;
  let mockActionRepo: jest.Mocked<ActionRepository>;
  let mockCompletionRepo: jest.Mocked<MissionCompletionRepository>;
  let mockInferenceCacheRepo: jest.Mocked<MissionCompletionInferenceCacheRepository>;
  let mockAiService: jest.Mocked<AiService>;

  const mockUser = { id: "user1" };
  const now = new Date();

  beforeEach(() => {
    mockResponseRepo = {
      findById: jest.fn(),
      findByMissionAndUser: jest.fn(),
      findByMissionAndGuest: jest.fn(),
      findByMissionId: jest.fn(),
      findByMissionIdPaged: jest.fn(),
      findByUserId: jest.fn(),
      findCompletedByMissionId: jest.fn(),
      create: jest.fn(),
      updateCompletedAt: jest.fn(),
      findLatestCompletedAtByActor: jest.fn(),
      updateCompletedAtWithAbuseMeta: jest.fn(),
      completeWithSelectionAndAbuseMeta: jest.fn(),
      nullifyAbuseMetaOlderThan: jest.fn(),
      delete: jest.fn(),
      deleteByMissionAndUser: jest.fn(),
      deleteByMissionAndGuest: jest.fn(),
      countByMissionId: jest.fn(),
      countByMissionIdFiltered: jest.fn(),
      countCompletedByMissionId: jest.fn(),
    } as unknown as jest.Mocked<MissionResponseRepository>;

    mockMissionRepo = {
      findById: jest.fn(),
    } as unknown as jest.Mocked<MissionRepository>;

    mockActionRepo = {
      hasFileUploadActionByMissionId: jest.fn(),
    } as unknown as jest.Mocked<ActionRepository>;

    mockCompletionRepo = {
      findAllByMissionId: jest.fn(),
    } as unknown as jest.Mocked<MissionCompletionRepository>;

    mockInferenceCacheRepo = {
      findByMissionAndFingerprint: jest.fn(),
      upsertByMissionAndFingerprint: jest.fn(),
      deleteByMissionId: jest.fn(),
    } as unknown as jest.Mocked<MissionCompletionInferenceCacheRepository>;

    mockAiService = {
      generateFromPrompt: jest.fn(),
    } as unknown as jest.Mocked<AiService>;

    service = new MissionResponseService(
      mockResponseRepo,
      mockMissionRepo,
      mockActionRepo,
      mockCompletionRepo,
      mockInferenceCacheRepo,
      mockAiService,
    );
  });

  afterEach(() => {
    jest.clearAllMocks();
    jest.useRealTimers();
  });

  describe("getResponseById", () => {
    it("Response를 성공적으로 조회한다", async () => {
      // Given
      const mockResponse = { id: "response1", userId: "user1", missionId: "mission1" };
      mockResponseRepo.findById.mockResolvedValue(mockResponse as never);

      // When
      const result = await service.getResponseById("response1", mockUser.id);

      // Then
      expect(result).toEqual(mockResponse);
      expect(mockResponseRepo.findById).toHaveBeenCalledWith("response1");
    });

    it("Response가 없으면 404 에러를 던진다", async () => {
      // Given
      mockResponseRepo.findById.mockResolvedValue(null);

      // When & Then
      await expect(service.getResponseById("invalid-id", mockUser.id)).rejects.toThrow(
        "응답을 찾을 수 없습니다.",
      );
    });

    it("다른 사용자의 Response 조회 시 403 에러를 던진다", async () => {
      // Given
      const mockResponse = { id: "response1", userId: "other-user" };
      mockResponseRepo.findById.mockResolvedValue(mockResponse as never);

      // When & Then
      await expect(service.getResponseById("response1", mockUser.id)).rejects.toThrow(
        "조회 권한이 없습니다.",
      );
    });
  });

  describe("getResponseByMissionAndUser", () => {
    it("Mission과 User로 Response를 조회한다", async () => {
      // Given
      const mockResponse = { id: "response1", missionId: "mission1", userId: "user1" };
      mockResponseRepo.findByMissionAndUser.mockResolvedValue(mockResponse as never);

      // When
      const result = await service.getResponseByMissionAndUser("mission1", mockUser.id);

      // Then
      expect(result).toEqual(mockResponse);
      expect(mockResponseRepo.findByMissionAndUser).toHaveBeenCalledWith("mission1", mockUser.id);
    });

    it("Response가 없으면 null을 반환한다", async () => {
      // Given
      mockResponseRepo.findByMissionAndUser.mockResolvedValue(null);

      // When
      const result = await service.getResponseByMissionAndUser("mission1", mockUser.id);

      // Then
      expect(result).toBeNull();
    });
  });

  describe("getUserResponses", () => {
    it("사용자의 모든 Response를 조회한다", async () => {
      // Given
      const mockResponses = [
        { id: "response1", missionId: "mission1" },
        { id: "response2", missionId: "mission2" },
      ];
      mockResponseRepo.findByUserId.mockResolvedValue(mockResponses as never);

      // When
      const result = await service.getUserResponses(mockUser.id);

      // Then
      expect(result).toEqual(mockResponses);
      expect(mockResponseRepo.findByUserId).toHaveBeenCalledWith(mockUser.id);
    });
  });

  describe("getMissionResponses", () => {
    it("Mission 소유자가 모든 Response를 조회한다", async () => {
      // Given
      const mockMission = { id: "mission1", creatorId: "user1" };
      const mockResponses = [{ id: "response1" }, { id: "response2" }];
      mockMissionRepo.findById.mockResolvedValue(mockMission as never);
      mockResponseRepo.findByMissionId.mockResolvedValue(mockResponses as never);

      // When
      const result = await service.getMissionResponses("mission1", mockUser.id);

      // Then
      expect(result).toEqual(mockResponses);
      expect(mockResponseRepo.findByMissionId).toHaveBeenCalledWith("mission1", undefined);
    });

    it("Mission이 없으면 404 에러를 던진다", async () => {
      // Given
      mockMissionRepo.findById.mockResolvedValue(null);

      // When & Then
      await expect(service.getMissionResponses("invalid-mission", mockUser.id)).rejects.toThrow(
        "미션을 찾을 수 없습니다.",
      );
    });

    it("Mission 소유자가 아니면 403 에러를 던진다", async () => {
      // Given
      const mockMission = { id: "mission1", creatorId: "other-user" };
      mockMissionRepo.findById.mockResolvedValue(mockMission as never);

      // When & Then
      await expect(service.getMissionResponses("mission1", mockUser.id)).rejects.toThrow(
        "조회 권한이 없습니다.",
      );
    });
  });

  describe("getMissionStats", () => {
    it("Mission 통계를 성공적으로 조회한다", async () => {
      // Given
      const mockMission = { id: "mission1", creatorId: "user1" };
      mockMissionRepo.findById.mockResolvedValue(mockMission as never);
      mockResponseRepo.countByMissionId.mockResolvedValue(10);
      mockResponseRepo.countCompletedByMissionId.mockResolvedValue(7);

      // When
      const result = await service.getMissionStats("mission1", mockUser.id);

      // Then
      expect(result).toEqual({
        total: 10,
        completed: 7,
        completionRate: 70,
      });
    });

    it("응답이 없으면 completionRate는 0이다", async () => {
      // Given
      const mockMission = { id: "mission1", creatorId: "user1" };
      mockMissionRepo.findById.mockResolvedValue(mockMission as never);
      mockResponseRepo.countByMissionId.mockResolvedValue(0);
      mockResponseRepo.countCompletedByMissionId.mockResolvedValue(0);

      // When
      const result = await service.getMissionStats("mission1", mockUser.id);

      // Then
      expect(result.completionRate).toBe(0);
    });

    it("Mission이 없으면 404 에러를 던진다", async () => {
      // Given
      mockMissionRepo.findById.mockResolvedValue(null);

      // When & Then
      await expect(service.getMissionStats("invalid-mission", mockUser.id)).rejects.toThrow(
        "미션을 찾을 수 없습니다.",
      );
    });

    it("Mission 소유자가 아니면 403 에러를 던진다", async () => {
      // Given
      const mockMission = { id: "mission1", creatorId: "other-user" };
      mockMissionRepo.findById.mockResolvedValue(mockMission as never);

      // When & Then
      await expect(service.getMissionStats("mission1", mockUser.id)).rejects.toThrow(
        "조회 권한이 없습니다.",
      );
    });
  });

  describe("getMissionResponsesPage", () => {
    const pageOptions = { page: 1, pageSize: 20 };

    it("Mission 소유자가 페이지 응답을 조회한다", async () => {
      // Given
      const mockMission = { id: "mission1", creatorId: "user1" };
      const mockResponses = [{ id: "response1" }, { id: "response2" }];
      mockMissionRepo.findById.mockResolvedValue(mockMission as never);
      mockResponseRepo.findByMissionIdPaged.mockResolvedValue(mockResponses as never);
      mockResponseRepo.countByMissionIdFiltered.mockResolvedValue(42);

      // When
      const result = await service.getMissionResponsesPage("mission1", mockUser.id, pageOptions);

      // Then
      expect(result.responses).toEqual(mockResponses);
      expect(result.pagination).toEqual({
        page: 1,
        pageSize: 20,
        totalRows: 42,
        totalPages: 3,
      });
      expect(mockResponseRepo.findByMissionIdPaged).toHaveBeenCalledWith("mission1", pageOptions);
      expect(mockResponseRepo.countByMissionIdFiltered).toHaveBeenCalledWith("mission1", {
        membersOnly: undefined,
      });
    });

    it("Mission이 없으면 404 에러를 던진다", async () => {
      // Given
      mockMissionRepo.findById.mockResolvedValue(null);

      // When & Then
      await expect(
        service.getMissionResponsesPage("invalid-mission", mockUser.id, pageOptions),
      ).rejects.toThrow("미션을 찾을 수 없습니다.");
    });

    it("Mission 소유자가 아니면 403 에러를 던진다", async () => {
      // Given
      const mockMission = { id: "mission1", creatorId: "other-user" };
      mockMissionRepo.findById.mockResolvedValue(mockMission as never);

      // When & Then
      await expect(
        service.getMissionResponsesPage("mission1", mockUser.id, pageOptions),
      ).rejects.toThrow("조회 권한이 없습니다.");
    });

    it("응답이 없어도 페이지네이션 메타를 반환한다", async () => {
      // Given
      const mockMission = { id: "mission1", creatorId: "user1" };
      mockMissionRepo.findById.mockResolvedValue(mockMission as never);
      mockResponseRepo.findByMissionIdPaged.mockResolvedValue([]);
      mockResponseRepo.countByMissionIdFiltered.mockResolvedValue(0);

      // When
      const result = await service.getMissionResponsesPage("mission1", mockUser.id, pageOptions);

      // Then
      expect(result.responses).toEqual([]);
      expect(result.pagination.totalRows).toBe(0);
      expect(result.pagination.totalPages).toBe(0);
    });
  });

  describe("startResponse", () => {
    it("새 Response를 생성한다", async () => {
      // Given
      const mockMission = { id: "mission1", isActive: true };
      const mockCreatedResponse = { id: "response1", missionId: "mission1", userId: "user1" };
      mockMissionRepo.findById.mockResolvedValue(mockMission as never);
      mockResponseRepo.findByMissionAndUser.mockResolvedValue(null);
      mockResponseRepo.create.mockResolvedValue(mockCreatedResponse as never);

      // When
      const result = await service.startResponse({ missionId: "mission1" }, mockUser.id);

      // Then
      expect(result).toEqual(mockCreatedResponse);
      expect(mockResponseRepo.create).toHaveBeenCalledWith({
        missionId: "mission1",
        userId: mockUser.id,
        guestId: null,
      });
    });

    it("이미 응답이 있으면 기존 Response를 반환한다", async () => {
      // Given
      const mockMission = { id: "mission1", isActive: true };
      const mockExistingResponse = { id: "response1", missionId: "mission1", userId: "user1" };
      mockMissionRepo.findById.mockResolvedValue(mockMission as never);
      mockResponseRepo.findByMissionAndUser.mockResolvedValue(mockExistingResponse as never);

      // When
      const result = await service.startResponse({ missionId: "mission1" }, mockUser.id);

      // Then
      expect(result).toEqual(mockExistingResponse);
      expect(mockResponseRepo.create).not.toHaveBeenCalled();
    });

    it("Mission이 없으면 404 에러를 던진다", async () => {
      // Given
      mockMissionRepo.findById.mockResolvedValue(null);

      // When & Then
      await expect(
        service.startResponse({ missionId: "invalid-mission" }, mockUser.id),
      ).rejects.toThrow("미션을 찾을 수 없습니다.");
    });

    it("종료된 Mission이면 400 에러를 던진다", async () => {
      // Given
      const mockMission = { id: "mission1", isActive: false };
      mockMissionRepo.findById.mockResolvedValue(mockMission as never);

      // When & Then
      await expect(service.startResponse({ missionId: "mission1" }, mockUser.id)).rejects.toThrow(
        "종료된 미션입니다.",
      );
    });

    it("정원이 초과되면 403 에러를 던진다", async () => {
      // Given
      const mockMission = { id: "mission1", isActive: true, maxParticipants: 50 };
      mockMissionRepo.findById.mockResolvedValue(mockMission as never);
      mockResponseRepo.countByMissionId.mockResolvedValue(50);

      // When & Then
      await expect(service.startResponse({ missionId: "mission1" }, mockUser.id)).rejects.toThrow(
        "참여 정원이 마감되었어요.",
      );

      try {
        await service.startResponse({ missionId: "mission1" }, mockUser.id);
      } catch (error) {
        expect(error instanceof Error && error.cause).toBe(403);
      }
    });

    it("정원 미달이면 새 Response를 생성한다", async () => {
      // Given
      const mockMission = { id: "mission1", isActive: true, maxParticipants: 50 };
      const mockCreatedResponse = { id: "response1", missionId: "mission1", userId: "user1" };
      mockMissionRepo.findById.mockResolvedValue(mockMission as never);
      mockResponseRepo.countByMissionId.mockResolvedValue(49);
      mockResponseRepo.findByMissionAndUser.mockResolvedValue(null);
      mockResponseRepo.create.mockResolvedValue(mockCreatedResponse as never);

      // When
      const result = await service.startResponse({ missionId: "mission1" }, mockUser.id);

      // Then
      expect(result).toEqual(mockCreatedResponse);
      expect(mockResponseRepo.create).toHaveBeenCalled();
    });

    it("maxParticipants가 null이면 정원 체크를 건너뛴다", async () => {
      // Given
      const mockMission = { id: "mission1", isActive: true, maxParticipants: null };
      const mockCreatedResponse = { id: "response1", missionId: "mission1", userId: "user1" };
      mockMissionRepo.findById.mockResolvedValue(mockMission as never);
      mockResponseRepo.findByMissionAndUser.mockResolvedValue(null);
      mockResponseRepo.create.mockResolvedValue(mockCreatedResponse as never);

      // When
      const result = await service.startResponse({ missionId: "mission1" }, mockUser.id);

      // Then
      expect(result).toEqual(mockCreatedResponse);
      expect(mockResponseRepo.countByMissionId).not.toHaveBeenCalled();
    });

    it("maxParticipants가 0이면 정원 체크를 건너뛴다", async () => {
      // Given
      const mockMission = { id: "mission1", isActive: true, maxParticipants: 0 };
      const mockCreatedResponse = { id: "response1", missionId: "mission1", userId: "user1" };
      mockMissionRepo.findById.mockResolvedValue(mockMission as never);
      mockResponseRepo.findByMissionAndUser.mockResolvedValue(null);
      mockResponseRepo.create.mockResolvedValue(mockCreatedResponse as never);

      // When
      const result = await service.startResponse({ missionId: "mission1" }, mockUser.id);

      // Then
      expect(result).toEqual(mockCreatedResponse);
      expect(mockResponseRepo.countByMissionId).not.toHaveBeenCalled();
    });
  });

  describe("completeResponse", () => {
    function createBaseResponse(overrides: Record<string, unknown> = {}) {
      return {
        id: "response1",
        missionId: "mission1",
        userId: "user1",
        guestId: null,
        completedAt: null,
        mission: {
          id: "mission1",
          title: "MBTI Test",
          useAiCompletion: false,
        },
        answers: [],
        ...overrides,
      };
    }

    function mockDefaultCompletions() {
      mockCompletionRepo.findAllByMissionId.mockResolvedValue([
        { id: "completion-1", title: "A", description: "desc A" },
        { id: "completion-2", title: "B", description: "desc B" },
      ] as never);
    }

    it("브랜치 완료화면이 있으면 AI 없이 해당 completion으로 완료 처리한다", async () => {
      jest.useFakeTimers().setSystemTime(now);
      const mockResponse = createBaseResponse({
        answers: [
          {
            action: { order: 1, nextCompletionId: null },
            options: [{ nextCompletionId: "completion-2" }],
            actionId: "action-1",
            scaleAnswer: null,
            dateAnswers: [],
            fileUploads: [],
          },
        ],
      });

      mockResponseRepo.findById.mockResolvedValue(mockResponse as never);
      mockDefaultCompletions();
      mockResponseRepo.findLatestCompletedAtByActor.mockResolvedValue(null);
      mockResponseRepo.completeWithSelectionAndAbuseMeta.mockResolvedValue({
        ...mockResponse,
        completedAt: now,
        selectedCompletionId: "completion-2",
      } as never);

      const result = await service.completeResponse({ responseId: "response1" }, mockUser.id, {
        ipAddress: "1.1.1.1",
        userAgent: "jest-agent",
      });

      expect(result.selectedCompletionId).toBe("completion-2");
      expect(mockAiService.generateFromPrompt).not.toHaveBeenCalled();
      expect(mockResponseRepo.completeWithSelectionAndAbuseMeta).toHaveBeenCalledWith("response1", {
        missionId: "mission1",
        selectedCompletionId: "completion-2",
        completedAt: now,
        ipAddress: "1.1.1.1",
        userAgent: "jest-agent",
        submissionIntervalSeconds: null,
      });
    });

    it("AI 사용 + 캐시 hit면 캐시 completion을 사용한다", async () => {
      jest.useFakeTimers().setSystemTime(now);
      const mockResponse = createBaseResponse({
        mission: {
          id: "mission1",
          title: "MBTI Test",
          useAiCompletion: true,
        },
        answers: [
          {
            action: { id: "action-1", order: 1, type: "SCALE", nextCompletionId: null },
            options: [],
            actionId: "action-1",
            scaleAnswer: 7,
            dateAnswers: [],
            fileUploads: [],
          },
        ],
      });

      mockResponseRepo.findById.mockResolvedValue(mockResponse as never);
      mockDefaultCompletions();
      mockInferenceCacheRepo.findByMissionAndFingerprint.mockResolvedValue({
        missionCompletionId: "completion-2",
      } as never);
      mockResponseRepo.findLatestCompletedAtByActor.mockResolvedValue(null);
      mockResponseRepo.completeWithSelectionAndAbuseMeta.mockResolvedValue({
        ...mockResponse,
        completedAt: now,
        selectedCompletionId: "completion-2",
      } as never);

      const result = await service.completeResponse({ responseId: "response1" }, mockUser.id);

      expect(result.selectedCompletionId).toBe("completion-2");
      expect(mockAiService.generateFromPrompt).not.toHaveBeenCalled();
      expect(mockInferenceCacheRepo.upsertByMissionAndFingerprint).not.toHaveBeenCalled();
    });

    it("AI 캐시 miss면 AI 추론 후 캐시 업서트한다", async () => {
      jest.useFakeTimers().setSystemTime(now);
      const mockResponse = createBaseResponse({
        mission: {
          id: "mission1",
          title: "MBTI Test",
          useAiCompletion: true,
        },
        answers: [
          {
            action: { id: "action-1", order: 1, type: "TAG", nextCompletionId: null },
            options: [{ id: "opt-1", nextCompletionId: null }],
            actionId: "action-1",
            scaleAnswer: null,
            dateAnswers: [],
            fileUploads: [],
          },
        ],
      });

      mockResponseRepo.findById.mockResolvedValue(mockResponse as never);
      mockDefaultCompletions();
      mockInferenceCacheRepo.findByMissionAndFingerprint.mockResolvedValue(null);
      mockAiService.generateFromPrompt.mockResolvedValue({ result: "completion-1" });
      mockResponseRepo.findLatestCompletedAtByActor.mockResolvedValue(null);
      mockResponseRepo.completeWithSelectionAndAbuseMeta.mockResolvedValue({
        ...mockResponse,
        completedAt: now,
        selectedCompletionId: "completion-1",
      } as never);

      await service.completeResponse({ responseId: "response1" }, mockUser.id);

      expect(mockAiService.generateFromPrompt).toHaveBeenCalledTimes(1);
      expect(mockInferenceCacheRepo.upsertByMissionAndFingerprint).toHaveBeenCalledTimes(1);
      expect(mockResponseRepo.completeWithSelectionAndAbuseMeta).toHaveBeenCalledWith(
        "response1",
        expect.objectContaining({
          selectedCompletionId: "completion-1",
        }),
      );
    });

    it("key 재료가 없으면 캐시 조회/저장을 건너뛴다", async () => {
      const mockResponse = createBaseResponse({
        mission: {
          id: "mission1",
          title: "MBTI Test",
          useAiCompletion: true,
        },
        answers: [
          {
            action: { id: "action-1", order: 1, type: "SUBJECTIVE", nextCompletionId: null },
            options: [],
            actionId: "action-1",
            scaleAnswer: null,
            dateAnswers: [],
            fileUploads: [],
          },
        ],
      });

      mockResponseRepo.findById.mockResolvedValue(mockResponse as never);
      mockDefaultCompletions();
      mockAiService.generateFromPrompt.mockResolvedValue({ result: "completion-1" });
      mockResponseRepo.findLatestCompletedAtByActor.mockResolvedValue(null);
      mockResponseRepo.completeWithSelectionAndAbuseMeta.mockResolvedValue({
        ...mockResponse,
        completedAt: now,
        selectedCompletionId: "completion-1",
      } as never);

      await service.completeResponse({ responseId: "response1" }, mockUser.id);

      expect(mockInferenceCacheRepo.findByMissionAndFingerprint).not.toHaveBeenCalled();
      expect(mockInferenceCacheRepo.upsertByMissionAndFingerprint).not.toHaveBeenCalled();
    });

    it("AI가 미션 외 completionId를 반환하면 실패한다", async () => {
      const mockResponse = createBaseResponse({
        mission: {
          id: "mission1",
          title: "MBTI Test",
          useAiCompletion: true,
        },
        answers: [
          {
            action: { id: "action-1", order: 1, type: "SCALE", nextCompletionId: null },
            options: [],
            actionId: "action-1",
            scaleAnswer: 10,
            dateAnswers: [],
            fileUploads: [],
          },
        ],
      });

      mockResponseRepo.findById.mockResolvedValue(mockResponse as never);
      mockDefaultCompletions();
      mockInferenceCacheRepo.findByMissionAndFingerprint.mockResolvedValue(null);
      mockAiService.generateFromPrompt.mockResolvedValue({ result: "completion-x" });

      await expect(
        service.completeResponse({ responseId: "response1" }, mockUser.id),
      ).rejects.toThrow("AI 완료화면 추론 결과가 유효하지 않습니다.");
      expect(mockResponseRepo.completeWithSelectionAndAbuseMeta).not.toHaveBeenCalled();
    });

    it("완료 처리 시 updateMany 실패(null 반환)면 중복 완료로 실패한다", async () => {
      const mockResponse = createBaseResponse();
      mockResponseRepo.findById.mockResolvedValue(mockResponse as never);
      mockDefaultCompletions();
      mockResponseRepo.findLatestCompletedAtByActor.mockResolvedValue(null);
      mockResponseRepo.completeWithSelectionAndAbuseMeta.mockResolvedValue(null);

      await expect(
        service.completeResponse({ responseId: "response1" }, mockUser.id),
      ).rejects.toThrow("이미 완료된 응답입니다.");
    });

    it("Response가 없으면 404 에러를 던진다", async () => {
      // Given
      mockResponseRepo.findById.mockResolvedValue(null);

      // When & Then
      await expect(
        service.completeResponse({ responseId: "invalid-response" }, mockUser.id),
      ).rejects.toThrow("응답을 찾을 수 없습니다.");
    });

    it("다른 사용자의 Response면 403 에러를 던진다", async () => {
      // Given
      const mockResponse = { id: "response1", userId: "other-user" };
      mockResponseRepo.findById.mockResolvedValue(mockResponse as never);

      // When & Then
      await expect(
        service.completeResponse({ responseId: "response1" }, mockUser.id),
      ).rejects.toThrow("완료 권한이 없습니다.");
    });

    it("이미 완료된 Response면 400 에러를 던진다", async () => {
      // Given
      const mockResponse = { id: "response1", userId: "user1", completedAt: now };
      mockResponseRepo.findById.mockResolvedValue(mockResponse as never);

      // When & Then
      await expect(
        service.completeResponse({ responseId: "response1" }, mockUser.id),
      ).rejects.toThrow("이미 완료된 응답입니다.");
    });
  });

  describe("cleanupAbuseMeta", () => {
    it("기본 보관일(90일) 기준으로 메타를 정리한다", async () => {
      // Given
      jest.useFakeTimers().setSystemTime(now);
      mockResponseRepo.nullifyAbuseMetaOlderThan.mockResolvedValue(7);

      // When
      const result = await service.cleanupAbuseMeta();

      // Then
      const expectedCutoff = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
      expect(mockResponseRepo.nullifyAbuseMetaOlderThan).toHaveBeenCalledWith(expectedCutoff);
      expect(result).toEqual({
        clearedCount: 7,
        cutoffDate: expectedCutoff,
      });
    });

    it("커스텀 보관일 기준으로 메타를 정리한다", async () => {
      // Given
      jest.useFakeTimers().setSystemTime(now);
      mockResponseRepo.nullifyAbuseMetaOlderThan.mockResolvedValue(3);

      // When
      const result = await service.cleanupAbuseMeta(30);

      // Then
      const expectedCutoff = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      expect(mockResponseRepo.nullifyAbuseMetaOlderThan).toHaveBeenCalledWith(expectedCutoff);
      expect(result).toEqual({
        clearedCount: 3,
        cutoffDate: expectedCutoff,
      });
    });
  });

  describe("deleteResponse", () => {
    it("Response를 성공적으로 삭제한다", async () => {
      // Given
      const mockResponse = { id: "response1", userId: "user1" };
      mockResponseRepo.findById.mockResolvedValue(mockResponse as never);
      mockResponseRepo.delete.mockResolvedValue(mockResponse as never);

      // When
      await service.deleteResponse("response1", mockUser.id);

      // Then
      expect(mockResponseRepo.delete).toHaveBeenCalledWith("response1");
    });

    it("Response가 없으면 404 에러를 던진다", async () => {
      // Given
      mockResponseRepo.findById.mockResolvedValue(null);

      // When & Then
      await expect(service.deleteResponse("invalid-response", mockUser.id)).rejects.toThrow(
        "응답을 찾을 수 없습니다.",
      );
    });

    it("다른 사용자의 Response면 403 에러를 던진다", async () => {
      // Given
      const mockResponse = { id: "response1", userId: "other-user" };
      mockResponseRepo.findById.mockResolvedValue(mockResponse as never);

      // When & Then
      await expect(service.deleteResponse("response1", mockUser.id)).rejects.toThrow(
        "삭제 권한이 없습니다.",
      );
    });
  });

  describe("verifyResponseOwnership", () => {
    it("소유자면 true를 반환한다", async () => {
      // Given
      const mockResponse = { id: "response1", userId: "user1" };
      mockResponseRepo.findById.mockResolvedValue(mockResponse as never);

      // When
      const result = await service.verifyResponseOwnership("response1", mockUser.id);

      // Then
      expect(result).toBe(true);
    });

    it("소유자가 아니면 false를 반환한다", async () => {
      // Given
      const mockResponse = { id: "response1", userId: "other-user" };
      mockResponseRepo.findById.mockResolvedValue(mockResponse as never);

      // When
      const result = await service.verifyResponseOwnership("response1", mockUser.id);

      // Then
      expect(result).toBe(false);
    });

    it("Response가 없으면 404 에러를 던진다", async () => {
      // Given
      mockResponseRepo.findById.mockResolvedValue(null);

      // When & Then
      await expect(
        service.verifyResponseOwnership("invalid-response", mockUser.id),
      ).rejects.toThrow("응답을 찾을 수 없습니다.");
    });
  });
});
