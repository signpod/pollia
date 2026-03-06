import { toServerEditorDraftPayload } from "@/types/mission-editor-draft";
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
          "draft:comp1": {
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

    it("dirtyByItemKey가 없는 draft는 파싱에 실패한다", async () => {
      // Given - sanitize 전 형태에서 dirtyByItemKey만 빠진 경우
      const actionDraft = {
        draftItems: [],
        formSnapshotByItemKey: {},
        actionTypeByItemKey: {},
        itemOrderKeys: [],
      };
      const mockMission = mockMissionFactory({
        editorDraft: { action: actionDraft, completion: null },
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

  describe("sanitize 후 형태 호환성", () => {
    it("sanitizeActionSnapshotForServer 결과물은 정상 파싱된다", async () => {
      // Given - sanitize 후 형태 (dirtyByItemKey 포함)
      const actionDraft = {
        draftItems: [{ key: "q1" }],
        formSnapshotByItemKey: {
          "draft:q1": {
            actionType: ActionType.SUBJECTIVE,
            values: {
              title: "질문",
              isRequired: true,
            },
            nextLinkType: "action",
          },
        },
        actionTypeByItemKey: { "draft:q1": ActionType.SUBJECTIVE },
        dirtyByItemKey: { "draft:q1": true },
        itemOrderKeys: ["draft:q1"],
      };

      const mockMission = mockMissionFactory({
        editorDraft: { action: actionDraft, completion: null },
      });
      ctx.mockMissionRepo.findById.mockResolvedValue(mockMission);
      ctx.mockMissionRepo.update.mockResolvedValue(mockMission);

      const mockAction = createMockAction({ id: "real-1", type: ActionType.SUBJECTIVE });
      ctx.mockActionRepo.create.mockResolvedValue(mockAction);
      ctx.mockActionRepo.update.mockResolvedValue(mockAction);

      // When
      const result = await ctx.service.applyActionSectionDraft("mission1", "user1");

      // Then
      expect(result.createdActionIds).toEqual(["real-1"]);
    });

    it("draft action의 nextCompletionId가 생성된 실제 completion ID로 resolve된다", async () => {
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
              nextActionId: null,
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
          "draft:comp1": {
            title: "완료 화면",
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

      const mockCompletion = createMockMissionCompletion({ id: "real-comp-id" });
      ctx.mockCompletionRepo.create.mockResolvedValue(mockCompletion);

      const mockAction = createMockAction({ id: "real-action-id", type: ActionType.SUBJECTIVE });
      ctx.mockActionRepo.create.mockResolvedValue(mockAction);
      ctx.mockActionRepo.update.mockResolvedValue(mockAction);

      // When
      const result = await ctx.service.applyActionSectionDraft("mission1", "user1");

      // Then
      expect(result.createdCompletionIds).toEqual(["real-comp-id"]);
      expect(result.tempToRealCompletionIdMap).toEqual({
        "draft:completion:comp1": "real-comp-id",
      });

      const updateCalls = ctx.mockActionRepo.update.mock.calls;
      const fkUpdateCall = updateCalls.find(
        call => call[0] === "real-action-id" && call[1]?.nextCompletionId !== undefined,
      );
      expect(fkUpdateCall).toBeDefined();
      expect(fkUpdateCall![1]).toEqual(
        expect.objectContaining({
          nextCompletionId: "real-comp-id",
        }),
      );
    });

    it("branch action option의 nextCompletionId가 생성된 실제 completion ID로 resolve된다", async () => {
      // Given
      const actionDraft = {
        draftItems: [{ key: "b1" }],
        formSnapshotByItemKey: {
          "draft:b1": {
            actionType: ActionType.BRANCH,
            values: {
              title: "분기 질문",
              isRequired: true,
              hasOther: false,
              maxSelections: 1,
              nextActionId: null,
              nextCompletionId: null,
              options: [
                {
                  title: "옵션A",
                  order: 0,
                  nextActionId: null,
                  nextCompletionId: "draft:completion:comp1",
                },
                {
                  title: "옵션B",
                  order: 1,
                  nextActionId: null,
                  nextCompletionId: "draft:completion:comp2",
                },
              ],
            },
            nextLinkType: "completion",
          },
        },
        actionTypeByItemKey: { "draft:b1": ActionType.BRANCH },
        dirtyByItemKey: { "draft:b1": true },
        itemOrderKeys: ["draft:b1"],
      };

      const completionDraft = {
        draftItems: [
          { key: "comp1", title: "완료A" },
          { key: "comp2", title: "완료B" },
        ],
        formSnapshotByItemKey: {
          "draft:comp1": {
            title: "완료 화면 A",
            description: "A 설명",
            imageUrl: null,
            imageFileUploadId: null,
          },
          "draft:comp2": {
            title: "완료 화면 B",
            description: "B 설명",
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

      let compCreateCount = 0;
      ctx.mockCompletionRepo.create.mockImplementation(async () => {
        compCreateCount += 1;
        return createMockMissionCompletion({ id: `real-comp-${compCreateCount}` });
      });

      const mockAction = createMockAction({ id: "real-branch-id", type: ActionType.BRANCH });
      ctx.mockActionRepo.createMultipleChoice.mockResolvedValue(mockAction);
      ctx.mockActionRepo.updateWithOptions.mockResolvedValue(mockAction);

      // When
      const result = await ctx.service.applyActionSectionDraft("mission1", "user1");

      // Then
      expect(result.createdCompletionIds).toContain("real-comp-1");
      expect(result.createdCompletionIds).toContain("real-comp-2");

      const updateWithOptionsCalls = ctx.mockActionRepo.updateWithOptions.mock.calls;
      expect(updateWithOptionsCalls.length).toBeGreaterThanOrEqual(1);

      const branchUpdateCall = updateWithOptionsCalls.find(call => call[0] === "real-branch-id");
      expect(branchUpdateCall).toBeDefined();

      const resolvedOptions = branchUpdateCall![2] as Array<{
        nextCompletionId: string | null;
      }>;
      const resolvedCompletionIds = resolvedOptions.map(opt => opt.nextCompletionId);
      expect(resolvedCompletionIds).toContain("real-comp-1");
      expect(resolvedCompletionIds).toContain("real-comp-2");
    });

    it("기존+신규 completion 스냅샷이 섞여있어도 draft completion이 정상 생성되고 nextCompletionId가 resolve된다", async () => {
      // Given - 실제 프론트엔드: formSnapshotByItemKey에 existing과 draft 모두 포함
      const actionDraft = {
        draftItems: [{ key: "q1" }],
        formSnapshotByItemKey: {
          "draft:q1": {
            actionType: ActionType.SUBJECTIVE,
            values: {
              title: "질문",
              isRequired: true,
              nextCompletionId: "draft:completion:newcomp",
              nextActionId: null,
            },
            nextLinkType: "completion",
          },
        },
        actionTypeByItemKey: { "draft:q1": ActionType.SUBJECTIVE },
        dirtyByItemKey: { "draft:q1": true },
        itemOrderKeys: ["draft:q1"],
      };

      const completionDraft = {
        draftItems: [{ key: "newcomp", title: "신규 완료" }],
        formSnapshotByItemKey: {
          "existing:old-comp-id": {
            title: "기존 완료 화면",
            description: "<p>기존 설명</p>",
            imageUrl: "https://example.com/image.png",
            imageFileUploadId: "file-123",
          },
          "draft:newcomp": {
            title: "신규 완료 화면",
            description: "<p>신규 설명</p>",
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

      const mockCompletion = createMockMissionCompletion({ id: "real-newcomp" });
      ctx.mockCompletionRepo.create.mockResolvedValue(mockCompletion);

      const mockAction = createMockAction({ id: "real-q1", type: ActionType.SUBJECTIVE });
      ctx.mockActionRepo.create.mockResolvedValue(mockAction);
      ctx.mockActionRepo.update.mockResolvedValue(mockAction);

      // When
      const result = await ctx.service.applyActionSectionDraft("mission1", "user1");

      // Then - completion이 생성되고 action의 nextCompletionId가 resolve되어야 한다
      expect(result.createdCompletionIds).toEqual(["real-newcomp"]);
      expect(result.tempToRealCompletionIdMap).toEqual({
        "draft:completion:newcomp": "real-newcomp",
      });

      const updateCalls = ctx.mockActionRepo.update.mock.calls;
      const fkUpdateCall = updateCalls.find(
        call => call[0] === "real-q1" && call[1]?.nextCompletionId !== undefined,
      );
      expect(fkUpdateCall).toBeDefined();
      expect(fkUpdateCall![1]).toEqual(
        expect.objectContaining({ nextCompletionId: "real-newcomp" }),
      );
    });

    it("프론트엔드 이중 toServerEditorDraftPayload 변환을 거친 데이터에서도 completion이 생성되고 nextCompletionId가 resolve된다", async () => {
      // Given - 프론트엔드가 collectLocalDraftPayload로 수집한 원본 데이터
      const rawFrontendPayload = {
        basic: null,
        reward: null,
        action: {
          draftItems: [{ key: "q1" }],
          openItemKey: "draft:q1",
          dirtyByItemKey: { "draft:q1": true },
          actionTypeByItemKey: { "draft:q1": ActionType.SUBJECTIVE },
          formSnapshotByItemKey: {
            "draft:q1": {
              actionType: ActionType.SUBJECTIVE,
              values: {
                title: "질문",
                isRequired: true,
                nextCompletionId: "draft:completion:newcomp",
                nextActionId: null,
              },
              nextLinkType: "completion",
            },
          },
          itemOrderKeys: ["draft:q1"],
        },
        completion: {
          draftItems: [{ key: "newcomp", title: "신규 완료" }],
          openItemKey: "draft:newcomp",
          removedExistingIds: [],
          dirtyByItemKey: {},
          formSnapshotByItemKey: {
            "existing:old-comp": {
              title: "기존 완료",
              description: "<p>기존 설명</p>",
              imageUrl: null,
              imageFileUploadId: null,
            },
            "draft:newcomp": {
              title: "신규 완료 화면",
              description: "<p>설명</p>",
              imageUrl: null,
              imageFileUploadId: null,
            },
          },
        },
        meta: { updatedAtMs: Date.now() },
      };

      // 프론트엔드: toServerEditorDraftPayload (1차 변환)
      const frontendPayload = toServerEditorDraftPayload(rawFrontendPayload);
      // 서버 saveEditorDraft: toServerEditorDraftPayload (2차 변환)
      const serverStoredPayload = toServerEditorDraftPayload(frontendPayload);

      const mockMission = mockMissionFactory({
        editorDraft: serverStoredPayload,
      });
      ctx.mockMissionRepo.findById.mockResolvedValue(mockMission);
      ctx.mockMissionRepo.update.mockResolvedValue(mockMission);

      const mockCompletion = createMockMissionCompletion({ id: "real-newcomp" });
      ctx.mockCompletionRepo.create.mockResolvedValue(mockCompletion);

      const mockAction = createMockAction({ id: "real-q1", type: ActionType.SUBJECTIVE });
      ctx.mockActionRepo.create.mockResolvedValue(mockAction);
      ctx.mockActionRepo.update.mockResolvedValue(mockAction);

      // When
      const result = await ctx.service.applyActionSectionDraft("mission1", "user1");

      // Then
      expect(result.createdCompletionIds).toEqual(["real-newcomp"]);
      expect(result.tempToRealCompletionIdMap).toEqual({
        "draft:completion:newcomp": "real-newcomp",
      });

      const updateCalls = ctx.mockActionRepo.update.mock.calls;
      const fkUpdateCall = updateCalls.find(
        call => call[0] === "real-q1" && call[1]?.nextCompletionId !== undefined,
      );
      expect(fkUpdateCall).toBeDefined();
      expect(fkUpdateCall![1]).toEqual(
        expect.objectContaining({ nextCompletionId: "real-newcomp" }),
      );
    });

    it("completion formSnapshotByItemKey는 draft:${key} 형식으로 조회된다", async () => {
      // Given - 프론트엔드 실제 형태: completion snapshot 키가 "draft:comp1"
      const actionDraft = {
        draftItems: [{ key: "q1" }],
        formSnapshotByItemKey: {
          "draft:q1": {
            actionType: ActionType.SUBJECTIVE,
            values: { title: "질문", isRequired: true },
            nextLinkType: "action",
          },
        },
        actionTypeByItemKey: { "draft:q1": ActionType.SUBJECTIVE },
        dirtyByItemKey: { "draft:q1": true },
        itemOrderKeys: ["draft:q1"],
      };

      const completionDraft = {
        draftItems: [{ key: "c1", title: "완료" }],
        formSnapshotByItemKey: {
          "draft:c1": {
            title: "완료 화면",
            description: "설명",
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

      const mockCompletion = createMockMissionCompletion({ id: "real-c1" });
      ctx.mockCompletionRepo.create.mockResolvedValue(mockCompletion);

      const mockAction = createMockAction({ id: "real-q1", type: ActionType.SUBJECTIVE });
      ctx.mockActionRepo.create.mockResolvedValue(mockAction);
      ctx.mockActionRepo.update.mockResolvedValue(mockAction);

      // When
      const result = await ctx.service.applyActionSectionDraft("mission1", "user1");

      // Then - completion이 정상적으로 생성되어야 한다
      expect(result.createdCompletionIds).toEqual(["real-c1"]);
      expect(result.tempToRealCompletionIdMap).toEqual({
        "draft:completion:c1": "real-c1",
      });
    });
  });
});
