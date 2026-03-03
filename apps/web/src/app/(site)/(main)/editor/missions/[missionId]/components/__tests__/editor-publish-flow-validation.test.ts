import { buildFlowOverviewSummary } from "../editor-flow-overview.utils";
import {
  analyzeEditorFlow,
  buildEditorFlowConnections,
  buildEditorFlowState,
  validateEditorPublishFlow,
} from "../editor-publish-flow-validation";

describe("editor-publish-flow-validation", () => {
  it("저장본 + draft를 합쳐 플로우 상태를 구성한다", () => {
    const state = buildEditorFlowState({
      entryActionId: "action-1",
      serverActions: [
        {
          id: "action-1",
          type: "SUBJECTIVE",
          title: "기존 액션",
          nextActionId: null,
          nextCompletionId: null,
          options: [],
        },
      ],
      serverCompletions: [{ id: "completion-1", title: "기존 완료" }],
      actionDraftSnapshot: {
        draftItems: [{ key: "draft-action" }],
        formSnapshotByItemKey: {
          "existing:action-1": {
            actionType: "SUBJECTIVE",
            values: {
              title: "기존 액션(수정)",
              nextActionId: null,
              nextCompletionId: "completion-1",
              options: [],
            },
          },
          "draft:draft-action": {
            actionType: "SUBJECTIVE",
            values: {
              title: "임시 액션",
              nextActionId: null,
              nextCompletionId: null,
              options: [],
            },
          },
        },
      },
      completionDraftSnapshot: {
        draftItems: [{ key: "draft-completion", title: "임시 완료" }],
        formSnapshotByItemKey: {
          "draft:draft-completion": {
            title: "임시 완료(수정)",
          },
        },
      },
    });

    expect(state.actions).toHaveLength(2);
    expect(state.completions).toHaveLength(2);
    expect(state.actions.find(action => action.id === "action-1")?.title).toBe("기존 액션(수정)");
    expect(
      state.completions.find(completion => completion.id.startsWith("draft:completion:"))?.title,
    ).toBe("임시 완료(수정)");

    const connections = buildEditorFlowConnections(state);
    expect(
      connections.some(
        connection => connection.source === "action-1" && connection.target === "completion-1",
      ),
    ).toBe(true);
  });

  it("기존 액션의 draft snapshot 링크가 저장본 링크를 override 한다", () => {
    const state = buildEditorFlowState({
      entryActionId: "action-1",
      serverActions: [
        {
          id: "action-1",
          type: "SUBJECTIVE",
          title: "액션 1",
          nextActionId: "action-2",
          nextCompletionId: null,
          options: [],
        },
        {
          id: "action-2",
          type: "SUBJECTIVE",
          title: "액션 2",
          nextActionId: null,
          nextCompletionId: null,
          options: [],
        },
      ],
      serverCompletions: [{ id: "completion-1", title: "완료" }],
      actionDraftSnapshot: {
        draftItems: [],
        formSnapshotByItemKey: {
          "existing:action-1": {
            actionType: "SUBJECTIVE",
            values: {
              title: "액션 1",
              nextActionId: null,
              nextCompletionId: "completion-1",
              options: [],
            },
          },
        },
      },
    });

    const connections = buildEditorFlowConnections(state);
    expect(
      connections.some(
        connection => connection.source === "action-1" && connection.target === "completion-1",
      ),
    ).toBe(true);
    expect(
      connections.some(
        connection => connection.source === "action-1" && connection.target === "action-2",
      ),
    ).toBe(false);
  });

  it("completion removedExistingIds가 적용되면 제거된 완료 화면은 상태에서 제외된다", () => {
    const state = buildEditorFlowState({
      entryActionId: "action-1",
      serverActions: [
        {
          id: "action-1",
          type: "SUBJECTIVE",
          title: "액션 1",
          nextActionId: null,
          nextCompletionId: "completion-1",
          options: [],
        },
      ],
      serverCompletions: [
        { id: "completion-1", title: "완료 1" },
        { id: "completion-2", title: "완료 2" },
      ],
      completionDraftSnapshot: {
        draftItems: [],
        removedExistingIds: ["completion-2"],
        formSnapshotByItemKey: {},
      },
    });

    expect(state.completions.map(completion => completion.id)).toEqual(["completion-1"]);
  });

  it("validate 결과와 모달 summary 카운트가 동일 기준으로 계산된다", () => {
    const input = {
      entryActionId: "action-1",
      serverActions: [
        {
          id: "action-1",
          type: "SUBJECTIVE",
          title: "시작 질문",
          nextActionId: null,
          nextCompletionId: null,
          options: [],
        },
        {
          id: "action-2",
          type: "SUBJECTIVE",
          title: "도달 불가 액션",
          nextActionId: null,
          nextCompletionId: null,
          options: [],
        },
      ],
      serverCompletions: [{ id: "completion-1", title: "도달 불가 완료" }],
    };

    const validation = validateEditorPublishFlow(input);
    const analysis = analyzeEditorFlow(input);
    const summary = buildFlowOverviewSummary(analysis);

    expect(validation.isValid).toBe(false);
    expect(summary.deadEndCount).toBe(
      validation.issues.filter(issue => issue.type === "dead-end").length,
    );
    expect(summary.unreachableCount).toBe(
      validation.issues.filter(issue => issue.type === "unreachable").length,
    );
    expect(summary.missingEntryCount).toBe(
      validation.issues.filter(issue => issue.type === "missing-entry").length,
    );
  });
});
