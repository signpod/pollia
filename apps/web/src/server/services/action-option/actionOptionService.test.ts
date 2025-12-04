import type { ActionOptionRepository } from "@/server/repositories/action-option/actionOptionRepository";
import type { ActionRepository } from "@/server/repositories/action/actionRepository";
import type { MissionRepository } from "@/server/repositories/mission/missionRepository";
import { ActionType } from "@prisma/client";
import { ActionOptionService } from ".";

describe("ActionOptionService", () => {
  let service: ActionOptionService;
  let mockOptionRepo: jest.Mocked<ActionOptionRepository>;
  let mockActionRepo: jest.Mocked<ActionRepository>;
  let mockMissionRepo: jest.Mocked<MissionRepository>;

  beforeEach(() => {
    mockOptionRepo = {
      findById: jest.fn(),
      findByActionId: jest.fn(),
      findMany: jest.fn(),
      create: jest.fn(),
      createMany: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      deleteByActionId: jest.fn(),
    } as jest.Mocked<ActionOptionRepository>;

    mockActionRepo = {
      findById: jest.fn(),
    } as unknown as jest.Mocked<ActionRepository>;

    mockMissionRepo = {
      findById: jest.fn(),
    } as unknown as jest.Mocked<MissionRepository>;

    service = new ActionOptionService(mockOptionRepo, mockActionRepo, mockMissionRepo);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe("getOptionById", () => {
    it("Option을 성공적으로 조회한다", async () => {
      // Given
      const mockOption = {
        id: "option1",
        actionId: "action1",
        title: "옵션 1",
        description: "설명",
        imageUrl: null,
        order: 0,
        fileUploadId: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      mockOptionRepo.findById.mockResolvedValue(mockOption);

      // When
      const result = await service.getOptionById("option1");

      // Then
      expect(result).toEqual(mockOption);
      expect(mockOptionRepo.findById).toHaveBeenCalledWith("option1");
      expect(mockOptionRepo.findById).toHaveBeenCalledTimes(1);
    });

    it("Option이 없으면 404 에러를 던진다", async () => {
      // Given
      mockOptionRepo.findById.mockResolvedValue(null);

      // When & Then
      await expect(service.getOptionById("invalid-id")).rejects.toThrow("옵션을 찾을 수 없습니다.");

      try {
        await service.getOptionById("invalid-id");
      } catch (error) {
        expect(error instanceof Error && error.cause).toBe(404);
      }
    });
  });

  describe("getOptionsByActionId", () => {
    it("Action의 Option 목록을 성공적으로 조회한다", async () => {
      // Given
      const mockAction = {
        id: "action1",
        missionId: "mission1",
        title: "액션 1",
        description: null,
        imageUrl: null,
        type: ActionType.MULTIPLE_CHOICE,
        order: 0,
        maxSelections: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      const mockOptions = [
        {
          id: "option1",
          actionId: "action1",
          title: "옵션 1",
          description: null,
          imageUrl: null,
          order: 0,
          fileUploadId: null,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          id: "option2",
          actionId: "action1",
          title: "옵션 2",
          description: null,
          imageUrl: null,
          order: 1,
          fileUploadId: null,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];

      mockActionRepo.findById.mockResolvedValue(mockAction);
      mockOptionRepo.findByActionId.mockResolvedValue(mockOptions);

      // When
      const result = await service.getOptionsByActionId("action1");

      // Then
      expect(result).toEqual(mockOptions);
      expect(mockActionRepo.findById).toHaveBeenCalledWith("action1");
      expect(mockOptionRepo.findByActionId).toHaveBeenCalledWith("action1");
    });

    it("Action이 없으면 404 에러를 던진다", async () => {
      // Given
      mockActionRepo.findById.mockResolvedValue(null);

      // When & Then
      await expect(service.getOptionsByActionId("invalid-id")).rejects.toThrow(
        "액션을 찾을 수 없습니다.",
      );

      expect(mockOptionRepo.findByActionId).not.toHaveBeenCalled();
    });
  });

  describe("createOption", () => {
    const mockAction = {
      id: "action1",
      missionId: "mission1",
      title: "액션 1",
      description: null,
      imageUrl: null,
      type: ActionType.MULTIPLE_CHOICE,
      order: 0,
      maxSelections: null,
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

    it("Option을 성공적으로 생성한다", async () => {
      // Given
      const createData = {
        actionId: "action1",
        title: "새 옵션",
        description: "설명",
        imageUrl: "https://example.com/image.jpg",
        order: 0,
        fileUploadId: "file1",
      };
      const mockCreatedOption = {
        id: "option1",
        actionId: "action1",
        title: "새 옵션",
        description: "설명",
        imageUrl: "https://example.com/image.jpg",
        order: 0,
        fileUploadId: "file1",
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockActionRepo.findById.mockResolvedValue(mockAction);
      mockMissionRepo.findById.mockResolvedValue(mockMission);
      mockOptionRepo.create.mockResolvedValue(mockCreatedOption);

      // When
      const result = await service.createOption(createData, "user1");

      // Then
      expect(result).toEqual(mockCreatedOption);
      expect(mockActionRepo.findById).toHaveBeenCalledWith("action1");
      expect(mockMissionRepo.findById).toHaveBeenCalledWith("mission1");
      expect(mockOptionRepo.create).toHaveBeenCalled();
    });

    it("제목이 없으면 400 에러를 던진다", async () => {
      // Given
      const invalidData = {
        actionId: "action1",
        title: "",
        order: 0,
      };

      // When & Then
      await expect(service.createOption(invalidData, "user1")).rejects.toThrow(
        "옵션 제목을 입력해주세요.",
      );

      expect(mockOptionRepo.create).not.toHaveBeenCalled();
    });

    it("제목이 100자를 초과하면 400 에러를 던진다", async () => {
      // Given
      const invalidData = {
        actionId: "action1",
        title: "a".repeat(101),
        order: 0,
      };

      // When & Then
      await expect(service.createOption(invalidData, "user1")).rejects.toThrow(
        "옵션 제목은 100자를 초과할 수 없습니다.",
      );
    });

    it("순서가 음수면 400 에러를 던진다", async () => {
      // Given
      const invalidData = {
        actionId: "action1",
        title: "옵션",
        order: -1,
      };

      // When & Then
      await expect(service.createOption(invalidData, "user1")).rejects.toThrow(
        "옵션 순서는 0 이상이어야 합니다.",
      );
    });

    it("Action이 없으면 404 에러를 던진다", async () => {
      // Given
      const createData = {
        actionId: "invalid-action",
        title: "옵션",
        order: 0,
      };

      mockActionRepo.findById.mockResolvedValue(null);

      // When & Then
      await expect(service.createOption(createData, "user1")).rejects.toThrow(
        "존재하지 않는 액션입니다.",
      );
    });

    it("Mission 소유자가 아니면 403 에러를 던진다", async () => {
      // Given
      const createData = {
        actionId: "action1",
        title: "옵션",
        order: 0,
      };

      mockActionRepo.findById.mockResolvedValue(mockAction);
      mockMissionRepo.findById.mockResolvedValue(mockMission);

      // When & Then
      await expect(service.createOption(createData, "user2")).rejects.toThrow(
        "옵션을 수정할 권한이 없습니다.",
      );

      try {
        await service.createOption(createData, "user2");
      } catch (error) {
        expect(error instanceof Error && error.cause).toBe(403);
      }
    });
  });

  describe("createOptions", () => {
    const mockAction = {
      id: "action1",
      missionId: "mission1",
      title: "액션 1",
      description: null,
      imageUrl: null,
      type: ActionType.MULTIPLE_CHOICE,
      order: 0,
      maxSelections: null,
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

    it("여러 Option을 성공적으로 생성한다", async () => {
      // Given
      const options = [
        { title: "옵션 1", order: 0 },
        { title: "옵션 2", order: 1 },
      ];
      const mockCreatedOptions = [
        {
          id: "option1",
          actionId: "action1",
          title: "옵션 1",
          description: null,
          imageUrl: null,
          order: 0,
          fileUploadId: null,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          id: "option2",
          actionId: "action1",
          title: "옵션 2",
          description: null,
          imageUrl: null,
          order: 1,
          fileUploadId: null,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];

      mockActionRepo.findById.mockResolvedValue(mockAction);
      mockMissionRepo.findById.mockResolvedValue(mockMission);
      mockOptionRepo.createMany.mockResolvedValue(mockCreatedOptions);

      // When
      const result = await service.createOptions("action1", options, "user1");

      // Then
      expect(result).toEqual(mockCreatedOptions);
      expect(mockOptionRepo.createMany).toHaveBeenCalledWith("action1", options, "user1");
    });

    it("옵션이 없으면 400 에러를 던진다", async () => {
      // When & Then
      await expect(service.createOptions("action1", [], "user1")).rejects.toThrow(
        "최소 1개 이상의 옵션이 필요합니다.",
      );

      expect(mockOptionRepo.createMany).not.toHaveBeenCalled();
    });
  });

  describe("updateOption", () => {
    const mockOption = {
      id: "option1",
      actionId: "action1",
      title: "기존 옵션",
      description: null,
      imageUrl: null,
      order: 0,
      fileUploadId: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const mockAction = {
      id: "action1",
      missionId: "mission1",
      title: "액션 1",
      description: null,
      imageUrl: null,
      type: ActionType.MULTIPLE_CHOICE,
      order: 0,
      maxSelections: null,
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

    it("Option을 성공적으로 수정한다", async () => {
      // Given
      const updateData = {
        title: "수정된 옵션",
        description: "새 설명",
      };
      const mockUpdatedOption = {
        ...mockOption,
        ...updateData,
      };

      mockOptionRepo.findById.mockResolvedValue(mockOption);
      mockActionRepo.findById.mockResolvedValue(mockAction);
      mockMissionRepo.findById.mockResolvedValue(mockMission);
      mockOptionRepo.update.mockResolvedValue(mockUpdatedOption);

      // When
      const result = await service.updateOption("option1", updateData, "user1");

      // Then
      expect(result).toEqual(mockUpdatedOption);
      expect(mockOptionRepo.update).toHaveBeenCalledWith("option1", updateData);
    });

    it("Option이 없으면 404 에러를 던진다", async () => {
      // Given
      mockOptionRepo.findById.mockResolvedValue(null);

      // When & Then
      await expect(service.updateOption("invalid-id", { title: "수정" }, "user1")).rejects.toThrow(
        "옵션을 찾을 수 없습니다.",
      );
    });

    it("빈 제목으로 수정하려면 400 에러를 던진다", async () => {
      // Given
      mockOptionRepo.findById.mockResolvedValue(mockOption);

      // When & Then
      await expect(service.updateOption("option1", { title: "" }, "user1")).rejects.toThrow(
        "옵션 제목을 입력해주세요.",
      );
    });
  });

  describe("deleteOption", () => {
    const mockOption = {
      id: "option1",
      actionId: "action1",
      title: "옵션",
      description: null,
      imageUrl: null,
      order: 0,
      fileUploadId: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const mockAction = {
      id: "action1",
      missionId: "mission1",
      title: "액션 1",
      description: null,
      imageUrl: null,
      type: ActionType.MULTIPLE_CHOICE,
      order: 0,
      maxSelections: null,
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

    it("Option을 성공적으로 삭제한다", async () => {
      // Given
      mockOptionRepo.findById.mockResolvedValue(mockOption);
      mockActionRepo.findById.mockResolvedValue(mockAction);
      mockMissionRepo.findById.mockResolvedValue(mockMission);
      mockOptionRepo.delete.mockResolvedValue(mockOption);

      // When
      await service.deleteOption("option1", "user1");

      // Then
      expect(mockOptionRepo.delete).toHaveBeenCalledWith("option1");
    });

    it("Option이 없으면 404 에러를 던진다", async () => {
      // Given
      mockOptionRepo.findById.mockResolvedValue(null);

      // When & Then
      await expect(service.deleteOption("invalid-id", "user1")).rejects.toThrow(
        "옵션을 찾을 수 없습니다.",
      );

      expect(mockOptionRepo.delete).not.toHaveBeenCalled();
    });

    it("권한이 없으면 403 에러를 던진다", async () => {
      // Given
      mockOptionRepo.findById.mockResolvedValue(mockOption);
      mockActionRepo.findById.mockResolvedValue(mockAction);
      mockMissionRepo.findById.mockResolvedValue(mockMission);

      // When & Then
      await expect(service.deleteOption("option1", "user2")).rejects.toThrow(
        "옵션을 수정할 권한이 없습니다.",
      );

      expect(mockOptionRepo.delete).not.toHaveBeenCalled();
    });
  });

  describe("deleteOptionsByActionId", () => {
    const mockAction = {
      id: "action1",
      missionId: "mission1",
      title: "액션 1",
      description: null,
      imageUrl: null,
      type: ActionType.MULTIPLE_CHOICE,
      order: 0,
      maxSelections: null,
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

    it("Action의 모든 Option을 성공적으로 삭제한다", async () => {
      // Given
      mockActionRepo.findById.mockResolvedValue(mockAction);
      mockMissionRepo.findById.mockResolvedValue(mockMission);
      mockOptionRepo.deleteByActionId.mockResolvedValue({ count: 3 });

      // When
      await service.deleteOptionsByActionId("action1", "user1");

      // Then
      expect(mockOptionRepo.deleteByActionId).toHaveBeenCalledWith("action1");
    });

    it("Action이 없으면 404 에러를 던진다", async () => {
      // Given
      mockActionRepo.findById.mockResolvedValue(null);

      // When & Then
      await expect(service.deleteOptionsByActionId("invalid-id", "user1")).rejects.toThrow(
        "존재하지 않는 액션입니다.",
      );

      expect(mockOptionRepo.deleteByActionId).not.toHaveBeenCalled();
    });
  });
});
