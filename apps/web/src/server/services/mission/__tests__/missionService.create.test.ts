import type { ActionRepository } from "@/server/repositories/action/actionRepository";
import type { MissionResponseRepository } from "@/server/repositories/mission-response/missionResponseRepository";
import type { MissionRepository } from "@/server/repositories/mission/missionRepository";
import { MissionService } from "..";
import { createMockActionWithOptions, createMockMission } from "../../testUtils";

describe("MissionService - Create", () => {
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
          imageFileUploadId: undefined,
          brandLogoUrl: undefined,
          brandLogoFileUploadId: undefined,
          deadline: request.deadline,
          estimatedMinutes: request.estimatedMinutes,
          maxParticipants: undefined,
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
        createMockActionWithOptions(
          {
            id: "action-1",
            missionId: "mission-1",
            title: "질문 1",
            description: "설명 1",
            imageUrl: "https://example.com/action1.jpg",
            type: "MULTIPLE_CHOICE",
            maxSelections: 1,
            isRequired: false,
          },
          [
            {
              id: "opt-1",
              title: "선택지 1",
              description: null,
              imageUrl: "https://example.com/opt1.jpg",
              order: 0,
            },
            { id: "opt-2", title: "선택지 2", description: null, imageUrl: null, order: 1 },
          ],
        ),
        createMockActionWithOptions(
          {
            id: "action-2",
            missionId: "mission-1",
            title: "질문 2",
            type: "SCALE",
            order: 1,
            isRequired: false,
          },
          [{ id: "opt-3", title: "척도 1", description: null, imageUrl: null, order: 0 }],
        ),
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
      mockActionRepository.findDetailsByMissionId.mockResolvedValue(mockActions);
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

      expect(mockActionRepository.findDetailsByMissionId).not.toHaveBeenCalled();
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

      expect(mockActionRepository.findDetailsByMissionId).not.toHaveBeenCalled();
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
      mockActionRepository.findDetailsByMissionId.mockResolvedValue([]);
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
      mockActionRepository.findDetailsByMissionId.mockResolvedValue([]);
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
});
