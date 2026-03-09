import { ActionType } from "@prisma/client";
import {
  type ActionServiceTestContext,
  createActionServiceTestContext,
  createMockAction,
  createMockActionWithOptions,
  createMockMission,
} from "../testUtils";

describe("ActionService - Connection Management", () => {
  let ctx: ActionServiceTestContext;

  beforeEach(() => {
    ctx = createActionServiceTestContext();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe("calculateReachableActionIds", () => {
    it("entryAction부터 시작하여 reachable한 액션들을 찾는다", async () => {
      const mockMission = createMockMission({
        id: "mission1",
        entryActionId: "action-a",
      });

      const mockActions = [
        createMockActionWithOptions({ id: "action-a", nextActionId: "action-b" }, []),
        createMockActionWithOptions({ id: "action-b", nextActionId: "action-c" }, []),
        createMockActionWithOptions({ id: "action-c", nextActionId: null }, []),
        createMockActionWithOptions({ id: "action-d", nextActionId: null }, []),
      ];

      ctx.mockMissionRepo.findById.mockResolvedValue(mockMission);
      ctx.mockActionRepo.findDetailsByMissionId.mockResolvedValue(mockActions);

      const reachable = await ctx.service.calculateReachableActionIds("mission1");

      expect(reachable).toEqual(["action-a", "action-b", "action-c"]);
      expect(reachable).not.toContain("action-d");
    });

    it("브랜치 액션의 모든 옵션을 따라간다", async () => {
      const mockMission = createMockMission({
        id: "mission1",
        entryActionId: "action-a",
      });

      const mockActions = [
        createMockActionWithOptions({ id: "action-a", nextActionId: "branch-1" }, []),
        createMockActionWithOptions({ id: "branch-1", type: ActionType.BRANCH }, [
          { id: "opt-1", nextActionId: "action-b1" },
          { id: "opt-2", nextActionId: "action-b2" },
        ]),
        createMockActionWithOptions({ id: "action-b1", nextActionId: "action-c" }, []),
        createMockActionWithOptions({ id: "action-b2", nextActionId: "action-c" }, []),
        createMockActionWithOptions({ id: "action-c", nextActionId: null }, []),
      ];

      ctx.mockMissionRepo.findById.mockResolvedValue(mockMission);
      ctx.mockActionRepo.findDetailsByMissionId.mockResolvedValue(mockActions);

      const reachable = await ctx.service.calculateReachableActionIds("mission1");

      expect(reachable).toEqual(["action-a", "branch-1", "action-b1", "action-b2", "action-c"]);
    });

    it("순환 참조가 있어도 무한루프에 빠지지 않는다", async () => {
      const mockMission = createMockMission({
        id: "mission1",
        entryActionId: "action-a",
      });

      const mockActions = [
        createMockActionWithOptions({ id: "action-a", nextActionId: "action-b" }, []),
        createMockActionWithOptions({ id: "action-b", nextActionId: "action-a" }, []),
      ];

      ctx.mockMissionRepo.findById.mockResolvedValue(mockMission);
      ctx.mockActionRepo.findDetailsByMissionId.mockResolvedValue(mockActions);

      const reachable = await ctx.service.calculateReachableActionIds("mission1");

      expect(reachable).toEqual(["action-a", "action-b"]);
      expect(reachable).toHaveLength(2);
    });

    it("entryActionId가 없으면 빈 배열을 반환한다", async () => {
      const mockMission = createMockMission({
        id: "mission1",
        entryActionId: null,
      });

      ctx.mockMissionRepo.findById.mockResolvedValue(mockMission);

      const reachable = await ctx.service.calculateReachableActionIds("mission1");

      expect(reachable).toEqual([]);
      expect(ctx.mockActionRepo.findDetailsByMissionId).not.toHaveBeenCalled();
    });
  });

  describe("disconnectActionWithCleanup", () => {
    it("액션 연결을 끊고 unreachable이 된 하위 액션들을 정리한다", async () => {
      const mockMission = createMockMission({
        id: "mission1",
        entryActionId: "action-a",
        creatorId: "user1",
      });

      const mockActionA = createMockAction({
        id: "action-a",
        missionId: "mission1",
        nextActionId: "action-b",
      });

      const mockAllActionsAfterDisconnect = [
        createMockActionWithOptions({ id: "action-a", nextActionId: null }, []),
        createMockActionWithOptions({ id: "action-b", nextActionId: "action-c" }, []),
        createMockActionWithOptions({ id: "action-c", nextActionId: null }, []),
      ];

      ctx.mockActionRepo.findById.mockResolvedValue(mockActionA);
      ctx.mockMissionRepo.findById.mockResolvedValue(mockMission);
      ctx.mockActionRepo.update.mockResolvedValue({
        ...mockActionA,
        nextActionId: null,
      });
      ctx.mockActionRepo.findDetailsByMissionId.mockResolvedValue(mockAllActionsAfterDisconnect);

      await ctx.service.disconnectActionWithCleanup("action-a", "mission1", "user1");

      expect(ctx.mockActionRepo.update).toHaveBeenCalledWith(
        "action-a",
        {
          nextActionId: null,
          nextCompletionId: null,
        },
        "user1",
      );

      expect(ctx.mockActionRepo.update).toHaveBeenCalledWith("action-b", {
        nextActionId: null,
        nextCompletionId: null,
      });

      expect(ctx.mockActionRepo.update).toHaveBeenCalledWith("action-c", {
        nextActionId: null,
        nextCompletionId: null,
      });

      expect(ctx.mockActionRepo.update).toHaveBeenCalledTimes(3);
    });

    it("브랜치 옵션의 하위 연결도 정리한다", async () => {
      const mockMission = createMockMission({
        id: "mission1",
        entryActionId: "action-a",
        creatorId: "user1",
      });

      const mockActionA = createMockAction({
        id: "action-a",
        missionId: "mission1",
        nextActionId: "branch-1",
      });

      const mockAllActionsAfterDisconnect = [
        createMockActionWithOptions({ id: "action-a", nextActionId: null }, []),
        createMockActionWithOptions({ id: "branch-1", type: ActionType.BRANCH }, [
          { id: "opt-1", nextActionId: "action-b" },
          { id: "opt-2", nextActionId: "action-c" },
        ]),
        createMockActionWithOptions({ id: "action-b", nextActionId: null }, []),
        createMockActionWithOptions({ id: "action-c", nextActionId: null }, []),
      ];

      ctx.mockActionRepo.findById.mockResolvedValue(mockActionA);
      ctx.mockMissionRepo.findById.mockResolvedValue(mockMission);
      ctx.mockActionRepo.update.mockResolvedValue({
        ...mockActionA,
        nextActionId: null,
      });
      ctx.mockActionRepo.findDetailsByMissionId.mockResolvedValue(mockAllActionsAfterDisconnect);

      await ctx.service.disconnectActionWithCleanup("action-a", "mission1", "user1");

      expect(ctx.mockActionRepo.updateWithOptions).toHaveBeenCalledWith(
        "branch-1",
        {},
        [
          expect.objectContaining({
            id: "opt-1",
            nextActionId: null,
            nextCompletionId: null,
          }),
          expect.objectContaining({
            id: "opt-2",
            nextActionId: null,
            nextCompletionId: null,
          }),
        ],
        "user1",
      );
    });

    it("reachable 액션은 정리하지 않는다", async () => {
      const mockMission = createMockMission({
        id: "mission1",
        entryActionId: "action-a",
        creatorId: "user1",
      });

      const mockActionB = createMockAction({
        id: "action-b",
        missionId: "mission1",
        nextActionId: "action-c",
      });

      const mockAllActionsAfterDisconnect = [
        createMockActionWithOptions({ id: "action-a", nextActionId: "action-d" }, []),
        createMockActionWithOptions({ id: "action-b", nextActionId: null }, []),
        createMockActionWithOptions({ id: "action-c", nextActionId: null }, []),
        createMockActionWithOptions({ id: "action-d", nextActionId: "action-b" }, []),
      ];

      ctx.mockActionRepo.findById.mockResolvedValue(mockActionB);
      ctx.mockMissionRepo.findById.mockResolvedValue(mockMission);
      ctx.mockActionRepo.update.mockResolvedValue({
        ...mockActionB,
        nextActionId: null,
      });
      ctx.mockActionRepo.findDetailsByMissionId.mockResolvedValue(mockAllActionsAfterDisconnect);

      await ctx.service.disconnectActionWithCleanup("action-b", "mission1", "user1");

      const updateCalls = (ctx.mockActionRepo.update as jest.Mock).mock.calls;
      const actionDUpdateCall = updateCalls.find((call: unknown[]) => call[0] === "action-d");
      const actionCUpdateCall = updateCalls.find((call: unknown[]) => call[0] === "action-c");

      expect(actionDUpdateCall).toBeUndefined();
      expect(actionCUpdateCall).toBeDefined();
    });

    it("액션이 존재하지 않으면 404 에러를 던진다", async () => {
      ctx.mockActionRepo.findById.mockResolvedValue(null);

      await expect(
        ctx.service.disconnectActionWithCleanup("invalid-id", "mission1", "user1"),
      ).rejects.toThrow("액션을 찾을 수 없습니다.");
    });

    it("권한이 없으면 403 에러를 던진다", async () => {
      const mockMission = createMockMission({
        id: "mission1",
        creatorId: "user2",
      });

      const mockAction = createMockAction({
        id: "action-a",
        missionId: "mission1",
      });

      ctx.mockActionRepo.findById.mockResolvedValue(mockAction);
      ctx.mockMissionRepo.findById.mockResolvedValue(mockMission);

      await expect(
        ctx.service.disconnectActionWithCleanup("action-a", "mission1", "user1"),
      ).rejects.toThrow("액션을 추가할 권한이 없습니다.");

      expect(ctx.mockActionRepo.update).not.toHaveBeenCalled();
    });
  });

  describe("disconnectBranchOptionWithCleanup", () => {
    it("브랜치 옵션 연결을 끊고 unreachable이 된 하위 액션들을 정리한다", async () => {
      const mockMission = createMockMission({
        id: "mission1",
        entryActionId: "action-a",
        creatorId: "user1",
      });

      const mockBranchAction = createMockActionWithOptions(
        {
          id: "branch-1",
          missionId: "mission1",
          type: ActionType.BRANCH,
        },
        [
          { id: "opt-1", nextActionId: "action-b" },
          { id: "opt-2", nextActionId: "action-c" },
        ],
      );

      const mockAllActionsAfterDisconnect = [
        createMockActionWithOptions({ id: "action-a", nextActionId: "branch-1" }, []),
        createMockActionWithOptions({ id: "branch-1", type: ActionType.BRANCH }, [
          { id: "opt-1", nextActionId: null },
          { id: "opt-2", nextActionId: "action-c" },
        ]),
        createMockActionWithOptions({ id: "action-b", nextActionId: "action-d" }, []),
        createMockActionWithOptions({ id: "action-c", nextActionId: null }, []),
        createMockActionWithOptions({ id: "action-d", nextActionId: null }, []),
      ];

      ctx.mockActionRepo.findByIdWithOptions.mockResolvedValue(mockBranchAction);
      ctx.mockMissionRepo.findById.mockResolvedValue(mockMission);
      ctx.mockActionRepo.updateWithOptions.mockResolvedValue(mockBranchAction);
      ctx.mockActionRepo.findDetailsByMissionId.mockResolvedValue(mockAllActionsAfterDisconnect);

      await ctx.service.disconnectBranchOptionWithCleanup("branch-1", "opt-1", "mission1", "user1");

      expect(ctx.mockActionRepo.updateWithOptions).toHaveBeenCalledWith(
        "branch-1",
        {},
        [
          expect.objectContaining({
            id: "opt-1",
            nextActionId: null,
            nextCompletionId: null,
          }),
          expect.objectContaining({
            id: "opt-2",
            nextActionId: "action-c",
            nextCompletionId: null,
          }),
        ],
        "user1",
      );

      expect(ctx.mockActionRepo.update).toHaveBeenCalledWith("action-b", {
        nextActionId: null,
        nextCompletionId: null,
      });

      expect(ctx.mockActionRepo.update).toHaveBeenCalledWith("action-d", {
        nextActionId: null,
        nextCompletionId: null,
      });
    });

    it("브랜치 액션이 존재하지 않으면 404 에러를 던진다", async () => {
      ctx.mockActionRepo.findByIdWithOptions.mockResolvedValue(null);

      await expect(
        ctx.service.disconnectBranchOptionWithCleanup("invalid-id", "opt-1", "mission1", "user1"),
      ).rejects.toThrow("액션을 찾을 수 없습니다.");
    });

    it("권한이 없으면 403 에러를 던진다", async () => {
      const mockMission = createMockMission({
        id: "mission1",
        creatorId: "user2",
      });

      const mockBranchAction = createMockActionWithOptions(
        {
          id: "branch-1",
          missionId: "mission1",
          type: ActionType.BRANCH,
        },
        [{ id: "opt-1", nextActionId: null }],
      );

      ctx.mockActionRepo.findByIdWithOptions.mockResolvedValue(mockBranchAction);
      ctx.mockMissionRepo.findById.mockResolvedValue(mockMission);

      await expect(
        ctx.service.disconnectBranchOptionWithCleanup("branch-1", "opt-1", "mission1", "user1"),
      ).rejects.toThrow("액션을 추가할 권한이 없습니다.");

      expect(ctx.mockActionRepo.updateWithOptions).not.toHaveBeenCalled();
    });
  });

  describe("connectAction", () => {
    it("단순히 액션을 연결한다 (cleanup 없음)", async () => {
      const mockMission = createMockMission({
        id: "mission1",
        creatorId: "user1",
      });

      const mockActionA = createMockAction({
        id: "action-a",
        missionId: "mission1",
        nextActionId: null,
      });

      ctx.mockActionRepo.findById.mockResolvedValue(mockActionA);
      ctx.mockMissionRepo.findById.mockResolvedValue(mockMission);
      ctx.mockActionRepo.update.mockResolvedValue({
        ...mockActionA,
        nextActionId: "action-c",
      });

      await ctx.service.connectAction("action-a", "action-c", false, "mission1", "user1");

      expect(ctx.mockActionRepo.update).toHaveBeenCalledWith(
        "action-a",
        {
          nextActionId: "action-c",
          nextCompletionId: null,
        },
        "user1",
      );

      expect(ctx.mockActionRepo.update).toHaveBeenCalledTimes(1);
      expect(ctx.mockActionRepo.findDetailsByMissionId).not.toHaveBeenCalled();
    });

    it("Completion 연결도 지원한다", async () => {
      const mockMission = createMockMission({
        id: "mission1",
        creatorId: "user1",
      });

      const mockActionA = createMockAction({
        id: "action-a",
        missionId: "mission1",
        nextActionId: null,
      });

      ctx.mockActionRepo.findById.mockResolvedValue(mockActionA);
      ctx.mockMissionRepo.findById.mockResolvedValue(mockMission);
      ctx.mockActionRepo.update.mockResolvedValue({
        ...mockActionA,
        nextCompletionId: "completion-1",
      });

      await ctx.service.connectAction("action-a", "completion-1", true, "mission1", "user1");

      expect(ctx.mockActionRepo.update).toHaveBeenCalledWith(
        "action-a",
        {
          nextActionId: null,
          nextCompletionId: "completion-1",
        },
        "user1",
      );
    });
  });

  describe("connectBranchOption", () => {
    it("단순히 브랜치 옵션을 연결한다 (cleanup 없음)", async () => {
      const mockMission = createMockMission({
        id: "mission1",
        creatorId: "user1",
      });

      const mockBranchAction = createMockActionWithOptions(
        {
          id: "branch-1",
          missionId: "mission1",
          type: ActionType.BRANCH,
        },
        [
          { id: "opt-1", nextActionId: null },
          { id: "opt-2", nextActionId: null },
        ],
      );

      ctx.mockActionRepo.findByIdWithOptions.mockResolvedValue(mockBranchAction);
      ctx.mockMissionRepo.findById.mockResolvedValue(mockMission);
      ctx.mockActionRepo.updateWithOptions.mockResolvedValue(mockBranchAction);

      await ctx.service.connectBranchOption(
        "branch-1",
        "opt-1",
        "action-c",
        false,
        "mission1",
        "user1",
      );

      expect(ctx.mockActionRepo.updateWithOptions).toHaveBeenCalledWith(
        "branch-1",
        {},
        [
          expect.objectContaining({
            id: "opt-1",
            nextActionId: "action-c",
            nextCompletionId: null,
          }),
          expect.objectContaining({
            id: "opt-2",
            nextActionId: null,
            nextCompletionId: null,
          }),
        ],
        "user1",
      );

      expect(ctx.mockActionRepo.updateWithOptions).toHaveBeenCalledTimes(1);
      expect(ctx.mockActionRepo.findDetailsByMissionId).not.toHaveBeenCalled();
    });
  });
});
