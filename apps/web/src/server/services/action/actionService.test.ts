import type { ActionRepository } from "@/server/repositories/action/actionRepository";
import type { MissionRepository } from "@/server/repositories/mission/missionRepository";
import { ActionType } from "@prisma/client";
import { ActionService } from ".";

describe("ActionService", () => {
  let service: ActionService;
  let mockActionRepo: jest.Mocked<ActionRepository>;
  let mockMissionRepo: jest.Mocked<MissionRepository>;

  beforeEach(() => {
    mockActionRepo = {
      findById: jest.fn(),
      findByIdWithOptions: jest.fn(),
      findActionIdsByMissionId: jest.fn(),
      findDetailsByMissionId: jest.fn(),
      findMany: jest.fn(),
      create: jest.fn(),
      createMultipleChoice: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    } as jest.Mocked<ActionRepository>;

    mockMissionRepo = {
      findById: jest.fn(),
    } as unknown as jest.Mocked<MissionRepository>;

    service = new ActionService(mockActionRepo, mockMissionRepo);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe("getActionById", () => {
    it("Action을 성공적으로 조회한다", async () => {
      // Given
      const mockAction = {
        id: "action1",
        missionId: "mission1",
        title: "액션 제목",
        description: "액션 설명",
        imageUrl: null,
        type: ActionType.MULTIPLE_CHOICE,
        order: 0,
        maxSelections: 1,
        createdAt: new Date(),
        updatedAt: new Date(),
        options: [
          {
            id: "option1",
            title: "옵션 1",
            description: null,
            imageUrl: null,
            order: 0,
          },
        ],
      };
      mockActionRepo.findByIdWithOptions.mockResolvedValue(mockAction);

      // When
      const result = await service.getActionById("action1");

      // Then
      expect(result).toEqual(mockAction);
      expect(mockActionRepo.findByIdWithOptions).toHaveBeenCalledWith("action1");
      expect(mockActionRepo.findByIdWithOptions).toHaveBeenCalledTimes(1);
    });

    it("Action이 없으면 404 에러를 던진다", async () => {
      // Given
      mockActionRepo.findByIdWithOptions.mockResolvedValue(null);

      // When & Then
      await expect(service.getActionById("invalid-id")).rejects.toThrow("액션을 찾을 수 없습니다.");

      try {
        await service.getActionById("invalid-id");
      } catch (error) {
        expect(error instanceof Error && error.cause).toBe(404);
      }
    });
  });

  describe("getMissionActionIds", () => {
    it("Mission의 Action ID 목록을 성공적으로 조회한다", async () => {
      // Given
      const mockMission = {
        id: "mission1",
        title: "미션",
        description: null,
        target: null,
        imageUrl: null,
        brandLogoUrl: null,
        estimatedMinutes: null,
        deadline: null,
        isActive: true,
        creatorId: "user1",
        rewardId: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      const mockActionIds = ["action1", "action2", "action3"];

      mockMissionRepo.findById.mockResolvedValue(mockMission);
      mockActionRepo.findActionIdsByMissionId.mockResolvedValue(mockActionIds);

      // When
      const result = await service.getMissionActionIds("mission1");

      // Then
      expect(result).toEqual({ actionIds: mockActionIds });
      expect(mockMissionRepo.findById).toHaveBeenCalledWith("mission1");
      expect(mockActionRepo.findActionIdsByMissionId).toHaveBeenCalledWith("mission1");
    });

    it("Mission이 없으면 404 에러를 던진다", async () => {
      // Given
      mockMissionRepo.findById.mockResolvedValue(null);

      // When & Then
      await expect(service.getMissionActionIds("invalid-id")).rejects.toThrow(
        "미션을 찾을 수 없습니다.",
      );

      expect(mockActionRepo.findActionIdsByMissionId).not.toHaveBeenCalled();
    });
  });

  describe("getMissionActionsDetail", () => {
    it("Mission의 Action 상세 목록을 성공적으로 조회한다", async () => {
      // Given
      const mockMission = {
        id: "mission1",
        title: "미션",
        description: null,
        target: null,
        imageUrl: null,
        brandLogoUrl: null,
        estimatedMinutes: null,
        deadline: null,
        isActive: true,
        creatorId: "user1",
        rewardId: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      const mockActions = [
        {
          id: "action1",
          missionId: "mission1",
          title: "액션 1",
          description: null,
          imageUrl: null,
          type: ActionType.MULTIPLE_CHOICE,
          order: 0,
          maxSelections: 1,
          createdAt: new Date(),
          updatedAt: new Date(),
          options: [],
        },
      ];

      mockMissionRepo.findById.mockResolvedValue(mockMission);
      mockActionRepo.findDetailsByMissionId.mockResolvedValue(mockActions);

      // When
      const result = await service.getMissionActionsDetail("mission1");

      // Then
      expect(result).toEqual(mockActions);
      expect(mockMissionRepo.findById).toHaveBeenCalledWith("mission1");
      expect(mockActionRepo.findDetailsByMissionId).toHaveBeenCalledWith("mission1");
    });

    it("Mission이 없으면 404 에러를 던진다", async () => {
      // Given
      mockMissionRepo.findById.mockResolvedValue(null);

      // When & Then
      await expect(service.getMissionActionsDetail("invalid-id")).rejects.toThrow(
        "미션을 찾을 수 없습니다.",
      );
    });
  });

  describe("getActions", () => {
    it("Action 목록을 성공적으로 조회한다", async () => {
      // Given
      const mockActions = [
        {
          id: "action1",
          title: "액션 1",
          type: ActionType.MULTIPLE_CHOICE,
          description: null,
          imageUrl: null,
          maxSelections: 1,
          order: 0,
          createdAt: new Date(),
          updatedAt: new Date(),
          missionId: "mission1",
        },
        {
          id: "action2",
          title: "액션 2",
          type: ActionType.SCALE,
          description: null,
          imageUrl: null,
          maxSelections: null,
          order: 1,
          createdAt: new Date(),
          updatedAt: new Date(),
          missionId: "mission1",
        },
      ];

      mockActionRepo.findMany.mockResolvedValue(mockActions);

      // When
      const result = await service.getActions({ limit: 10 });

      // Then
      expect(result).toEqual(mockActions);
      expect(mockActionRepo.findMany).toHaveBeenCalledWith({ limit: 10 });
    });

    it("limit을 초과하는 결과는 마지막 항목을 제거한다", async () => {
      // Given
      const mockActions = [
        {
          id: "action1",
          title: "액션 1",
          type: ActionType.MULTIPLE_CHOICE,
          description: null,
          imageUrl: null,
          maxSelections: 1,
          order: 0,
          createdAt: new Date(),
          updatedAt: new Date(),
          missionId: "mission1",
        },
        {
          id: "action2",
          title: "액션 2",
          type: ActionType.SCALE,
          description: null,
          imageUrl: null,
          maxSelections: null,
          order: 1,
          createdAt: new Date(),
          updatedAt: new Date(),
          missionId: "mission1",
        },
        {
          id: "action3",
          title: "액션 3",
          type: ActionType.SUBJECTIVE,
          description: null,
          imageUrl: null,
          maxSelections: null,
          order: 2,
          createdAt: new Date(),
          updatedAt: new Date(),
          missionId: "mission1",
        },
      ];

      mockActionRepo.findMany.mockResolvedValue(mockActions);

      // When
      const result = await service.getActions({ limit: 2 });

      // Then
      expect(result.length).toBe(2);
      expect(result[0]?.id).toBe("action1");
      expect(result[1]?.id).toBe("action2");
    });
  });

  describe("createMultipleChoiceAction", () => {
    const mockMission = {
      id: "mission1",
      title: "미션",
      description: null,
      target: null,
      imageUrl: null,
      brandLogoUrl: null,
      estimatedMinutes: null,
      deadline: null,
      isActive: true,
      creatorId: "user1",
      rewardId: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    it("Multiple Choice Action을 성공적으로 생성한다", async () => {
      // Given
      const request = {
        missionId: "mission1",
        title: "좋아하는 색은?",
        description: "하나를 선택하세요",
        imageUrl: undefined,
        order: 0,
        maxSelections: 1,
        options: [
          {
            title: "빨강",
            description: undefined,
            imageUrl: undefined,
            order: 0,
            imageFileUploadId: undefined,
          },
          {
            title: "파랑",
            description: undefined,
            imageUrl: undefined,
            order: 1,
            imageFileUploadId: undefined,
          },
        ],
      };
      const mockCreatedAction = {
        id: "action1",
        missionId: "mission1",
        title: request.title,
        type: ActionType.MULTIPLE_CHOICE,
        order: request.order,
        maxSelections: request.maxSelections,
        description: request.description,
        imageUrl: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockMissionRepo.findById.mockResolvedValue(mockMission);
      mockActionRepo.createMultipleChoice.mockResolvedValue(mockCreatedAction);

      // When
      const result = await service.createMultipleChoiceAction(request, "user1");

      // Then
      expect(result.id).toBe("action1");
      expect(result.title).toBe(request.title);
      expect(mockMissionRepo.findById).toHaveBeenCalledWith("mission1");
      expect(mockActionRepo.createMultipleChoice).toHaveBeenCalledWith(
        {
          missionId: "mission1",
          title: request.title,
          description: request.description,
          imageUrl: request.imageUrl,
          type: ActionType.MULTIPLE_CHOICE,
          order: request.order,
          maxSelections: request.maxSelections,
        },
        request.options.map(opt => ({
          title: opt.title,
          description: opt.description,
          imageUrl: opt.imageUrl,
          order: opt.order,
          imageFileUploadId: opt.imageFileUploadId,
        })),
        "user1",
      );
    });

    it("Mission 소유자가 아니면 403 에러를 던진다", async () => {
      // Given
      const request = {
        missionId: "mission1",
        title: "액션",
        order: 0,
        maxSelections: 1,
        options: [
          { title: "옵션 1", order: 0 },
          { title: "옵션 2", order: 1 },
        ],
      };

      mockMissionRepo.findById.mockResolvedValue(mockMission);

      // When & Then
      await expect(service.createMultipleChoiceAction(request, "user2")).rejects.toThrow(
        "액션을 추가할 권한이 없습니다.",
      );

      try {
        await service.createMultipleChoiceAction(request, "user2");
      } catch (error) {
        expect(error instanceof Error && error.cause).toBe(403);
      }

      expect(mockActionRepo.createMultipleChoice).not.toHaveBeenCalled();
    });

    it("Mission이 없으면 404 에러를 던진다", async () => {
      // Given
      const request = {
        missionId: "invalid-mission",
        title: "액션",
        order: 0,
        maxSelections: 1,
        options: [
          { title: "옵션 1", order: 0 },
          { title: "옵션 2", order: 1 },
        ],
      };

      mockMissionRepo.findById.mockResolvedValue(null);

      // When & Then
      await expect(service.createMultipleChoiceAction(request, "user1")).rejects.toThrow(
        "존재하지 않는 미션입니다.",
      );
    });

    it("옵션이 2개 미만이면 400 에러를 던진다", async () => {
      // Given
      const request = {
        missionId: "mission1",
        title: "액션",
        order: 0,
        maxSelections: 1,
        options: [{ title: "옵션 1", order: 0 }],
      };

      // When & Then
      await expect(service.createMultipleChoiceAction(request, "user1")).rejects.toThrow(
        "최소 2개 이상의 항목이 필요합니다.",
      );

      try {
        await service.createMultipleChoiceAction(request, "user1");
      } catch (error) {
        expect(error instanceof Error && error.cause).toBe(400);
      }

      expect(mockActionRepo.createMultipleChoice).not.toHaveBeenCalled();
    });

    it("옵션이 없으면 400 에러를 던진다", async () => {
      // Given
      const request = {
        missionId: "mission1",
        title: "액션",
        order: 0,
        maxSelections: 1,
        options: [],
      };

      // When & Then
      await expect(service.createMultipleChoiceAction(request, "user1")).rejects.toThrow(
        "최소 2개 이상의 항목이 필요합니다.",
      );

      expect(mockActionRepo.createMultipleChoice).not.toHaveBeenCalled();
    });
  });

  describe("createScaleAction", () => {
    const mockMission = {
      id: "mission1",
      title: "미션",
      description: null,
      target: null,
      imageUrl: null,
      brandLogoUrl: null,
      estimatedMinutes: null,
      deadline: null,
      isActive: true,
      creatorId: "user1",
      rewardId: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    it("Scale Action을 성공적으로 생성한다", async () => {
      // Given
      const request = {
        missionId: "mission1",
        title: "만족도를 평가해주세요",
        description: "1-5점",
        imageUrl: undefined,
        order: 0,
      };
      const mockCreatedAction = {
        id: "action1",
        missionId: "mission1",
        title: request.title,
        type: ActionType.SCALE,
        order: request.order,
        maxSelections: null,
        description: request.description,
        imageUrl: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockMissionRepo.findById.mockResolvedValue(mockMission);
      mockActionRepo.create.mockResolvedValue(mockCreatedAction);

      // When
      const result = await service.createScaleAction(request, "user1");

      // Then
      expect(result.id).toBe("action1");
      expect(result.type).toBe(ActionType.SCALE);
      expect(mockActionRepo.create).toHaveBeenCalledWith({
        missionId: "mission1",
        title: request.title,
        description: request.description,
        imageUrl: request.imageUrl,
        type: ActionType.SCALE,
        order: request.order,
      });
    });
  });

  describe("createSubjectiveAction", () => {
    const mockMission = {
      id: "mission1",
      title: "미션",
      description: null,
      target: null,
      imageUrl: null,
      brandLogoUrl: null,
      estimatedMinutes: null,
      deadline: null,
      isActive: true,
      creatorId: "user1",
      rewardId: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    it("Subjective Action을 성공적으로 생성한다", async () => {
      // Given
      const request = {
        missionId: "mission1",
        title: "의견을 자유롭게 작성해주세요",
        description: "상세히 작성해주세요",
        imageUrl: undefined,
        order: 0,
      };
      const mockCreatedAction = {
        id: "action1",
        missionId: "action1",
        title: request.title,
        type: ActionType.SUBJECTIVE,
        order: request.order,
        maxSelections: null,
        description: request.description,
        imageUrl: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockMissionRepo.findById.mockResolvedValue(mockMission);
      mockActionRepo.create.mockResolvedValue(mockCreatedAction);

      // When
      const result = await service.createSubjectiveAction(request, "user1");

      // Then
      expect(result.id).toBe("action1");
      expect(result.type).toBe(ActionType.SUBJECTIVE);
      expect(mockActionRepo.create).toHaveBeenCalledWith({
        missionId: "mission1",
        title: request.title,
        description: request.description,
        imageUrl: request.imageUrl,
        type: ActionType.SUBJECTIVE,
        order: request.order,
      });
    });
  });

  describe("createEitherOrAction", () => {
    it("Either Or Action을 성공적으로 생성한다", async () => {
      // Given
      const request = {
        title: "A와 B 중 선택하세요",
        order: 0,
      };
      const mockCreatedAction = {
        id: "action1",
        missionId: null,
        title: request.title,
        type: ActionType.MULTIPLE_CHOICE,
        order: request.order,
        maxSelections: null,
        description: null,
        imageUrl: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockActionRepo.create.mockResolvedValue(mockCreatedAction);

      // When
      const result = await service.createEitherOrAction(request, "user1");

      // Then
      expect(result.id).toBe("action1");
      expect(result.type).toBe(ActionType.MULTIPLE_CHOICE);
    });

    it("제목이 없으면 400 에러를 던진다", async () => {
      // Given
      const request = {
        title: "",
        order: 0,
      };

      // When & Then
      await expect(service.createEitherOrAction(request, "user1")).rejects.toThrow(
        "제목을 입력해주세요.",
      );

      expect(mockActionRepo.create).not.toHaveBeenCalled();
    });
  });

  describe("updateAction", () => {
    const mockAction = {
      id: "action1",
      missionId: "mission1",
      title: "기존 액션",
      description: null,
      imageUrl: null,
      type: ActionType.MULTIPLE_CHOICE,
      order: 0,
      maxSelections: 1,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const mockMission = {
      id: "mission1",
      title: "미션",
      description: null,
      target: null,
      imageUrl: null,
      brandLogoUrl: null,
      estimatedMinutes: null,
      deadline: null,
      isActive: true,
      creatorId: "user1",
      rewardId: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    it("Action을 성공적으로 수정한다", async () => {
      // Given
      const updateData = {
        title: "수정된 액션",
        description: "새 설명",
      };
      const mockUpdatedAction = {
        ...mockAction,
        ...updateData,
      };

      mockActionRepo.findById.mockResolvedValue(mockAction);
      mockMissionRepo.findById.mockResolvedValue(mockMission);
      mockActionRepo.update.mockResolvedValue(mockUpdatedAction);

      // When
      const result = await service.updateAction("action1", updateData, "user1");

      // Then
      expect(result).toEqual(mockUpdatedAction);
      expect(mockActionRepo.update).toHaveBeenCalledWith("action1", updateData);
    });

    it("Action이 없으면 404 에러를 던진다", async () => {
      // Given
      mockActionRepo.findById.mockResolvedValue(null);

      // When & Then
      await expect(service.updateAction("invalid-id", { title: "수정" }, "user1")).rejects.toThrow(
        "액션을 찾을 수 없습니다.",
      );
    });

    it("권한이 없으면 403 에러를 던진다", async () => {
      // Given
      mockActionRepo.findById.mockResolvedValue(mockAction);
      mockMissionRepo.findById.mockResolvedValue(mockMission);

      // When & Then
      await expect(service.updateAction("action1", { title: "수정" }, "user2")).rejects.toThrow(
        "액션을 추가할 권한이 없습니다.",
      );

      expect(mockActionRepo.update).not.toHaveBeenCalled();
    });
  });

  describe("deleteAction", () => {
    const mockAction = {
      id: "action1",
      missionId: "mission1",
      title: "액션",
      description: null,
      imageUrl: null,
      type: ActionType.MULTIPLE_CHOICE,
      order: 0,
      maxSelections: 1,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const mockMission = {
      id: "mission1",
      title: "미션",
      description: null,
      target: null,
      imageUrl: null,
      brandLogoUrl: null,
      estimatedMinutes: null,
      deadline: null,
      isActive: true,
      creatorId: "user1",
      rewardId: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    it("Action을 성공적으로 삭제한다", async () => {
      // Given
      mockActionRepo.findById.mockResolvedValue(mockAction);
      mockMissionRepo.findById.mockResolvedValue(mockMission);
      mockActionRepo.delete.mockResolvedValue(mockAction);

      // When
      await service.deleteAction("action1", "user1");

      // Then
      expect(mockActionRepo.delete).toHaveBeenCalledWith("action1");
    });

    it("Action이 없으면 404 에러를 던진다", async () => {
      // Given
      mockActionRepo.findById.mockResolvedValue(null);

      // When & Then
      await expect(service.deleteAction("invalid-id", "user1")).rejects.toThrow(
        "액션을 찾을 수 없습니다.",
      );

      expect(mockActionRepo.delete).not.toHaveBeenCalled();
    });

    it("권한이 없으면 403 에러를 던진다", async () => {
      // Given
      mockActionRepo.findById.mockResolvedValue(mockAction);
      mockMissionRepo.findById.mockResolvedValue(mockMission);

      // When & Then
      await expect(service.deleteAction("action1", "user2")).rejects.toThrow(
        "액션을 추가할 권한이 없습니다.",
      );

      expect(mockActionRepo.delete).not.toHaveBeenCalled();
    });
  });
});
