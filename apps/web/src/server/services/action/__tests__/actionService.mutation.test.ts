import { ActionType } from "@prisma/client";
import {
  type ActionServiceTestContext,
  createActionServiceTestContext,
  mockMissionFactory,
} from "../testUtils";

describe("ActionService - Mutation", () => {
  let ctx: ActionServiceTestContext;

  beforeEach(() => {
    ctx = createActionServiceTestContext();
  });

  afterEach(() => {
    jest.clearAllMocks();
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
      imageFileUploadId: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    it("Action을 성공적으로 수정한다", async () => {
      // Given
      const mockMission = mockMissionFactory();
      const updateData = {
        title: "수정된 액션",
        description: "새 설명",
      };
      const mockUpdatedAction = {
        ...mockAction,
        ...updateData,
      };

      ctx.mockActionRepo.findById.mockResolvedValue(mockAction);
      ctx.mockMissionRepo.findById.mockResolvedValue(mockMission);
      ctx.mockActionRepo.update.mockResolvedValue(mockUpdatedAction);

      // When
      const result = await ctx.service.updateAction("action1", updateData, "user1");

      // Then
      expect(result).toEqual(mockUpdatedAction);
      expect(ctx.mockActionRepo.update).toHaveBeenCalledWith("action1", updateData, "user1");
    });

    it("Action이 없으면 404 에러를 던진다", async () => {
      // Given
      ctx.mockActionRepo.findById.mockResolvedValue(null);

      // When & Then
      await expect(
        ctx.service.updateAction("invalid-id", { title: "수정" }, "user1"),
      ).rejects.toThrow("액션을 찾을 수 없습니다.");
    });

    it("권한이 없으면 403 에러를 던진다", async () => {
      // Given
      const mockMission = mockMissionFactory();
      ctx.mockActionRepo.findById.mockResolvedValue(mockAction);
      ctx.mockMissionRepo.findById.mockResolvedValue(mockMission);

      // When & Then
      await expect(ctx.service.updateAction("action1", { title: "수정" }, "user2")).rejects.toThrow(
        "액션을 추가할 권한이 없습니다.",
      );

      expect(ctx.mockActionRepo.update).not.toHaveBeenCalled();
    });

    it("options가 포함되면 updateWithOptions를 호출한다", async () => {
      // Given
      const mockMission = mockMissionFactory();
      const updateData = {
        title: "수정된 액션",
        options: [
          { title: "새 옵션 1", order: 0 },
          { title: "새 옵션 2", order: 1 },
        ],
      };
      const mockUpdatedAction = {
        ...mockAction,
        title: updateData.title,
      };

      ctx.mockActionRepo.findById.mockResolvedValue(mockAction);
      ctx.mockMissionRepo.findById.mockResolvedValue(mockMission);
      ctx.mockActionRepo.updateWithOptions.mockResolvedValue(mockUpdatedAction);

      // When
      const result = await ctx.service.updateAction("action1", updateData, "user1");

      // Then
      expect(result).toEqual(mockUpdatedAction);
      expect(ctx.mockActionRepo.updateWithOptions).toHaveBeenCalledWith(
        "action1",
        { title: "수정된 액션" },
        updateData.options,
        "user1",
      );
      expect(ctx.mockActionRepo.update).not.toHaveBeenCalled();
    });

    it("options가 빈 배열이면 기본 update를 호출한다", async () => {
      // Given
      const mockMission = mockMissionFactory();
      const updateData = {
        title: "수정된 액션",
        options: [],
      };
      const mockUpdatedAction = {
        ...mockAction,
        title: updateData.title,
      };

      ctx.mockActionRepo.findById.mockResolvedValue(mockAction);
      ctx.mockMissionRepo.findById.mockResolvedValue(mockMission);
      ctx.mockActionRepo.update.mockResolvedValue(mockUpdatedAction);

      // When
      const result = await ctx.service.updateAction("action1", updateData, "user1");

      // Then
      expect(result).toEqual(mockUpdatedAction);
      expect(ctx.mockActionRepo.update).toHaveBeenCalledWith(
        "action1",
        { title: "수정된 액션" },
        "user1",
      );
      expect(ctx.mockActionRepo.updateWithOptions).not.toHaveBeenCalled();
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
      imageFileUploadId: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    it("Action을 성공적으로 삭제한다", async () => {
      // Given
      const mockMission = mockMissionFactory();
      ctx.mockActionRepo.findById.mockResolvedValue(mockAction);
      ctx.mockMissionRepo.findById.mockResolvedValue(mockMission);
      ctx.mockActionRepo.delete.mockResolvedValue(mockAction);

      // When
      await ctx.service.deleteAction("action1", "user1");

      // Then
      expect(ctx.mockActionRepo.delete).toHaveBeenCalledWith("action1");
    });

    it("Action이 없으면 404 에러를 던진다", async () => {
      // Given
      ctx.mockActionRepo.findById.mockResolvedValue(null);

      // When & Then
      await expect(ctx.service.deleteAction("invalid-id", "user1")).rejects.toThrow(
        "액션을 찾을 수 없습니다.",
      );

      expect(ctx.mockActionRepo.delete).not.toHaveBeenCalled();
    });

    it("권한이 없으면 403 에러를 던진다", async () => {
      // Given
      const mockMission = mockMissionFactory();
      ctx.mockActionRepo.findById.mockResolvedValue(mockAction);
      ctx.mockMissionRepo.findById.mockResolvedValue(mockMission);

      // When & Then
      await expect(ctx.service.deleteAction("action1", "user2")).rejects.toThrow(
        "액션을 추가할 권한이 없습니다.",
      );

      expect(ctx.mockActionRepo.delete).not.toHaveBeenCalled();
    });
  });

  describe("reorderActions", () => {
    it("액션 순서를 성공적으로 변경한다", async () => {
      // Given
      const mockMission = mockMissionFactory();
      const actionOrders = [
        { id: "action1", order: 2 },
        { id: "action2", order: 0 },
        { id: "action3", order: 1 },
      ];
      const missionActionIds = ["action1", "action2", "action3"];

      ctx.mockMissionRepo.findById.mockResolvedValue(mockMission);
      ctx.mockActionRepo.findActionIdsByMissionId.mockResolvedValue(missionActionIds);
      ctx.mockActionRepo.updateManyOrders.mockResolvedValue([]);

      // When
      const result = await ctx.service.reorderActions("mission1", actionOrders, "user1");

      // Then
      expect(result).toEqual({ success: true });
      expect(ctx.mockMissionRepo.findById).toHaveBeenCalledWith("mission1");
      expect(ctx.mockActionRepo.findActionIdsByMissionId).toHaveBeenCalledWith("mission1");
      expect(ctx.mockActionRepo.updateManyOrders).toHaveBeenCalledWith(actionOrders);
    });

    it("Mission이 없으면 404 에러를 던진다", async () => {
      // Given
      const actionOrders = [
        { id: "action1", order: 0 },
        { id: "action2", order: 1 },
      ];

      ctx.mockMissionRepo.findById.mockResolvedValue(null);

      // When & Then
      await expect(
        ctx.service.reorderActions("invalid-mission", actionOrders, "user1"),
      ).rejects.toThrow("존재하지 않는 미션입니다.");

      try {
        await ctx.service.reorderActions("invalid-mission", actionOrders, "user1");
      } catch (error) {
        expect(error instanceof Error && error.cause).toBe(404);
      }

      expect(ctx.mockActionRepo.findActionIdsByMissionId).not.toHaveBeenCalled();
      expect(ctx.mockActionRepo.updateManyOrders).not.toHaveBeenCalled();
    });

    it("Mission 소유자가 아니면 403 에러를 던진다", async () => {
      // Given
      const mockMission = mockMissionFactory();
      const actionOrders = [
        { id: "action1", order: 0 },
        { id: "action2", order: 1 },
      ];

      ctx.mockMissionRepo.findById.mockResolvedValue(mockMission);

      // When & Then
      await expect(ctx.service.reorderActions("mission1", actionOrders, "user2")).rejects.toThrow(
        "액션을 추가할 권한이 없습니다.",
      );

      try {
        await ctx.service.reorderActions("mission1", actionOrders, "user2");
      } catch (error) {
        expect(error instanceof Error && error.cause).toBe(403);
      }

      expect(ctx.mockActionRepo.findActionIdsByMissionId).not.toHaveBeenCalled();
      expect(ctx.mockActionRepo.updateManyOrders).not.toHaveBeenCalled();
    });

    it("해당 미션에 속하지 않는 액션이 포함되어 있으면 400 에러를 던진다", async () => {
      // Given
      const mockMission = mockMissionFactory();
      const actionOrders = [
        { id: "action1", order: 0 },
        { id: "action2", order: 1 },
        { id: "invalid-action", order: 2 },
      ];
      const missionActionIds = ["action1", "action2"];

      ctx.mockMissionRepo.findById.mockResolvedValue(mockMission);
      ctx.mockActionRepo.findActionIdsByMissionId.mockResolvedValue(missionActionIds);

      // When & Then
      await expect(ctx.service.reorderActions("mission1", actionOrders, "user1")).rejects.toThrow(
        "해당 미션에 속하지 않는 액션이 포함되어 있습니다.",
      );

      try {
        await ctx.service.reorderActions("mission1", actionOrders, "user1");
      } catch (error) {
        expect(error instanceof Error && error.cause).toBe(400);
      }

      expect(ctx.mockActionRepo.updateManyOrders).not.toHaveBeenCalled();
    });

    it("빈 배열로 순서 변경을 요청하면 성공한다", async () => {
      // Given
      const mockMission = mockMissionFactory();
      const actionOrders: Array<{ id: string; order: number }> = [];
      const missionActionIds = ["action1", "action2"];

      ctx.mockMissionRepo.findById.mockResolvedValue(mockMission);
      ctx.mockActionRepo.findActionIdsByMissionId.mockResolvedValue(missionActionIds);
      ctx.mockActionRepo.updateManyOrders.mockResolvedValue([]);

      // When
      const result = await ctx.service.reorderActions("mission1", actionOrders, "user1");

      // Then
      expect(result).toEqual({ success: true });
      expect(ctx.mockActionRepo.updateManyOrders).toHaveBeenCalledWith([]);
    });
  });
});
