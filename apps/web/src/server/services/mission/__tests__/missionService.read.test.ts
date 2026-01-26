import type { ActionRepository } from "@/server/repositories/action/actionRepository";
import type { MissionResponseRepository } from "@/server/repositories/mission-response/missionResponseRepository";
import type { MissionRepository } from "@/server/repositories/mission/missionRepository";
import { MissionService } from "..";
import { createMockActionWithOptions, createMockMission } from "../../testUtils";

describe("MissionService - Read", () => {
  let missionService: MissionService;
  let mockRepository: jest.Mocked<MissionRepository>;
  let mockResponseRepository: jest.Mocked<MissionResponseRepository>;
  let mockActionRepository: jest.Mocked<ActionRepository>;

  beforeEach(() => {
    mockRepository = {
      findById: jest.fn(),
      findByUserId: jest.fn(),
      createWithActions: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      duplicateMission: jest.fn(),
    } as jest.Mocked<MissionRepository>;

    mockResponseRepository = {
      findById: jest.fn(),
      findByMissionAndUser: jest.fn(),
      findByMissionId: jest.fn(),
      findByUserId: jest.fn(),
      findCompletedByMissionId: jest.fn(),
      create: jest.fn(),
      updateCompletedAt: jest.fn(),
      delete: jest.fn(),
      deleteByMissionAndUser: jest.fn(),
      countByMissionId: jest.fn(),
      countCompletedByMissionId: jest.fn(),
    } as jest.Mocked<MissionResponseRepository>;

    mockActionRepository = {
      findById: jest.fn(),
      findByIdWithOptions: jest.fn(),
      findActionIdsByMissionId: jest.fn(),
      findDetailsByMissionId: jest.fn(),
      findMany: jest.fn(),
      create: jest.fn(),
      createMultipleChoice: jest.fn(),
      update: jest.fn(),
      updateWithOptions: jest.fn(),
      delete: jest.fn(),
      updateManyOrders: jest.fn(),
    } as unknown as jest.Mocked<ActionRepository>;

    missionService = new MissionService(
      mockRepository,
      mockResponseRepository,
      mockActionRepository,
    );
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe("getMission", () => {
    it("Mission이 존재하면 정상적으로 반환한다", async () => {
      // Given: Mock 데이터 설정
      const mockMission = createMockMission({
        id: "mission-1",
        title: "테스트 설문",
        description: "설명",
        estimatedMinutes: 10,
        creatorId: "user-1",
        createdAt: new Date("2024-01-01"),
        updatedAt: new Date("2024-01-01"),
      });
      mockRepository.findById.mockResolvedValue(mockMission);

      // When: getMission 호출
      const result = await missionService.getMission("mission-1");

      // Then: 결과 검증
      expect(result).toEqual(mockMission);
      expect(mockRepository.findById).toHaveBeenCalledWith("mission-1");
      expect(mockRepository.findById).toHaveBeenCalledTimes(1);
    });

    it("Mission이 없으면 404 에러를 던진다", async () => {
      // Given: Repository가 null 반환
      mockRepository.findById.mockResolvedValue(null);

      // When & Then: 에러 검증
      await expect(missionService.getMission("invalid-id")).rejects.toThrow(
        "미션을 찾을 수 없습니다.",
      );

      // 에러 cause 검증
      try {
        await missionService.getMission("invalid-id");
      } catch (error) {
        expect((error as Error & { cause: number }).cause).toBe(404);
      }

      expect(mockRepository.findById).toHaveBeenCalledWith("invalid-id");
    });
  });

  describe("getMissionActionIds", () => {
    it("Mission의 Action ID 목록을 반환한다", async () => {
      // Given
      const mockMission = createMockMission({ id: "mission-1", creatorId: "user-1" });
      const mockActionIds = ["a1", "a2", "a3"];

      mockRepository.findById.mockResolvedValue(mockMission);
      mockActionRepository.findActionIdsByMissionId.mockResolvedValue(mockActionIds);

      // When
      const result = await missionService.getMissionActionIds("mission-1");

      // Then
      expect(result).toEqual({ actionIds: ["a1", "a2", "a3"] });
      expect(mockRepository.findById).toHaveBeenCalledWith("mission-1");
      expect(mockActionRepository.findActionIdsByMissionId).toHaveBeenCalledWith("mission-1");
    });

    it("Mission이 없으면 404 에러를 던진다", async () => {
      // Given
      mockRepository.findById.mockResolvedValue(null);

      // When & Then
      await expect(missionService.getMissionActionIds("invalid-id")).rejects.toThrow(
        "미션을 찾을 수 없습니다.",
      );

      // findActionIdsByMissionId가 호출되지 않았는지 확인
      expect(mockActionRepository.findActionIdsByMissionId).not.toHaveBeenCalled();
    });
  });

  describe("getActionById", () => {
    it("Action이 존재하면 정상적으로 반환한다", async () => {
      // Given
      const mockAction = createMockActionWithOptions(
        {
          id: "a1",
          missionId: "mission-1",
          title: "질문 1",
          description: "설명",
          type: "MULTIPLE_CHOICE",
          order: 1,
          maxSelections: 1,
          isRequired: false,
          createdAt: new Date("2024-01-01"),
          updatedAt: new Date("2024-01-01"),
        },
        [
          { id: "opt1", title: "선택지 1", description: null, imageUrl: null, fileUploadId: null, order: 1 },
          { id: "opt2", title: "선택지 2", description: null, imageUrl: null, fileUploadId: null, order: 2 },
        ],
      );
      mockActionRepository.findById.mockResolvedValue(mockAction);

      // When
      const result = await missionService.getActionById("a1");

      // Then
      expect(result).toEqual(mockAction);
      expect(mockActionRepository.findById).toHaveBeenCalledWith("a1");
      expect(mockActionRepository.findById).toHaveBeenCalledTimes(1);
    });

    it("Action이 없으면 404 에러를 던진다", async () => {
      // Given
      mockActionRepository.findById.mockResolvedValue(null);

      // When & Then
      await expect(missionService.getActionById("invalid-id")).rejects.toThrow(
        "액션을 찾을 수 없습니다.",
      );

      // 에러 cause 검증
      try {
        await missionService.getActionById("invalid-id");
      } catch (error) {
        expect((error as Error & { cause: number }).cause).toBe(404);
      }
    });
  });

  describe("getMissionActionsDetail", () => {
    it("Mission의 모든 Action 상세를 반환한다", async () => {
      // Given
      const mockMission = createMockMission({ id: "mission-1", creatorId: "user-1" });
      const testDate = new Date("2024-01-01");

      const mockActions = [
        createMockActionWithOptions(
          {
            id: "a1",
            missionId: "mission-1",
            title: "질문 1",
            type: "MULTIPLE_CHOICE",
            order: 1,
            maxSelections: 1,
            isRequired: false,
            createdAt: testDate,
            updatedAt: testDate,
          },
          [{ id: "opt1", title: "선택지 1", description: null, imageUrl: null, fileUploadId: null, order: 1 }],
        ),
        createMockActionWithOptions(
          {
            id: "a2",
            missionId: "mission-1",
            title: "질문 2",
            type: "SCALE",
            order: 2,
            isRequired: false,
            createdAt: testDate,
            updatedAt: testDate,
          },
          [],
        ),
      ];

      mockRepository.findById.mockResolvedValue(mockMission);
      mockActionRepository.findDetailsByMissionId.mockResolvedValue(mockActions);

      // When
      const result = await missionService.getMissionActionsDetail("mission-1");

      // Then
      expect(result).toEqual(mockActions);
      expect(result).toHaveLength(2);
      expect(result[0]?.title).toBe("질문 1");
      expect(result[1]?.title).toBe("질문 2");
      expect(mockRepository.findById).toHaveBeenCalledWith("mission-1");
      expect(mockActionRepository.findDetailsByMissionId).toHaveBeenCalledWith("mission-1");
      expect(mockActionRepository.findDetailsByMissionId).toHaveBeenCalledTimes(1);
    });

    it("Mission이 없으면 404 에러를 던진다", async () => {
      // Given
      mockRepository.findById.mockResolvedValue(null);

      // When & Then
      await expect(missionService.getMissionActionsDetail("invalid-id")).rejects.toThrow(
        "미션을 찾을 수 없습니다.",
      );

      // findActionsByMissionId가 호출되지 않았는지 확인
      expect(mockActionRepository.findDetailsByMissionId).not.toHaveBeenCalled();
    });

    it("Mission은 존재하지만 Action이 없으면 빈 배열을 반환한다", async () => {
      // Given
      const mockMission = createMockMission({ id: "mission-1", creatorId: "user-1" });

      mockRepository.findById.mockResolvedValue(mockMission);
      mockActionRepository.findDetailsByMissionId.mockResolvedValue([]);

      // When
      const result = await missionService.getMissionActionsDetail("mission-1");

      // Then
      expect(result).toEqual([]);
      expect(result).toHaveLength(0);
    });
  });

  describe("getUserMissions", () => {
    it("User의 Mission 목록을 성공적으로 조회한다", async () => {
      // Given
      const mockMissions = [
        createMockMission({
          id: "mission-1",
          title: "설문 1",
          description: null,
          createdAt: new Date("2024-01-01"),
          updatedAt: new Date("2024-01-01"),
        }),
        createMockMission({
          id: "mission-2",
          title: "설문 2",
          description: "설명",
          isActive: false,
          createdAt: new Date("2024-01-02"),
          updatedAt: new Date("2024-01-02"),
        }),
      ];
      mockRepository.findByUserId.mockResolvedValue(mockMissions);

      // When
      const result = await missionService.getUserMissions("user-1");

      // Then
      expect(result).toEqual(mockMissions);
      expect(mockRepository.findByUserId).toHaveBeenCalledWith("user-1", {
        limit: 10,
      });
    });

    it("limit보다 많은 Mission이 있을 때 마지막 항목을 제거한다", async () => {
      // Given
      const mockMissions = [
        createMockMission({
          id: "mission-1",
          title: "설문 1",
        }),
        createMockMission({
          id: "mission-2",
          title: "설문 2",
        }),
        createMockMission({
          id: "mission-3",
          title: "설문 3",
          isActive: false,
        }),
      ];
      mockRepository.findByUserId.mockResolvedValue(mockMissions);

      // When
      const result = await missionService.getUserMissions("user-1", { limit: 2 });

      // Then
      expect(result).toHaveLength(2);
      expect(result[0]?.id).toBe("mission-1");
      expect(result[1]?.id).toBe("mission-2");
    });
  });

  describe("getMissionWithParticipantInfo", () => {
    it("참여 정보를 성공적으로 반환한다", async () => {
      // Given
      const mockMission = createMockMission({
        id: "mission-1",
        isActive: true,
        maxParticipants: 100,
        deadline: null,
      });
      mockRepository.findById.mockResolvedValue(mockMission);
      mockResponseRepository.countByMissionId.mockResolvedValue(45);

      // When
      const result = await missionService.getMissionWithParticipantInfo("mission-1");

      // Then
      expect(result).toEqual({
        currentParticipants: 45,
        maxParticipants: 100,
        isClosed: false,
      });
    });

    it("maxParticipants가 null이면 isClosed는 false이다", async () => {
      // Given
      const mockMission = createMockMission({
        id: "mission-1",
        isActive: true,
        maxParticipants: null,
        deadline: null,
      });
      mockRepository.findById.mockResolvedValue(mockMission);
      mockResponseRepository.countByMissionId.mockResolvedValue(1000);

      // When
      const result = await missionService.getMissionWithParticipantInfo("mission-1");

      // Then
      expect(result.isClosed).toBe(false);
      expect(result.maxParticipants).toBeNull();
    });

    it("정원이 초과되면 isClosed는 true이다", async () => {
      // Given
      const mockMission = createMockMission({
        id: "mission-1",
        isActive: true,
        maxParticipants: 50,
        deadline: null,
      });
      mockRepository.findById.mockResolvedValue(mockMission);
      mockResponseRepository.countByMissionId.mockResolvedValue(50);

      // When
      const result = await missionService.getMissionWithParticipantInfo("mission-1");

      // Then
      expect(result.isClosed).toBe(true);
    });

    it("isActive가 false이면 isClosed는 true이다", async () => {
      // Given
      const mockMission = createMockMission({
        id: "mission-1",
        isActive: false,
        maxParticipants: 100,
        deadline: null,
      });
      mockRepository.findById.mockResolvedValue(mockMission);
      mockResponseRepository.countByMissionId.mockResolvedValue(10);

      // When
      const result = await missionService.getMissionWithParticipantInfo("mission-1");

      // Then
      expect(result.isClosed).toBe(true);
    });

    it("마감일이 지나면 isClosed는 true이다", async () => {
      // Given
      const pastDate = new Date("2020-01-01");
      const mockMission = createMockMission({
        id: "mission-1",
        isActive: true,
        maxParticipants: 100,
        deadline: pastDate,
      });
      mockRepository.findById.mockResolvedValue(mockMission);
      mockResponseRepository.countByMissionId.mockResolvedValue(10);

      // When
      const result = await missionService.getMissionWithParticipantInfo("mission-1");

      // Then
      expect(result.isClosed).toBe(true);
    });

    it("미션이 없으면 404 에러를 던진다", async () => {
      // Given
      mockRepository.findById.mockResolvedValue(null);

      // When & Then
      await expect(missionService.getMissionWithParticipantInfo("invalid-id")).rejects.toThrow(
        "미션을 찾을 수 없습니다.",
      );
    });
  });

  describe("checkParticipantLimit", () => {
    it("정원 미달이면 에러 없이 통과한다", async () => {
      // Given
      const mockMission = createMockMission({
        id: "mission-1",
        maxParticipants: 100,
      });
      mockRepository.findById.mockResolvedValue(mockMission);
      mockResponseRepository.countByMissionId.mockResolvedValue(50);

      // When & Then
      await expect(missionService.checkParticipantLimit("mission-1")).resolves.not.toThrow();
    });

    it("maxParticipants가 null이면 에러 없이 통과한다", async () => {
      // Given
      const mockMission = createMockMission({
        id: "mission-1",
        maxParticipants: null,
      });
      mockRepository.findById.mockResolvedValue(mockMission);

      // When & Then
      await expect(missionService.checkParticipantLimit("mission-1")).resolves.not.toThrow();
      expect(mockResponseRepository.countByMissionId).not.toHaveBeenCalled();
    });

    it("maxParticipants가 0이면 에러 없이 통과한다", async () => {
      // Given
      const mockMission = createMockMission({
        id: "mission-1",
        maxParticipants: 0,
      });
      mockRepository.findById.mockResolvedValue(mockMission);

      // When & Then
      await expect(missionService.checkParticipantLimit("mission-1")).resolves.not.toThrow();
      expect(mockResponseRepository.countByMissionId).not.toHaveBeenCalled();
    });

    it("정원 초과 시 403 에러를 던진다", async () => {
      // Given
      const mockMission = createMockMission({
        id: "mission-1",
        maxParticipants: 50,
      });
      mockRepository.findById.mockResolvedValue(mockMission);
      mockResponseRepository.countByMissionId.mockResolvedValue(50);

      // When & Then
      await expect(missionService.checkParticipantLimit("mission-1")).rejects.toThrow(
        "참여 정원이 마감되었어요.",
      );

      try {
        await missionService.checkParticipantLimit("mission-1");
      } catch (error) {
        expect(error instanceof Error && error.cause).toBe(403);
      }
    });

    it("미션이 없으면 404 에러를 던진다", async () => {
      // Given
      mockRepository.findById.mockResolvedValue(null);

      // When & Then
      await expect(missionService.checkParticipantLimit("invalid-id")).rejects.toThrow(
        "미션을 찾을 수 없습니다.",
      );
    });
  });
});
