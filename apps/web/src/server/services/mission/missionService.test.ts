import type { MissionResponseRepository } from "@/server/repositories/mission-response/missionResponseRepository";
import type { MissionRepository } from "@/server/repositories/mission/missionRepository";
import { MissionService } from ".";
import { createMockMission } from "../testUtils";

jest.mock("@/lib/crypto", () => ({
  encrypt: jest.fn((text: string) => `encrypted:${text}`),
  decrypt: jest.fn((text: string) => text.replace("encrypted:", "")),
}));

describe("MissionService", () => {
  let missionService: MissionService;
  let mockRepository: jest.Mocked<MissionRepository>;
  let mockResponseRepository: jest.Mocked<MissionResponseRepository>;

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

    missionService = new MissionService(mockRepository, mockResponseRepository);
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
        imageFileUploadId: null,
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
      const mockMission = createMockMission({ id: "mission-1", creatorId: "user-1" });

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
      const mockMission = createMockMission({ id: "mission-1", creatorId: "user-1" });

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
          type: "GENERAL" as const,
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
          type: "GENERAL" as const,
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
          type: "GENERAL" as const,
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
          type: "GENERAL" as const,
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
          type: "GENERAL" as const,
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
        target: undefined,
        imageUrl: undefined,
        brandLogoUrl: undefined,
        deadline: new Date("2024-12-31"),
        estimatedMinutes: 10,
        type: "GENERAL" as const,
        actionIds: ["a1", "a2"],
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
        maxParticipants: null,
        type: "GENERAL" as const,
        password: null,
        creatorId: "user-1",
        rewardId: null,
        imageFileUploadId: null,
        brandLogoFileUploadId: null,
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
          brandLogoUrl: undefined,
          deadline: request.deadline,
          estimatedMinutes: request.estimatedMinutes,
          type: "GENERAL",
          creatorId: "user-1",
        },
        ["a1", "a2"],
      );
    });

    it("제목이 없으면 400 에러를 던진다", async () => {
      // Given
      const request = {
        title: "",
        description: undefined,
        target: undefined,
        imageUrl: undefined,
        brandLogoUrl: undefined,
        deadline: undefined,
        estimatedMinutes: undefined,
        type: "GENERAL" as const,
        actionIds: ["a1"],
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
  });

  describe("updateMission", () => {
    it("Mission을 성공적으로 수정한다", async () => {
      // Given
      const mockMission = createMockMission({
        id: "mission-1",
        title: "기존 설문",
        creatorId: "user-1",
      });
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
      expect(mockRepository.update).toHaveBeenCalledWith(
        "mission-1",
        {
          title: "수정된 설문",
          description: "수정된 설명",
        },
        "user-1",
      );
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
      const mockMission = createMockMission({ id: "mission-1", creatorId: "user-1" });
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
      const mockMission = createMockMission({ id: "mission-1", creatorId: "user-1" });
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
      const mockMission = createMockMission({ id: "mission-1", creatorId: "user-1" });
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
      const mockMission = createMockMission({ id: "mission-1", creatorId: "user-1" });
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

  describe("duplicateMission", () => {
    it("Mission을 성공적으로 복제한다", async () => {
      // Given
      const mockMission = createMockMission({
        id: "mission-1",
        title: "원본 미션",
        description: "설명",
        target: "대상",
        imageUrl: "https://example.com/image.jpg",
        brandLogoUrl: "https://example.com/logo.jpg",
        estimatedMinutes: 10,
        deadline: new Date("2024-12-31"),
        creatorId: "user-1",
      });

      const mockActions = [
        {
          id: "action-1",
          title: "질문 1",
          description: "설명 1",
          imageUrl: "https://example.com/action1.jpg",
          type: "MULTIPLE_CHOICE" as const,
          order: 0,
          maxSelections: 1,
          missionId: "mission-1",
          options: [
            {
              id: "opt-1",
              title: "선택지 1",
              description: null,
              imageUrl: "https://example.com/opt1.jpg",
              order: 0,
            },
            {
              id: "opt-2",
              title: "선택지 2",
              description: null,
              imageUrl: null,
              order: 1,
            },
          ],
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          id: "action-2",
          title: "질문 2",
          description: null,
          imageUrl: null,
          type: "SCALE" as const,
          order: 1,
          maxSelections: null,
          missionId: "mission-1",
          options: [
            {
              id: "opt-3",
              title: "척도 1",
              description: null,
              imageUrl: null,
              order: 0,
            },
          ],
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];

      const mockDuplicatedMission = createMockMission({
        id: "mission-2",
        title: "원본 미션 - 복사본",
        description: "설명",
        target: "대상",
        imageUrl: "https://example.com/image.jpg",
        brandLogoUrl: "https://example.com/logo.jpg",
        estimatedMinutes: 10,
        deadline: new Date("2024-12-31"),
        isActive: false,
        creatorId: "user-1",
      });

      mockRepository.findById.mockResolvedValue(mockMission);
      mockRepository.findActionsByMissionId.mockResolvedValue(mockActions);
      mockRepository.duplicateMission.mockResolvedValue(mockDuplicatedMission);

      // When
      const result = await missionService.duplicateMission("mission-1", "user-1");

      // Then
      expect(result.id).toBe("mission-2");
      expect(result.title).toBe("원본 미션 - 복사본");
      expect(result.creatorId).toBe("user-1");

      expect(mockRepository.duplicateMission).toHaveBeenCalledWith(
        {
          title: "원본 미션 - 복사본",
          description: "설명",
          target: "대상",
          imageUrl: "https://example.com/image.jpg",
          brandLogoUrl: "https://example.com/logo.jpg",
          deadline: mockMission.deadline,
          estimatedMinutes: 10,
          type: "GENERAL",
          isActive: false,
          creatorId: "user-1",
        },
        [
          {
            title: "질문 1",
            description: "설명 1",
            imageUrl: "https://example.com/action1.jpg",
            type: "MULTIPLE_CHOICE",
            order: 0,
            maxSelections: 1,
            options: [
              {
                title: "선택지 1",
                description: null,
                imageUrl: "https://example.com/opt1.jpg",
                order: 0,
              },
              {
                title: "선택지 2",
                description: null,
                imageUrl: null,
                order: 1,
              },
            ],
          },
          {
            title: "질문 2",
            description: null,
            imageUrl: null,
            type: "SCALE",
            order: 1,
            maxSelections: null,
            options: [
              {
                title: "척도 1",
                description: null,
                imageUrl: null,
                order: 0,
              },
            ],
          },
        ],
      );
    });

    it("Mission이 없으면 404 에러를 던진다", async () => {
      // Given
      mockRepository.findById.mockResolvedValue(null);

      // When & Then
      await expect(missionService.duplicateMission("invalid-id", "user-1")).rejects.toThrow(
        "미션을 찾을 수 없습니다.",
      );

      expect(mockRepository.findActionsByMissionId).not.toHaveBeenCalled();
      expect(mockRepository.duplicateMission).not.toHaveBeenCalled();
    });

    it("권한이 없으면 403 에러를 던진다", async () => {
      // Given
      const mockMission = createMockMission({
        id: "mission-1",
        title: "원본 미션",
        creatorId: "user-1",
      });
      mockRepository.findById.mockResolvedValue(mockMission);

      // When & Then
      await expect(missionService.duplicateMission("mission-1", "user-2")).rejects.toThrow(
        "복제 권한이 없습니다.",
      );

      try {
        await missionService.duplicateMission("mission-1", "user-2");
      } catch (error) {
        expect((error as Error & { cause: number }).cause).toBe(403);
      }

      expect(mockRepository.findActionsByMissionId).not.toHaveBeenCalled();
      expect(mockRepository.duplicateMission).not.toHaveBeenCalled();
    });

    it("액션이 없는 미션도 복제할 수 있다", async () => {
      // Given
      const mockMission = createMockMission({
        id: "mission-1",
        title: "원본 미션",
        creatorId: "user-1",
      });
      const mockDuplicatedMission = createMockMission({
        id: "mission-2",
        title: "원본 미션 - 복사본",
        isActive: false,
        creatorId: "user-1",
      });

      mockRepository.findById.mockResolvedValue(mockMission);
      mockRepository.findActionsByMissionId.mockResolvedValue([]);
      mockRepository.duplicateMission.mockResolvedValue(mockDuplicatedMission);

      // When
      const result = await missionService.duplicateMission("mission-1", "user-1");

      // Then
      expect(result.id).toBe("mission-2");
      expect(mockRepository.duplicateMission).toHaveBeenCalledWith(
        expect.objectContaining({
          title: "원본 미션 - 복사본",
          isActive: false,
          creatorId: "user-1",
        }),
        [],
      );
    });

    it("복제된 미션은 항상 비활성 상태이다", async () => {
      // Given
      const mockMission = {
        id: "mission-1",
        title: "활성 미션",
        description: null,
        target: null,
        imageUrl: null,
        brandLogoUrl: null,
        estimatedMinutes: null,
        deadline: null,
        isActive: true,
        maxParticipants: null,
        type: "GENERAL" as const,
        password: null,
        creatorId: "user-1",
        rewardId: null,
        imageFileUploadId: null,
        brandLogoFileUploadId: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const mockDuplicatedMission = {
        id: "mission-2",
        title: "활성 미션 - 복사본",
        description: null,
        target: null,
        imageUrl: null,
        brandLogoUrl: null,
        estimatedMinutes: null,
        deadline: null,
        isActive: false,
        maxParticipants: null,
        type: "GENERAL" as const,
        password: null,
        creatorId: "user-1",
        rewardId: null,
        imageFileUploadId: null,
        brandLogoFileUploadId: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockRepository.findById.mockResolvedValue(mockMission);
      mockRepository.findActionsByMissionId.mockResolvedValue([]);
      mockRepository.duplicateMission.mockResolvedValue(mockDuplicatedMission);

      // When
      await missionService.duplicateMission("mission-1", "user-1");

      // Then
      expect(mockRepository.duplicateMission).toHaveBeenCalledWith(
        expect.objectContaining({
          isActive: false,
        }),
        expect.any(Array),
      );
    });
  });

  describe("setPassword", () => {
    it("비밀번호를 성공적으로 설정한다", async () => {
      // Given
      const mockMission = {
        id: "mission-1",
        title: "미션",
        description: null,
        target: null,
        imageUrl: null,
        brandLogoUrl: null,
        estimatedMinutes: null,
        deadline: null,
        isActive: true,
        maxParticipants: null,
        type: "EXPERIENCE_GROUP" as const,
        password: null,
        creatorId: "user-1",
        rewardId: null,
        imageFileUploadId: null,
        brandLogoFileUploadId: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      mockRepository.findById.mockResolvedValue(mockMission);
      mockRepository.update.mockResolvedValue({
        ...mockMission,
        password: "encrypted:876098",
      });

      // When
      await missionService.setPassword("mission-1", "876098", "user-1");

      // Then
      expect(mockRepository.update).toHaveBeenCalledWith("mission-1", {
        password: "encrypted:876098",
      });
    });

    it("권한이 없으면 403 에러를 던진다", async () => {
      // Given
      const mockMission = {
        id: "mission-1",
        title: "미션",
        description: null,
        target: null,
        imageUrl: null,
        brandLogoUrl: null,
        estimatedMinutes: null,
        deadline: null,
        isActive: true,
        maxParticipants: null,
        type: "EXPERIENCE_GROUP" as const,
        password: null,
        creatorId: "user-1",
        rewardId: null,
        imageFileUploadId: null,
        brandLogoFileUploadId: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      mockRepository.findById.mockResolvedValue(mockMission);

      // When & Then
      await expect(missionService.setPassword("mission-1", "876098", "user-2")).rejects.toThrow(
        "비밀번호 설정 권한이 없습니다.",
      );

      try {
        await missionService.setPassword("mission-1", "876098", "user-2");
      } catch (error) {
        expect((error as Error & { cause: number }).cause).toBe(403);
      }
    });

    it("빈 비밀번호면 400 에러를 던진다", async () => {
      // Given
      const mockMission = {
        id: "mission-1",
        title: "미션",
        description: null,
        target: null,
        imageUrl: null,
        brandLogoUrl: null,
        estimatedMinutes: null,
        deadline: null,
        isActive: true,
        maxParticipants: null,
        type: "EXPERIENCE_GROUP" as const,
        password: null,
        creatorId: "user-1",
        rewardId: null,
        imageFileUploadId: null,
        brandLogoFileUploadId: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      mockRepository.findById.mockResolvedValue(mockMission);

      // When & Then
      await expect(missionService.setPassword("mission-1", "", "user-1")).rejects.toThrow(
        "비밀번호는 정확히 6자리여야 합니다.",
      );

      try {
        await missionService.setPassword("mission-1", "", "user-1");
      } catch (error) {
        expect((error as Error & { cause: number }).cause).toBe(400);
      }
    });
  });

  describe("removePassword", () => {
    it("비밀번호를 성공적으로 제거한다", async () => {
      // Given
      const mockMission = {
        id: "mission-1",
        title: "미션",
        description: null,
        target: null,
        imageUrl: null,
        brandLogoUrl: null,
        estimatedMinutes: null,
        deadline: null,
        isActive: true,
        maxParticipants: null,
        type: "EXPERIENCE_GROUP" as const,
        password: "encrypted:1234",
        creatorId: "user-1",
        rewardId: null,
        imageFileUploadId: null,
        brandLogoFileUploadId: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      mockRepository.findById.mockResolvedValue(mockMission);
      mockRepository.update.mockResolvedValue({ ...mockMission, password: null });

      // When
      await missionService.removePassword("mission-1", "user-1");

      // Then
      expect(mockRepository.update).toHaveBeenCalledWith("mission-1", { password: null });
    });

    it("권한이 없으면 403 에러를 던진다", async () => {
      // Given
      const mockMission = {
        id: "mission-1",
        title: "미션",
        description: null,
        target: null,
        imageUrl: null,
        brandLogoUrl: null,
        estimatedMinutes: null,
        deadline: null,
        isActive: true,
        maxParticipants: null,
        type: "EXPERIENCE_GROUP" as const,
        password: "encrypted:1234",
        creatorId: "user-1",
        rewardId: null,
        imageFileUploadId: null,
        brandLogoFileUploadId: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      mockRepository.findById.mockResolvedValue(mockMission);

      // When & Then
      await expect(missionService.removePassword("mission-1", "user-2")).rejects.toThrow(
        "비밀번호 제거 권한이 없습니다.",
      );

      try {
        await missionService.removePassword("mission-1", "user-2");
      } catch (error) {
        expect((error as Error & { cause: number }).cause).toBe(403);
      }
    });
  });

  describe("getPassword", () => {
    it("비밀번호를 복호화하여 반환한다", async () => {
      // Given
      const mockMission = {
        id: "mission-1",
        title: "미션",
        description: null,
        target: null,
        imageUrl: null,
        brandLogoUrl: null,
        estimatedMinutes: null,
        deadline: null,
        isActive: true,
        maxParticipants: null,
        type: "EXPERIENCE_GROUP" as const,
        password: "encrypted:1234",
        creatorId: "user-1",
        rewardId: null,
        imageFileUploadId: null,
        brandLogoFileUploadId: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      mockRepository.findById.mockResolvedValue(mockMission);

      // When
      const result = await missionService.getPassword("mission-1", "user-1");

      // Then
      expect(result).toBe("1234");
    });

    it("비밀번호가 없으면 null을 반환한다", async () => {
      // Given
      const mockMission = {
        id: "mission-1",
        title: "미션",
        description: null,
        target: null,
        imageUrl: null,
        brandLogoUrl: null,
        estimatedMinutes: null,
        deadline: null,
        isActive: true,
        maxParticipants: null,
        type: "GENERAL" as const,
        password: null,
        creatorId: "user-1",
        rewardId: null,
        imageFileUploadId: null,
        brandLogoFileUploadId: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      mockRepository.findById.mockResolvedValue(mockMission);

      // When
      const result = await missionService.getPassword("mission-1", "user-1");

      // Then
      expect(result).toBeNull();
    });

    it("권한이 없으면 403 에러를 던진다", async () => {
      // Given
      const mockMission = {
        id: "mission-1",
        title: "미션",
        description: null,
        target: null,
        imageUrl: null,
        brandLogoUrl: null,
        estimatedMinutes: null,
        deadline: null,
        isActive: true,
        maxParticipants: null,
        type: "EXPERIENCE_GROUP" as const,
        password: "encrypted:1234",
        creatorId: "user-1",
        rewardId: null,
        imageFileUploadId: null,
        brandLogoFileUploadId: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      mockRepository.findById.mockResolvedValue(mockMission);

      // When & Then
      await expect(missionService.getPassword("mission-1", "user-2")).rejects.toThrow(
        "비밀번호 조회 권한이 없습니다.",
      );

      try {
        await missionService.getPassword("mission-1", "user-2");
      } catch (error) {
        expect((error as Error & { cause: number }).cause).toBe(403);
      }
    });
  });

  describe("verifyPassword", () => {
    it("올바른 비밀번호면 true를 반환한다", async () => {
      // Given
      const mockMission = {
        id: "mission-1",
        title: "미션",
        description: null,
        target: null,
        imageUrl: null,
        brandLogoUrl: null,
        estimatedMinutes: null,
        deadline: null,
        isActive: true,
        maxParticipants: null,
        type: "EXPERIENCE_GROUP" as const,
        password: "encrypted:1234",
        creatorId: "user-1",
        rewardId: null,
        imageFileUploadId: null,
        brandLogoFileUploadId: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      mockRepository.findById.mockResolvedValue(mockMission);

      // When
      const result = await missionService.verifyPassword("mission-1", "1234");

      // Then
      expect(result).toBe(true);
    });

    it("틀린 비밀번호면 false를 반환한다", async () => {
      // Given
      const mockMission = {
        id: "mission-1",
        title: "미션",
        description: null,
        target: null,
        imageUrl: null,
        brandLogoUrl: null,
        estimatedMinutes: null,
        deadline: null,
        isActive: true,
        maxParticipants: null,
        type: "EXPERIENCE_GROUP" as const,
        password: "encrypted:1234",
        creatorId: "user-1",
        rewardId: null,
        imageFileUploadId: null,
        brandLogoFileUploadId: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      mockRepository.findById.mockResolvedValue(mockMission);

      // When
      const result = await missionService.verifyPassword("mission-1", "wrong");

      // Then
      expect(result).toBe(false);
    });

    it("비밀번호가 없는 미션은 항상 true를 반환한다", async () => {
      // Given
      const mockMission = {
        id: "mission-1",
        title: "미션",
        description: null,
        target: null,
        imageUrl: null,
        brandLogoUrl: null,
        estimatedMinutes: null,
        deadline: null,
        isActive: true,
        maxParticipants: null,
        type: "GENERAL" as const,
        password: null,
        creatorId: "user-1",
        rewardId: null,
        imageFileUploadId: null,
        brandLogoFileUploadId: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      mockRepository.findById.mockResolvedValue(mockMission);

      // When
      const result = await missionService.verifyPassword("mission-1", "anything");

      // Then
      expect(result).toBe(true);
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
        "미션 참여 정원이 마감되었습니다.",
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
