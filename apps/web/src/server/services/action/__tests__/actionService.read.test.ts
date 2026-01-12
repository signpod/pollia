import { ActionType } from "@prisma/client";
import {
  type ActionServiceTestContext,
  createActionServiceTestContext,
  createMockAction,
  createMockActionWithOptions,
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
      const mockAction = createMockActionWithOptions(
        {
          title: "액션 제목",
          description: "액션 설명",
          type: ActionType.MULTIPLE_CHOICE,
          maxSelections: 1,
          isRequired: false,
        },
        [{ id: "option1", title: "옵션 1", description: null, imageUrl: null, order: 0 }],
      );
      ctx.mockActionRepo.findByIdWithOptions.mockResolvedValue(mockAction);

      // When
      const result = await ctx.service.getActionById("action1");

      // Then
      expect(result).toEqual(mockAction);
      expect(result.isRequired).toBe(false);
      expect(ctx.mockActionRepo.findByIdWithOptions).toHaveBeenCalledWith("action1");
      expect(ctx.mockActionRepo.findByIdWithOptions).toHaveBeenCalledTimes(1);
    });

    it("필수 액션(isRequired: true)을 조회한다", async () => {
      // Given
      const mockRequiredAction = createMockActionWithOptions(
        {
          id: "action2",
          title: "필수 액션",
          type: ActionType.SUBJECTIVE,
          order: 1,
          isRequired: true,
        },
        [],
      );
      ctx.mockActionRepo.findByIdWithOptions.mockResolvedValue(mockRequiredAction);

      // When
      const result = await ctx.service.getActionById("action2");

      // Then
      expect(result.isRequired).toBe(true);
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
        createMockActionWithOptions(
          {
            title: "액션 1",
            type: ActionType.MULTIPLE_CHOICE,
            maxSelections: 1,
            isRequired: false,
          },
          [],
        ),
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
        createMockAction({
          title: "액션 1",
          type: ActionType.MULTIPLE_CHOICE,
          maxSelections: 1,
          isRequired: false,
        }),
        createMockAction({
          id: "action2",
          title: "액션 2",
          type: ActionType.SCALE,
          order: 1,
          isRequired: false,
        }),
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
        createMockAction({
          title: "액션 1",
          type: ActionType.MULTIPLE_CHOICE,
          maxSelections: 1,
        }),
        createMockAction({
          id: "action2",
          title: "액션 2",
          type: ActionType.SCALE,
          order: 1,
        }),
        createMockAction({
          id: "action3",
          title: "액션 3",
          type: ActionType.SUBJECTIVE,
          order: 2,
        }),
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
