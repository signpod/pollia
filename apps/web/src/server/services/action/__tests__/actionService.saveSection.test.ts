import { ActionType } from "@prisma/client";
import {
  type ActionServiceTestContext,
  createActionServiceTestContext,
  createMockAction,
  createMockMission,
  createMockMissionCompletion,
  expectServiceErrorWithCause,
} from "../testUtils";
import type { SaveActionSectionInput } from "../types";

jest.mock("@/database/utils/prisma/client", () => ({
  __esModule: true,
  default: {
    $transaction: (fn: (tx: unknown) => Promise<unknown>) => fn({}),
  },
}));

describe("ActionService - saveActionSection", () => {
  let ctx: ActionServiceTestContext;

  beforeEach(() => {
    ctx = createActionServiceTestContext();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  const baseSectionInput = (
    overrides: Partial<SaveActionSectionInput> = {},
  ): SaveActionSectionInput => ({
    missionId: "mission1",
    completionsToCreate: [],
    actionsToCreate: [],
    actionsToUpdate: [],
    actionOrder: [],
    entryActionKey: null,
    ...overrides,
  });

  describe("권한 검증", () => {
    it("mission이 없으면 404 에러를 던진다", async () => {
      // Given
      ctx.mockMissionRepo.findById.mockResolvedValue(null);

      // When & Then
      await expectServiceErrorWithCause(
        ctx.service.saveActionSection(baseSectionInput(), "user1"),
        "존재하지 않는 미션입니다.",
        404,
      );
    });

    it("미션 소유자가 아니면 403 에러를 던진다", async () => {
      // Given
      const mockMission = createMockMission({ id: "mission1", creatorId: "owner" });
      ctx.mockMissionRepo.findById.mockResolvedValue(mockMission);

      // When & Then
      await expectServiceErrorWithCause(
        ctx.service.saveActionSection(baseSectionInput(), "other-user"),
        "액션을 추가할 권한이 없습니다.",
        403,
      );
    });
  });

  describe("completion 생성", () => {
    it("draft completion을 생성하고 tempId 매핑을 반환한다", async () => {
      // Given
      const mockMission = createMockMission();
      ctx.mockMissionRepo.findById.mockResolvedValue(mockMission);
      ctx.mockMissionRepo.update.mockResolvedValue(mockMission);

      const mockCompletion = createMockMissionCompletion({
        id: "real-completion-1",
        title: "완료!",
      });
      ctx.mockCompletionRepo.create.mockResolvedValue(mockCompletion);

      const input = baseSectionInput({
        completionsToCreate: [
          {
            tempId: "draft:completion:comp1",
            title: "완료!",
            description: "축하합니다",
            imageUrl: null,
            imageFileUploadId: null,
          },
        ],
      });

      // When
      const result = await ctx.service.saveActionSection(input, "user1");

      // Then
      expect(result.createdCompletionIds).toEqual(["real-completion-1"]);
      expect(result.tempToRealCompletionIdMap).toEqual({
        "draft:completion:comp1": "real-completion-1",
      });
      expect(ctx.mockCompletionRepo.create).toHaveBeenCalledWith(
        expect.objectContaining({
          missionId: "mission1",
          title: "완료!",
          description: "축하합니다",
        }),
        "user1",
        expect.anything(),
      );
    });
  });

  describe("action 생성", () => {
    it("옵션 없는 draft action을 생성한다", async () => {
      // Given
      const mockMission = createMockMission();
      ctx.mockMissionRepo.findById.mockResolvedValue(mockMission);
      ctx.mockMissionRepo.update.mockResolvedValue(mockMission);

      const mockCreatedAction = createMockAction({
        id: "real-action-1",
        title: "주관식 질문",
        type: ActionType.SUBJECTIVE,
      });
      ctx.mockActionRepo.create.mockResolvedValue(mockCreatedAction);

      const input = baseSectionInput({
        actionsToCreate: [
          {
            tempId: "draft:abc",
            actionType: ActionType.SUBJECTIVE,
            values: {
              title: "주관식 질문",
              description: null,
              imageUrl: null,
              imageFileUploadId: null,
              isRequired: true,
            },
          },
        ],
        actionOrder: ["draft:abc"],
        entryActionKey: "draft:abc",
      });

      // When
      const result = await ctx.service.saveActionSection(input, "user1");

      // Then
      expect(result.createdActionIds).toEqual(["real-action-1"]);
      expect(result.tempToRealActionIdMap).toEqual({
        "draft:abc": "real-action-1",
      });
      expect(ctx.mockActionRepo.create).toHaveBeenCalledWith(
        expect.objectContaining({
          missionId: "mission1",
          title: "주관식 질문",
          type: ActionType.SUBJECTIVE,
          isRequired: true,
        }),
        "user1",
        expect.anything(),
      );
    });

    it("옵션 있는 draft action을 createMultipleChoice로 생성한다", async () => {
      // Given
      const mockMission = createMockMission();
      ctx.mockMissionRepo.findById.mockResolvedValue(mockMission);
      ctx.mockMissionRepo.update.mockResolvedValue(mockMission);

      const mockCreatedAction = createMockAction({
        id: "real-action-mc",
        type: ActionType.MULTIPLE_CHOICE,
      });
      ctx.mockActionRepo.createMultipleChoice.mockResolvedValue(mockCreatedAction);

      const input = baseSectionInput({
        actionsToCreate: [
          {
            tempId: "draft:mc1",
            actionType: ActionType.MULTIPLE_CHOICE,
            values: {
              title: "좋아하는 색?",
              isRequired: true,
              maxSelections: 1,
              options: [
                { title: "빨강", order: 0 },
                { title: "파랑", order: 1 },
              ],
            },
          },
        ],
        actionOrder: ["draft:mc1"],
      });

      // When
      const result = await ctx.service.saveActionSection(input, "user1");

      // Then
      expect(result.createdActionIds).toEqual(["real-action-mc"]);
      expect(ctx.mockActionRepo.createMultipleChoice).toHaveBeenCalledWith(
        expect.objectContaining({
          missionId: "mission1",
          title: "좋아하는 색?",
          type: ActionType.MULTIPLE_CHOICE,
        }),
        expect.arrayContaining([
          expect.objectContaining({ title: "빨강", order: 0 }),
          expect.objectContaining({ title: "파랑", order: 1 }),
        ]),
        "user1",
        expect.anything(),
      );
    });

    it("옵션의 fileUploadId가 올바르게 전달된다", async () => {
      // Given
      const mockMission = createMockMission();
      ctx.mockMissionRepo.findById.mockResolvedValue(mockMission);
      ctx.mockMissionRepo.update.mockResolvedValue(mockMission);

      const mockCreatedAction = createMockAction({
        id: "real-action-mc",
        type: ActionType.MULTIPLE_CHOICE,
      });
      ctx.mockActionRepo.createMultipleChoice.mockResolvedValue(mockCreatedAction);

      const input = baseSectionInput({
        actionsToCreate: [
          {
            tempId: "draft:mc1",
            actionType: ActionType.MULTIPLE_CHOICE,
            values: {
              title: "사진 선택",
              isRequired: true,
              options: [
                { title: "A", order: 0, fileUploadId: "upload-001" },
                { title: "B", order: 1, fileUploadId: null },
              ],
            },
          },
        ],
        actionOrder: ["draft:mc1"],
      });

      // When
      await ctx.service.saveActionSection(input, "user1");

      // Then
      expect(ctx.mockActionRepo.createMultipleChoice).toHaveBeenCalledWith(
        expect.anything(),
        expect.arrayContaining([
          expect.objectContaining({ title: "A", order: 0, fileUploadId: "upload-001" }),
          expect.objectContaining({ title: "B", order: 1, fileUploadId: null }),
        ]),
        "user1",
        expect.anything(),
      );
    });
  });

  describe("action 업데이트", () => {
    it("기존 action을 업데이트한다", async () => {
      // Given
      const mockMission = createMockMission();
      ctx.mockMissionRepo.findById.mockResolvedValue(mockMission);
      ctx.mockMissionRepo.update.mockResolvedValue(mockMission);

      const existingAction = createMockAction({
        id: "existing-1",
        title: "기존 질문",
        type: ActionType.SUBJECTIVE,
      });
      ctx.mockActionRepo.findById.mockResolvedValue(existingAction);
      ctx.mockActionRepo.update.mockResolvedValue({
        ...existingAction,
        title: "수정된 질문",
      });

      const input = baseSectionInput({
        actionsToUpdate: [
          {
            actionId: "existing-1",
            actionType: ActionType.SUBJECTIVE,
            values: {
              title: "수정된 질문",
              isRequired: true,
            },
          },
        ],
        actionOrder: ["existing-1"],
      });

      // When
      const result = await ctx.service.saveActionSection(input, "user1");

      // Then
      expect(result.updatedActionIds).toEqual(["existing-1"]);
      expect(ctx.mockActionRepo.update).toHaveBeenCalledWith(
        "existing-1",
        expect.objectContaining({ title: "수정된 질문" }),
        "user1",
        expect.anything(),
      );
    });

    it("옵션 있는 기존 action을 updateWithOptions로 업데이트한다", async () => {
      // Given
      const mockMission = createMockMission();
      ctx.mockMissionRepo.findById.mockResolvedValue(mockMission);
      ctx.mockMissionRepo.update.mockResolvedValue(mockMission);

      const existingAction = createMockAction({
        id: "existing-mc",
        type: ActionType.MULTIPLE_CHOICE,
      });
      ctx.mockActionRepo.findById.mockResolvedValue(existingAction);
      ctx.mockActionRepo.updateWithOptions.mockResolvedValue(existingAction);

      const input = baseSectionInput({
        actionsToUpdate: [
          {
            actionId: "existing-mc",
            actionType: ActionType.MULTIPLE_CHOICE,
            values: {
              title: "수정된 선택지 질문",
              isRequired: true,
              options: [
                { id: "opt1", title: "A", order: 0 },
                { id: "opt2", title: "B", order: 1 },
              ],
            },
          },
        ],
        actionOrder: ["existing-mc"],
      });

      // When
      const result = await ctx.service.saveActionSection(input, "user1");

      // Then
      expect(result.updatedActionIds).toEqual(["existing-mc"]);
      expect(ctx.mockActionRepo.updateWithOptions).toHaveBeenCalled();
    });
  });

  describe("FK 참조 해소", () => {
    it("draft action의 nextActionId가 다른 draft action을 참조하면 실제 ID로 해소한다", async () => {
      // Given
      const mockMission = createMockMission();
      ctx.mockMissionRepo.findById.mockResolvedValue(mockMission);
      ctx.mockMissionRepo.update.mockResolvedValue(mockMission);

      const action1 = createMockAction({ id: "real-1", type: ActionType.SUBJECTIVE });
      const action2 = createMockAction({ id: "real-2", type: ActionType.SUBJECTIVE });
      ctx.mockActionRepo.create.mockResolvedValueOnce(action1).mockResolvedValueOnce(action2);
      ctx.mockActionRepo.update.mockResolvedValue(action1);

      const input = baseSectionInput({
        actionsToCreate: [
          {
            tempId: "draft:q1",
            actionType: ActionType.SUBJECTIVE,
            values: {
              title: "질문 1",
              isRequired: true,
              nextActionId: "draft:q2",
              nextCompletionId: null,
            },
          },
          {
            tempId: "draft:q2",
            actionType: ActionType.SUBJECTIVE,
            values: {
              title: "질문 2",
              isRequired: true,
            },
          },
        ],
        actionOrder: ["draft:q1", "draft:q2"],
        entryActionKey: "draft:q1",
      });

      // When
      const result = await ctx.service.saveActionSection(input, "user1");

      // Then
      expect(result.tempToRealActionIdMap).toEqual({
        "draft:q1": "real-1",
        "draft:q2": "real-2",
      });

      const updateCalls = ctx.mockActionRepo.update.mock.calls;
      const fkResolveCalls = updateCalls.filter(call => call[1]?.nextActionId === "real-2");
      expect(fkResolveCalls.length).toBeGreaterThanOrEqual(1);
    });

    it("draft action의 nextCompletionId가 draft completion을 참조하면 실제 ID로 해소한다", async () => {
      // Given
      const mockMission = createMockMission();
      ctx.mockMissionRepo.findById.mockResolvedValue(mockMission);
      ctx.mockMissionRepo.update.mockResolvedValue(mockMission);

      const mockCompletion = createMockMissionCompletion({ id: "real-comp-1" });
      ctx.mockCompletionRepo.create.mockResolvedValue(mockCompletion);

      const mockAction = createMockAction({ id: "real-action-1", type: ActionType.SUBJECTIVE });
      ctx.mockActionRepo.create.mockResolvedValue(mockAction);
      ctx.mockActionRepo.update.mockResolvedValue(mockAction);

      const input = baseSectionInput({
        completionsToCreate: [
          {
            tempId: "draft:completion:done",
            title: "완료",
            description: "완료입니다",
          },
        ],
        actionsToCreate: [
          {
            tempId: "draft:last",
            actionType: ActionType.SUBJECTIVE,
            values: {
              title: "마지막 질문",
              isRequired: true,
              nextCompletionId: "draft:completion:done",
            },
          },
        ],
        actionOrder: ["draft:last"],
        entryActionKey: "draft:last",
      });

      // When
      const result = await ctx.service.saveActionSection(input, "user1");

      // Then
      expect(result.tempToRealCompletionIdMap).toEqual({
        "draft:completion:done": "real-comp-1",
      });

      const updateCalls = ctx.mockActionRepo.update.mock.calls;
      const fkResolveCalls = updateCalls.filter(
        call => call[1]?.nextCompletionId === "real-comp-1",
      );
      expect(fkResolveCalls.length).toBeGreaterThanOrEqual(1);
    });

    it("기존 action의 nextActionId가 draft action을 참조하면 실제 ID로 해소한다", async () => {
      // Given
      const mockMission = createMockMission();
      ctx.mockMissionRepo.findById.mockResolvedValue(mockMission);
      ctx.mockMissionRepo.update.mockResolvedValue(mockMission);

      const existingAction = createMockAction({ id: "existing-1", type: ActionType.SUBJECTIVE });
      ctx.mockActionRepo.findById.mockResolvedValue(existingAction);
      ctx.mockActionRepo.update.mockResolvedValue(existingAction);

      const draftAction = createMockAction({ id: "real-new", type: ActionType.SUBJECTIVE });
      ctx.mockActionRepo.create.mockResolvedValue(draftAction);

      const input = baseSectionInput({
        actionsToCreate: [
          {
            tempId: "draft:new",
            actionType: ActionType.SUBJECTIVE,
            values: {
              title: "새 질문",
              isRequired: true,
            },
          },
        ],
        actionsToUpdate: [
          {
            actionId: "existing-1",
            actionType: ActionType.SUBJECTIVE,
            values: {
              title: "기존 질문",
              isRequired: true,
              nextActionId: "draft:new",
            },
          },
        ],
        actionOrder: ["existing-1", "draft:new"],
      });

      // When
      const result = await ctx.service.saveActionSection(input, "user1");

      // Then
      const updateCalls = ctx.mockActionRepo.update.mock.calls;
      const existingUpdateCall = updateCalls.find(call => call[0] === "existing-1");
      expect(existingUpdateCall).toBeDefined();
      expect(existingUpdateCall![1]).toEqual(expect.objectContaining({ nextActionId: "real-new" }));
    });

    it("branch option의 nextActionId를 실제 ID로 해소한다", async () => {
      // Given
      const mockMission = createMockMission();
      ctx.mockMissionRepo.findById.mockResolvedValue(mockMission);
      ctx.mockMissionRepo.update.mockResolvedValue(mockMission);

      const branchAction = createMockAction({ id: "real-branch", type: ActionType.BRANCH });
      const targetAction = createMockAction({ id: "real-target", type: ActionType.SUBJECTIVE });
      ctx.mockActionRepo.createMultipleChoice.mockResolvedValue(branchAction);
      ctx.mockActionRepo.create.mockResolvedValue(targetAction);
      ctx.mockActionRepo.update.mockResolvedValue(branchAction);
      ctx.mockActionRepo.updateWithOptions.mockResolvedValue(branchAction);

      const input = baseSectionInput({
        actionsToCreate: [
          {
            tempId: "draft:branch",
            actionType: ActionType.BRANCH,
            values: {
              title: "분기 질문",
              isRequired: true,
              options: [
                { title: "A", order: 0, nextActionId: "draft:target", nextCompletionId: null },
                { title: "B", order: 1, nextActionId: null, nextCompletionId: null },
              ],
            },
          },
          {
            tempId: "draft:target",
            actionType: ActionType.SUBJECTIVE,
            values: {
              title: "타겟 질문",
              isRequired: true,
            },
          },
        ],
        actionOrder: ["draft:branch", "draft:target"],
        entryActionKey: "draft:branch",
      });

      // When
      const result = await ctx.service.saveActionSection(input, "user1");

      // Then
      expect(result.createdActionIds).toContain("real-branch");
      expect(result.createdActionIds).toContain("real-target");
    });
  });

  describe("order 및 entryActionId", () => {
    it("actionOrder에 따라 순서를 설정한다", async () => {
      // Given
      const mockMission = createMockMission();
      ctx.mockMissionRepo.findById.mockResolvedValue(mockMission);
      ctx.mockMissionRepo.update.mockResolvedValue(mockMission);

      const action1 = createMockAction({ id: "real-1", type: ActionType.SUBJECTIVE });
      const action2 = createMockAction({ id: "real-2", type: ActionType.SUBJECTIVE });
      ctx.mockActionRepo.create.mockResolvedValueOnce(action1).mockResolvedValueOnce(action2);
      ctx.mockActionRepo.update.mockResolvedValue(action1);

      const input = baseSectionInput({
        actionsToCreate: [
          {
            tempId: "draft:a",
            actionType: ActionType.SUBJECTIVE,
            values: { title: "A", isRequired: true },
          },
          {
            tempId: "draft:b",
            actionType: ActionType.SUBJECTIVE,
            values: { title: "B", isRequired: true },
          },
        ],
        actionOrder: ["draft:b", "draft:a"],
      });

      // When
      await ctx.service.saveActionSection(input, "user1");

      // Then
      expect(ctx.mockActionRepo.updateOrder).toHaveBeenCalledWith("real-2", 0, expect.anything());
      expect(ctx.mockActionRepo.updateOrder).toHaveBeenCalledWith("real-1", 1, expect.anything());
    });

    it("entryActionKey가 draft ID면 실제 ID로 해소하여 mission을 업데이트한다", async () => {
      // Given
      const mockMission = createMockMission();
      ctx.mockMissionRepo.findById.mockResolvedValue(mockMission);
      ctx.mockMissionRepo.update.mockResolvedValue(mockMission);

      const action = createMockAction({ id: "real-entry", type: ActionType.SUBJECTIVE });
      ctx.mockActionRepo.create.mockResolvedValue(action);
      ctx.mockActionRepo.update.mockResolvedValue(action);

      const input = baseSectionInput({
        actionsToCreate: [
          {
            tempId: "draft:entry",
            actionType: ActionType.SUBJECTIVE,
            values: { title: "첫 질문", isRequired: true },
          },
        ],
        actionOrder: ["draft:entry"],
        entryActionKey: "draft:entry",
      });

      // When
      await ctx.service.saveActionSection(input, "user1");

      // Then
      expect(ctx.mockMissionRepo.update).toHaveBeenCalledWith(
        "mission1",
        expect.objectContaining({ entryActionId: "real-entry" }),
        "user1",
        expect.anything(),
      );
    });

    it("entryActionKey가 실제 ID면 그대로 mission을 업데이트한다", async () => {
      // Given
      const mockMission = createMockMission();
      ctx.mockMissionRepo.findById.mockResolvedValue(mockMission);
      ctx.mockMissionRepo.update.mockResolvedValue(mockMission);

      const input = baseSectionInput({
        actionOrder: ["existing-1"],
        entryActionKey: "existing-1",
      });

      // When
      await ctx.service.saveActionSection(input, "user1");

      // Then
      expect(ctx.mockMissionRepo.update).toHaveBeenCalledWith(
        "mission1",
        expect.objectContaining({ entryActionId: "existing-1" }),
        "user1",
        expect.anything(),
      );
    });
  });

  describe("혼합 시나리오", () => {
    it("draft action 생성 + 기존 action 업데이트를 동시에 처리한다", async () => {
      // Given
      const mockMission = createMockMission();
      ctx.mockMissionRepo.findById.mockResolvedValue(mockMission);
      ctx.mockMissionRepo.update.mockResolvedValue(mockMission);

      const newAction = createMockAction({ id: "real-new", type: ActionType.SUBJECTIVE });
      ctx.mockActionRepo.create.mockResolvedValue(newAction);

      const existingAction = createMockAction({ id: "existing-1", type: ActionType.SUBJECTIVE });
      ctx.mockActionRepo.findById.mockResolvedValue(existingAction);
      ctx.mockActionRepo.update.mockResolvedValue(existingAction);

      const input = baseSectionInput({
        actionsToCreate: [
          {
            tempId: "draft:new",
            actionType: ActionType.SUBJECTIVE,
            values: { title: "새 질문", isRequired: true },
          },
        ],
        actionsToUpdate: [
          {
            actionId: "existing-1",
            actionType: ActionType.SUBJECTIVE,
            values: { title: "수정 질문", isRequired: false },
          },
        ],
        actionOrder: ["existing-1", "draft:new"],
        entryActionKey: "existing-1",
      });

      // When
      const result = await ctx.service.saveActionSection(input, "user1");

      // Then
      expect(result.createdActionIds).toEqual(["real-new"]);
      expect(result.updatedActionIds).toEqual(["existing-1"]);
      expect(ctx.mockActionRepo.create).toHaveBeenCalledTimes(1);
      expect(ctx.mockActionRepo.update).toHaveBeenCalled();
    });

    it("빈 입력이면 아무것도 생성/수정하지 않는다", async () => {
      // Given
      const mockMission = createMockMission();
      ctx.mockMissionRepo.findById.mockResolvedValue(mockMission);
      ctx.mockMissionRepo.update.mockResolvedValue(mockMission);

      const input = baseSectionInput();

      // When
      const result = await ctx.service.saveActionSection(input, "user1");

      // Then
      expect(result.createdActionIds).toEqual([]);
      expect(result.updatedActionIds).toEqual([]);
      expect(result.createdCompletionIds).toEqual([]);
      expect(ctx.mockActionRepo.create).not.toHaveBeenCalled();
      expect(ctx.mockActionRepo.createMultipleChoice).not.toHaveBeenCalled();
      expect(ctx.mockCompletionRepo.create).not.toHaveBeenCalled();
    });
  });

  describe("미해결 temp ID 방어", () => {
    it("actionsToUpdate의 option이 존재하지 않는 draft action을 참조하면 nextActionId를 null로 처리한다", async () => {
      // Given
      const mockMission = createMockMission();
      ctx.mockMissionRepo.findById.mockResolvedValue(mockMission);
      ctx.mockMissionRepo.update.mockResolvedValue(mockMission);

      const existingAction = createMockAction({ id: "existing-1", type: ActionType.BRANCH });
      ctx.mockActionRepo.update.mockResolvedValue(existingAction);
      ctx.mockActionRepo.updateWithOptions.mockResolvedValue(existingAction);

      const input = baseSectionInput({
        actionsToUpdate: [
          {
            actionId: "existing-1",
            actionType: ActionType.BRANCH,
            values: {
              title: "분기 질문",
              isRequired: true,
              options: [
                { title: "A", order: 0, nextActionId: "draft:nonexistent", nextCompletionId: null },
                { title: "B", order: 1, nextActionId: null, nextCompletionId: null },
              ],
            },
          },
        ],
        actionOrder: ["existing-1"],
        entryActionKey: "existing-1",
      });

      // When
      await ctx.service.saveActionSection(input, "user1");

      // Then
      const updateCall = ctx.mockActionRepo.updateWithOptions.mock.calls[0];
      expect(updateCall).toBeDefined();
      const options = updateCall![2] as Array<{ nextActionId: string | null }>;
      expect(options[0]!.nextActionId).toBeNull();
    });

    it("actionsToUpdate의 nextActionId가 미해결 draft ID이면 null로 처리한다", async () => {
      // Given
      const mockMission = createMockMission();
      ctx.mockMissionRepo.findById.mockResolvedValue(mockMission);
      ctx.mockMissionRepo.update.mockResolvedValue(mockMission);

      const existingAction = createMockAction({ id: "existing-1", type: ActionType.SUBJECTIVE });
      ctx.mockActionRepo.update.mockResolvedValue(existingAction);

      const input = baseSectionInput({
        actionsToUpdate: [
          {
            actionId: "existing-1",
            actionType: ActionType.SUBJECTIVE,
            values: {
              title: "기존 질문",
              isRequired: true,
              nextActionId: "draft:deleted",
            },
          },
        ],
        actionOrder: ["existing-1"],
        entryActionKey: "existing-1",
      });

      // When
      await ctx.service.saveActionSection(input, "user1");

      // Then
      const updateCall = ctx.mockActionRepo.update.mock.calls.find(
        call => call[0] === "existing-1",
      );
      expect(updateCall).toBeDefined();
      expect(updateCall![1]).toEqual(expect.objectContaining({ nextActionId: null }));
    });

    it("actionOrder에 미해결 draft temp ID가 있으면 해당 항목을 skip한다", async () => {
      // Given
      const mockMission = createMockMission();
      ctx.mockMissionRepo.findById.mockResolvedValue(mockMission);
      ctx.mockMissionRepo.update.mockResolvedValue(mockMission);

      const input = baseSectionInput({
        actionOrder: ["existing-1", "draft:ghost", "existing-2"],
        entryActionKey: "existing-1",
      });

      // When
      await ctx.service.saveActionSection(input, "user1");

      // Then
      expect(ctx.mockActionRepo.updateOrder).toHaveBeenCalledWith(
        "existing-1",
        0,
        expect.anything(),
      );
      expect(ctx.mockActionRepo.updateOrder).toHaveBeenCalledWith(
        "existing-2",
        2,
        expect.anything(),
      );
      expect(ctx.mockActionRepo.updateOrder).toHaveBeenCalledTimes(2);
    });
  });
});
