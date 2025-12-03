import type { MissionRepository } from "@/server/repositories/mission/missionRepository";
import { MissionService } from ".";

describe("MissionService", () => {
  let missionService: MissionService;
  let mockRepository: jest.Mocked<MissionRepository>;

  beforeEach(() => {
    mockRepository = {
      findById: jest.fn(),
      findActionIdsByMissionId: jest.fn(),
      findActionById: jest.fn(),
      findActionsByMissionId: jest.fn(),
      findByUserId: jest.fn(),
      createWithActions: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    } as jest.Mocked<MissionRepository>;

    missionService = new MissionService(mockRepository);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe("getMission", () => {
    it("Mission이 존재하면 정상적으로 반환한다", async () => {
      // Given: Mock 데이터 설정
      const mockMission = {
        id: "mission-1",
        title: "테스트 설문",
        description: "설명",
        target: null,
        imageUrl: null,
        brandLogoUrl: null,
        estimatedMinutes: 10,
        deadline: null,
        isActive: true,
        creatorId: "user-1",
        rewardId: null,
        createdAt: new Date("2024-01-01"),
        updatedAt: new Date("2024-01-01"),
      };
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
      const mockMission = {
        id: "mission-1",
        title: "설문",
        description: null,
        target: null,
        imageUrl: null,
        brandLogoUrl: null,
        estimatedMinutes: null,
        deadline: null,
        isActive: true,
        creatorId: "user-1",
        rewardId: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      const mockActionIds = ["a1", "a2", "a3"];

      mockRepository.findById.mockResolvedValue(mockMission);
      mockRepository.findActionIdsByMissionId.mockResolvedValue(mockActionIds);

      // When
      const result = await missionService.getMissionActionIds("mission-1");

      // Then
      expect(result).toEqual({ actionIds: ["a1", "a2", "a3"] });
      expect(mockRepository.findById).toHaveBeenCalledWith("mission-1");
      expect(mockRepository.findActionIdsByMissionId).toHaveBeenCalledWith("mission-1");
    });

    it("Mission이 없으면 404 에러를 던진다", async () => {
      // Given
      mockRepository.findById.mockResolvedValue(null);

      // When & Then
      await expect(missionService.getMissionActionIds("invalid-id")).rejects.toThrow(
        "미션을 찾을 수 없습니다.",
      );

      // findActionIdsByMissionId가 호출되지 않았는지 확인
      expect(mockRepository.findActionIdsByMissionId).not.toHaveBeenCalled();
    });
  });

  describe("getActionById", () => {
    it("Action이 존재하면 정상적으로 반환한다", async () => {
      // Given
      const mockAction = {
        id: "a1",
        title: "질문 1",
        description: "설명",
        imageUrl: null,
        type: "MULTIPLE_CHOICE" as const,
        order: 1,
        maxSelections: 1,
        missionId: "mission-1",
        options: [
          {
            id: "opt1",
            title: "선택지 1",
            description: null,
            imageUrl: null,
            order: 1,
          },
          {
            id: "opt2",
            title: "선택지 2",
            description: null,
            imageUrl: null,
            order: 2,
          },
        ],
        createdAt: new Date("2024-01-01"),
        updatedAt: new Date("2024-01-01"),
      };
      mockRepository.findActionById.mockResolvedValue(mockAction);

      // When
      const result = await missionService.getActionById("a1");

      // Then
      expect(result).toEqual(mockAction);
      expect(mockRepository.findActionById).toHaveBeenCalledWith("a1");
      expect(mockRepository.findActionById).toHaveBeenCalledTimes(1);
    });

    it("Action이 없으면 404 에러를 던진다", async () => {
      // Given
      mockRepository.findActionById.mockResolvedValue(null);

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
      const mockMission = {
        id: "mission-1",
        title: "설문",
        description: null,
        target: null,
        imageUrl: null,
        brandLogoUrl: null,
        estimatedMinutes: null,
        deadline: null,
        isActive: true,
        creatorId: "user-1",
        rewardId: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const mockActions = [
        {
          id: "a1",
          title: "질문 1",
          description: null,
          imageUrl: null,
          type: "MULTIPLE_CHOICE" as const,
          order: 1,
          maxSelections: 1,
          missionId: "mission-1",
          options: [
            {
              id: "opt1",
              title: "선택지 1",
              description: null,
              imageUrl: null,
              order: 1,
            },
          ],
          createdAt: new Date("2024-01-01"),
          updatedAt: new Date("2024-01-01"),
        },
        {
          id: "a2",
          title: "질문 2",
          description: null,
          imageUrl: null,
          type: "SCALE" as const,
          order: 2,
          maxSelections: null,
          missionId: "mission-1",
          options: [],
          createdAt: new Date("2024-01-01"),
          updatedAt: new Date("2024-01-01"),
        },
      ];

      mockRepository.findById.mockResolvedValue(mockMission);
      mockRepository.findActionsByMissionId.mockResolvedValue(mockActions);

      // When
      const result = await missionService.getMissionActionsDetail("mission-1");

      // Then
      expect(result).toEqual(mockActions);
      expect(result).toHaveLength(2);
      expect(result[0]?.title).toBe("질문 1");
      expect(result[1]?.title).toBe("질문 2");
      expect(mockRepository.findById).toHaveBeenCalledWith("mission-1");
      expect(mockRepository.findActionsByMissionId).toHaveBeenCalledWith("mission-1");
      expect(mockRepository.findActionsByMissionId).toHaveBeenCalledTimes(1);
    });

    it("Mission이 없으면 404 에러를 던진다", async () => {
      // Given
      mockRepository.findById.mockResolvedValue(null);

      // When & Then
      await expect(missionService.getMissionActionsDetail("invalid-id")).rejects.toThrow(
        "미션을 찾을 수 없습니다.",
      );

      // findActionsByMissionId가 호출되지 않았는지 확인
      expect(mockRepository.findActionsByMissionId).not.toHaveBeenCalled();
    });

    it("Mission은 존재하지만 Action이 없으면 빈 배열을 반환한다", async () => {
      // Given
      const mockMission = {
        id: "mission-1",
        title: "설문",
        description: null,
        target: null,
        imageUrl: null,
        brandLogoUrl: null,
        estimatedMinutes: null,
        deadline: null,
        isActive: true,
        creatorId: "user-1",
        rewardId: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockRepository.findById.mockResolvedValue(mockMission);
      mockRepository.findActionsByMissionId.mockResolvedValue([]);

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
        {
          id: "mission-1",
          title: "설문 1",
          description: null,
          target: null,
          imageUrl: null,
          isActive: true,
          createdAt: new Date("2024-01-01"),
          updatedAt: new Date("2024-01-01"),
        },
        {
          id: "mission-2",
          title: "설문 2",
          description: "설명",
          target: null,
          imageUrl: null,
          isActive: false,
          createdAt: new Date("2024-01-02"),
          updatedAt: new Date("2024-01-02"),
        },
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
        {
          id: "mission-1",
          title: "설문 1",
          description: null,
          target: null,
          imageUrl: null,
          isActive: true,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          id: "mission-2",
          title: "설문 2",
          description: null,
          target: null,
          imageUrl: null,
          isActive: true,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          id: "mission-3",
          title: "설문 3",
          description: null,
          target: null,
          imageUrl: null,
          isActive: false,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
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

  describe("createMission", () => {
    it("Mission을 성공적으로 생성한다", async () => {
      // Given
      const request = {
        title: "새 설문",
        description: "설명",
        target: null,
        imageUrl: null,
        deadline: new Date("2024-12-31"),
        estimatedMinutes: 10,
        questionIds: ["a1", "a2"],
      };
      const mockCreatedMission = {
        id: "mission-1",
        title: request.title,
        description: request.description,
        target: null,
        imageUrl: null,
        brandLogoUrl: null,
        deadline: request.deadline,
        estimatedMinutes: request.estimatedMinutes,
        isActive: true,
        creatorId: "user-1",
        rewardId: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      mockRepository.createWithActions.mockResolvedValue(mockCreatedMission);

      // When
      const result = await missionService.createMission(request, "user-1");

      // Then
      expect(result.id).toBe("mission-1");
      expect(result.title).toBe("새 설문");
      expect(mockRepository.createWithActions).toHaveBeenCalledWith(
        {
          title: request.title,
          description: request.description,
          target: undefined,
          imageUrl: undefined,
          deadline: request.deadline,
          estimatedMinutes: request.estimatedMinutes,
          creatorId: "user-1",
        },
        ["a1", "a2"],
      );
    });

    it("제목이 없으면 400 에러를 던진다", async () => {
      // Given
      const request = {
        title: "",
        description: null,
        target: null,
        imageUrl: null,
        deadline: undefined,
        estimatedMinutes: undefined,
        questionIds: ["a1"],
      };

      // When & Then
      await expect(missionService.createMission(request, "user-1")).rejects.toThrow(
        "제목을 입력해주세요.",
      );

      try {
        await missionService.createMission(request, "user-1");
      } catch (error) {
        expect((error as Error & { cause: number }).cause).toBe(400);
      }
    });

    it("Action이 없으면 400 에러를 던진다", async () => {
      // Given
      const request = {
        title: "설문",
        description: null,
        target: null,
        imageUrl: null,
        deadline: undefined,
        estimatedMinutes: undefined,
        questionIds: [],
      };

      // When & Then
      await expect(missionService.createMission(request, "user-1")).rejects.toThrow(
        "최소 1개 이상의 질문이 필요합니다.",
      );

      try {
        await missionService.createMission(request, "user-1");
      } catch (error) {
        expect((error as Error & { cause: number }).cause).toBe(400);
      }
    });
  });

  describe("updateMission", () => {
    it("Mission을 성공적으로 수정한다", async () => {
      // Given
      const mockMission = {
        id: "mission-1",
        title: "기존 설문",
        description: null,
        target: null,
        imageUrl: null,
        brandLogoUrl: null,
        estimatedMinutes: null,
        deadline: null,
        isActive: true,
        creatorId: "user-1",
        rewardId: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      const mockUpdatedMission = {
        ...mockMission,
        title: "수정된 설문",
        description: "수정된 설명",
      };
      mockRepository.findById.mockResolvedValue(mockMission);
      mockRepository.update.mockResolvedValue(mockUpdatedMission);

      // When
      const result = await missionService.updateMission(
        "mission-1",
        { title: "수정된 설문", description: "수정된 설명" },
        "user-1",
      );

      // Then
      expect(result.title).toBe("수정된 설문");
      expect(result.description).toBe("수정된 설명");
      expect(mockRepository.update).toHaveBeenCalledWith("mission-1", {
        title: "수정된 설문",
        description: "수정된 설명",
      });
    });

    it("Mission이 없으면 404 에러를 던진다", async () => {
      // Given
      mockRepository.findById.mockResolvedValue(null);

      // When & Then
      await expect(
        missionService.updateMission("invalid-id", { title: "수정" }, "user-1"),
      ).rejects.toThrow("미션을 찾을 수 없습니다.");
    });

    it("권한이 없으면 403 에러를 던진다", async () => {
      // Given
      const mockMission = {
        id: "mission-1",
        title: "설문",
        description: null,
        target: null,
        imageUrl: null,
        brandLogoUrl: null,
        estimatedMinutes: null,
        deadline: null,
        isActive: true,
        creatorId: "user-1",
        rewardId: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      mockRepository.findById.mockResolvedValue(mockMission);

      // When & Then
      await expect(
        missionService.updateMission("mission-1", { title: "수정" }, "user-2"),
      ).rejects.toThrow("수정 권한이 없습니다.");

      try {
        await missionService.updateMission("mission-1", { title: "수정" }, "user-2");
      } catch (error) {
        expect((error as Error & { cause: number }).cause).toBe(403);
      }
    });

    it("빈 제목으로 수정하면 400 에러를 던진다", async () => {
      // Given
      const mockMission = {
        id: "mission-1",
        title: "설문",
        description: null,
        target: null,
        imageUrl: null,
        brandLogoUrl: null,
        estimatedMinutes: null,
        deadline: null,
        isActive: true,
        creatorId: "user-1",
        rewardId: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      mockRepository.findById.mockResolvedValue(mockMission);

      // When & Then
      await expect(
        missionService.updateMission("mission-1", { title: "" }, "user-1"),
      ).rejects.toThrow("제목을 입력해주세요.");

      try {
        await missionService.updateMission("mission-1", { title: "" }, "user-1");
      } catch (error) {
        expect((error as Error & { cause: number }).cause).toBe(400);
      }
    });
  });

  describe("deleteMission", () => {
    it("Mission을 성공적으로 삭제한다", async () => {
      // Given
      const mockMission = {
        id: "mission-1",
        title: "설문",
        description: null,
        target: null,
        imageUrl: null,
        brandLogoUrl: null,
        estimatedMinutes: null,
        deadline: null,
        isActive: true,
        creatorId: "user-1",
        rewardId: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      mockRepository.findById.mockResolvedValue(mockMission);
      mockRepository.delete.mockResolvedValue(mockMission);

      // When
      await missionService.deleteMission("mission-1", "user-1");

      // Then
      expect(mockRepository.delete).toHaveBeenCalledWith("mission-1");
    });

    it("Mission이 없으면 404 에러를 던진다", async () => {
      // Given
      mockRepository.findById.mockResolvedValue(null);

      // When & Then
      await expect(missionService.deleteMission("invalid-id", "user-1")).rejects.toThrow(
        "미션을 찾을 수 없습니다.",
      );
    });

    it("권한이 없으면 403 에러를 던진다", async () => {
      // Given
      const mockMission = {
        id: "mission-1",
        title: "설문",
        description: null,
        target: null,
        imageUrl: null,
        brandLogoUrl: null,
        estimatedMinutes: null,
        deadline: null,
        isActive: true,
        creatorId: "user-1",
        rewardId: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      mockRepository.findById.mockResolvedValue(mockMission);

      // When & Then
      await expect(missionService.deleteMission("mission-1", "user-2")).rejects.toThrow(
        "삭제 권한이 없습니다.",
      );

      try {
        await missionService.deleteMission("mission-1", "user-2");
      } catch (error) {
        expect((error as Error & { cause: number }).cause).toBe(403);
      }
    });
  });
});
