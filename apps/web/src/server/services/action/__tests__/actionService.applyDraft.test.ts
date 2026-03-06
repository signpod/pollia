import { ActionType } from "@prisma/client";
import {
  type ActionServiceTestContext,
  createActionServiceTestContext,
  createMockAction,
  createMockMissionCompletion,
  expectServiceErrorWithCause,
  mockMissionFactory,
} from "../testUtils";

jest.mock("@/database/utils/prisma/client", () => ({
  __esModule: true,
  default: {
    $transaction: (fn: (tx: unknown) => Promise<unknown>) => fn({}),
  },
}));

describe("ActionService - applyActionSectionDraft", () => {
  let ctx: ActionServiceTestContext;

  beforeEach(() => {
    ctx = createActionServiceTestContext();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe("권한 검증", () => {
    it("mission이 없으면 404 에러를 던진다", async () => {
      // Given
      ctx.mockMissionRepo.findById.mockResolvedValue(null);

      // When & Then
      await expectServiceErrorWithCause(
        ctx.service.applyActionSectionDraft("mission1", "user1"),
        "존재하지 않는 미션입니다.",
        404,
      );
    });

    it("미션 소유자가 아니면 403 에러를 던진다", async () => {
      // Given
      const mockMission = mockMissionFactory({ id: "mission1", creatorId: "owner" });
      ctx.mockMissionRepo.findById.mockResolvedValue(mockMission);

      // When & Then
      await expectServiceErrorWithCause(
        ctx.service.applyActionSectionDraft("mission1", "other-user"),
        "액션을 추가할 권한이 없습니다.",
        403,
      );
    });
  });

  describe("draft 없음", () => {
    it("editorDraft가 null이면 400 에러를 던진다", async () => {
      // Given
      const mockMission = mockMissionFactory({ editorDraft: null });
      ctx.mockMissionRepo.findById.mockResolvedValue(mockMission);

      // When & Then
      await expectServiceErrorWithCause(
        ctx.service.applyActionSectionDraft("mission1", "user1"),
        "적용할 draft가 없습니다.",
        400,
      );
    });

    it("editorDraft의 action 섹션이 null이면 빈 결과를 반환한다", async () => {
      // Given
      const mockMission = mockMissionFactory({
        editorDraft: { basic: null, reward: null, action: null, completion: null },
      });
      ctx.mockMissionRepo.findById.mockResolvedValue(mockMission);
      ctx.mockMissionRepo.update.mockResolvedValue(mockMission);

      // When
      const result = await ctx.service.applyActionSectionDraft("mission1", "user1");

      // Then
      expect(result.createdActionIds).toEqual([]);
      expect(result.updatedActionIds).toEqual([]);
      expect(result.createdCompletionIds).toEqual([]);
    });
  });

  describe("draft 파싱 후 saveActionSection 호출", () => {
    it("draft에서 새 action을 파싱하여 생성한다", async () => {
      // Given
      const actionDraft = {
        draftItems: [{ key: "abc" }],
        formSnapshotByItemKey: {
          "draft:abc": {
            actionType: ActionType.SUBJECTIVE,
            values: {
              title: "새 질문",
              description: null,
              imageUrl: null,
              imageFileUploadId: null,
              isRequired: true,
            },
            nextLinkType: "action",
          },
        },
        actionTypeByItemKey: { "draft:abc": ActionType.SUBJECTIVE },
        dirtyByItemKey: { "draft:abc": true },
        itemOrderKeys: ["draft:abc"],
      };

      const mockMission = mockMissionFactory({
        editorDraft: { action: actionDraft, completion: null },
      });
      ctx.mockMissionRepo.findById.mockResolvedValue(mockMission);
      ctx.mockMissionRepo.update.mockResolvedValue(mockMission);

      const mockCreatedAction = createMockAction({
        id: "real-action-1",
        type: ActionType.SUBJECTIVE,
      });
      ctx.mockActionRepo.create.mockResolvedValue(mockCreatedAction);
      ctx.mockActionRepo.update.mockResolvedValue(mockCreatedAction);

      // When
      const result = await ctx.service.applyActionSectionDraft("mission1", "user1");

      // Then
      expect(result.createdActionIds).toEqual(["real-action-1"]);
      expect(ctx.mockActionRepo.create).toHaveBeenCalledWith(
        expect.objectContaining({
          missionId: "mission1",
          title: "새 질문",
          type: ActionType.SUBJECTIVE,
        }),
        "user1",
        expect.anything(),
      );
    });

    it("dirty인 기존 action만 업데이트한다", async () => {
      // Given
      const actionDraft = {
        draftItems: [],
        formSnapshotByItemKey: {
          "existing:action1": {
            actionType: ActionType.SUBJECTIVE,
            values: {
              title: "수정된 질문",
              description: null,
              imageUrl: null,
              imageFileUploadId: null,
              isRequired: true,
            },
            nextLinkType: "action",
          },
          "existing:action2": {
            actionType: ActionType.SUBJECTIVE,
            values: {
              title: "변경 없음",
              description: null,
              imageUrl: null,
              imageFileUploadId: null,
              isRequired: true,
            },
            nextLinkType: "action",
          },
        },
        actionTypeByItemKey: {
          "existing:action1": ActionType.SUBJECTIVE,
          "existing:action2": ActionType.SUBJECTIVE,
        },
        dirtyByItemKey: {
          "existing:action1": true,
          "existing:action2": false,
        },
        itemOrderKeys: ["existing:action1", "existing:action2"],
      };

      const mockMission = mockMissionFactory({
        editorDraft: { action: actionDraft, completion: null },
      });
      ctx.mockMissionRepo.findById.mockResolvedValue(mockMission);
      ctx.mockMissionRepo.update.mockResolvedValue(mockMission);

      const existingAction = createMockAction({ id: "action1" });
      ctx.mockActionRepo.findById.mockResolvedValue(existingAction);
      ctx.mockActionRepo.update.mockResolvedValue(existingAction);

      // When
      const result = await ctx.service.applyActionSectionDraft("mission1", "user1");

      // Then
      expect(result.updatedActionIds).toEqual(["action1"]);
    });

    it("completion draft도 함께 파싱하여 completionsToCreate를 구성한다", async () => {
      // Given
      const actionDraft = {
        draftItems: [{ key: "q1" }],
        formSnapshotByItemKey: {
          "draft:q1": {
            actionType: ActionType.SUBJECTIVE,
            values: {
              title: "질문",
              isRequired: true,
              nextCompletionId: "draft:completion:comp1",
            },
            nextLinkType: "completion",
          },
        },
        actionTypeByItemKey: { "draft:q1": ActionType.SUBJECTIVE },
        dirtyByItemKey: { "draft:q1": true },
        itemOrderKeys: ["draft:q1"],
      };

      const completionDraft = {
        draftItems: [{ key: "comp1", title: "완료" }],
        formSnapshotByItemKey: {
          "draft:completion:comp1": {
            title: "미션 완료!",
            description: "축하합니다",
            imageUrl: null,
            imageFileUploadId: null,
          },
        },
      };

      const mockMission = mockMissionFactory({
        editorDraft: { action: actionDraft, completion: completionDraft },
      });
      ctx.mockMissionRepo.findById.mockResolvedValue(mockMission);
      ctx.mockMissionRepo.update.mockResolvedValue(mockMission);

      const mockCompletion = createMockMissionCompletion({ id: "real-comp" });
      ctx.mockCompletionRepo.create.mockResolvedValue(mockCompletion);

      const mockAction = createMockAction({ id: "real-q1", type: ActionType.SUBJECTIVE });
      ctx.mockActionRepo.create.mockResolvedValue(mockAction);
      ctx.mockActionRepo.update.mockResolvedValue(mockAction);

      // When
      const result = await ctx.service.applyActionSectionDraft("mission1", "user1");

      // Then
      expect(result.createdCompletionIds).toEqual(["real-comp"]);
      expect(ctx.mockCompletionRepo.create).toHaveBeenCalledWith(
        expect.objectContaining({
          missionId: "mission1",
          title: "미션 완료!",
          description: "축하합니다",
        }),
        "user1",
        expect.anything(),
      );
    });

    it("draft 적용 후 editorDraft의 action/completion 섹션을 클리어한다", async () => {
      // Given
      const actionDraft = {
        draftItems: [],
        formSnapshotByItemKey: {},
        actionTypeByItemKey: {},
        dirtyByItemKey: {},
        itemOrderKeys: [],
      };

      const mockMission = mockMissionFactory({
        editorDraft: {
          basic: { title: "제목" },
          reward: { points: 100 },
          action: actionDraft,
          completion: null,
        },
      });
      ctx.mockMissionRepo.findById.mockResolvedValue(mockMission);
      ctx.mockMissionRepo.update.mockResolvedValue(mockMission);

      // When
      await ctx.service.applyActionSectionDraft("mission1", "user1");

      // Then
      const updateCalls = ctx.mockMissionRepo.update.mock.calls;
      const draftClearCall = updateCalls.find(
        call => call[1] && typeof call[1] === "object" && "editorDraft" in call[1],
      );
      expect(draftClearCall).toBeDefined();
      const draftValue = (draftClearCall![1] as Record<string, unknown>).editorDraft;
      expect(draftValue).toEqual(
        expect.objectContaining({
          basic: { title: "제목" },
          reward: { points: 100 },
          action: null,
          completion: null,
        }),
      );
    });
  });

  describe("draft 파싱 실패", () => {
    it("action draft가 유효하지 않은 형태이면 400 에러를 던진다", async () => {
      // Given
      const mockMission = mockMissionFactory({
        editorDraft: { action: "invalid-not-an-object", completion: null },
      });
      ctx.mockMissionRepo.findById.mockResolvedValue(mockMission);

      // When & Then
      await expectServiceErrorWithCause(
        ctx.service.applyActionSectionDraft("mission1", "user1"),
        "action draft 파싱에 실패했습니다.",
        400,
      );
    });
  });
});
