import { ActionType } from "@prisma/client";
import {
  type ActionServiceTestContext,
  createActionServiceTestContext,
  mockMissionFactory,
} from "../testUtils";

describe("ActionService - Read", () => {
  let ctx: ActionServiceTestContext;

  beforeEach(() => {
    ctx = createActionServiceTestContext();
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
        isRequired: false,
        imageFileUploadId: null,
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
      ctx.mockActionRepo.findByIdWithOptions.mockResolvedValue(mockAction);

      // When
      const result = await ctx.service.getActionById("action1");

      // Then
      expect(result).toEqual(mockAction);
      expect(ctx.mockActionRepo.findByIdWithOptions).toHaveBeenCalledWith("action1");
      expect(ctx.mockActionRepo.findByIdWithOptions).toHaveBeenCalledTimes(1);
    });

    it("Action이 없으면 404 에러를 던진다", async () => {
      // Given
      ctx.mockActionRepo.findByIdWithOptions.mockResolvedValue(null);

      // When & Then
      await expect(ctx.service.getActionById("invalid-id")).rejects.toThrow(
        "액션을 찾을 수 없습니다.",
      );

      try {
        await ctx.service.getActionById("invalid-id");
      } catch (error) {
        expect(error instanceof Error && error.cause).toBe(404);
      }
    });
  });

  describe("getMissionActionIds", () => {
    it("Mission의 Action ID 목록을 성공적으로 조회한다", async () => {
      // Given
      const mockMission = mockMissionFactory();
      const mockActionIds = ["action1", "action2", "action3"];

      ctx.mockMissionRepo.findById.mockResolvedValue(mockMission);
      ctx.mockActionRepo.findActionIdsByMissionId.mockResolvedValue(mockActionIds);

      // When
      const result = await ctx.service.getMissionActionIds("mission1");

      // Then
      expect(result).toEqual({ actionIds: mockActionIds });
      expect(ctx.mockMissionRepo.findById).toHaveBeenCalledWith("mission1");
      expect(ctx.mockActionRepo.findActionIdsByMissionId).toHaveBeenCalledWith("mission1");
    });

    it("Mission이 없으면 404 에러를 던진다", async () => {
      // Given
      ctx.mockMissionRepo.findById.mockResolvedValue(null);

      // When & Then
      await expect(ctx.service.getMissionActionIds("invalid-id")).rejects.toThrow(
        "미션을 찾을 수 없습니다.",
      );

      expect(ctx.mockActionRepo.findActionIdsByMissionId).not.toHaveBeenCalled();
    });
  });

  describe("getMissionActionsDetail", () => {
    it("Mission의 Action 상세 목록을 성공적으로 조회한다", async () => {
      // Given
      const mockMission = mockMissionFactory();
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
          isRequired: false,
          imageFileUploadId: null,
          createdAt: new Date(),
          updatedAt: new Date(),
          options: [],
        },
      ];

      ctx.mockMissionRepo.findById.mockResolvedValue(mockMission);
      ctx.mockActionRepo.findDetailsByMissionId.mockResolvedValue(mockActions);

      // When
      const result = await ctx.service.getMissionActionsDetail("mission1");

      // Then
      expect(result).toEqual(mockActions);
      expect(ctx.mockMissionRepo.findById).toHaveBeenCalledWith("mission1");
      expect(ctx.mockActionRepo.findDetailsByMissionId).toHaveBeenCalledWith("mission1");
    });

    it("Mission이 없으면 404 에러를 던진다", async () => {
      // Given
      ctx.mockMissionRepo.findById.mockResolvedValue(null);

      // When & Then
      await expect(ctx.service.getMissionActionsDetail("invalid-id")).rejects.toThrow(
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
          isRequired: false,
          imageFileUploadId: null,
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
          isRequired: false,
          imageFileUploadId: null,
          createdAt: new Date(),
          updatedAt: new Date(),
          missionId: "mission1",
        },
      ];

      ctx.mockActionRepo.findMany.mockResolvedValue(mockActions);

      // When
      const result = await ctx.service.getActions({ limit: 10 });

      // Then
      expect(result).toEqual(mockActions);
      expect(ctx.mockActionRepo.findMany).toHaveBeenCalledWith({ limit: 10 });
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
          imageFileUploadId: null,
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

      ctx.mockActionRepo.findMany.mockResolvedValue(mockActions);

      // When
      const result = await ctx.service.getActions({ limit: 2 });

      // Then
      expect(result.length).toBe(2);
      expect(result[0]?.id).toBe("action1");
      expect(result[1]?.id).toBe("action2");
    });
  });
});
