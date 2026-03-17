import {
  computePublishAvailability,
  resolveEntryActionIdForPublish,
} from "../editorMissionPublishModel";

describe("editorMissionPublishModel", () => {
  it("서버 데이터만으로 발행 가능 상태를 계산한다", () => {
    const result = computePublishAvailability({
      entryActionId: "action-1",
      serverActions: [
        {
          id: "action-1",
          type: "SUBJECTIVE",
          title: "질문 1",
          nextActionId: null,
          nextCompletionId: "completion-1",
          options: [],
        },
      ],
      serverCompletions: [{ id: "completion-1", title: "완료" }],
    });

    expect(result.canPublish).toBe(true);
    expect(result.issues).toHaveLength(0);
    expect(result.debug.entrySource).toBe("server");
  });

  it("entryActionId가 없어도 itemOrderKeys의 첫 액션을 entry로 해석한다", () => {
    const result = computePublishAvailability({
      entryActionId: null,
      serverActions: [
        {
          id: "action-1",
          type: "SUBJECTIVE",
          title: "질문 1",
          nextActionId: null,
          nextCompletionId: "completion-1",
          options: [],
        },
      ],
      serverCompletions: [{ id: "completion-1", title: "완료" }],
      actionDraftSnapshot: {
        draftItems: [],
        itemOrderKeys: ["existing:action-1"],
        formSnapshotByItemKey: {},
      },
    });

    expect(result.canPublish).toBe(true);
    expect(result.debug.entrySource).toBe("order");
    expect(result.debug.resolvedEntryActionId).toBe("action-1");
  });

  it("entryActionId와 itemOrderKeys가 모두 없으면 missing-entry로 차단한다", () => {
    const result = computePublishAvailability({
      entryActionId: null,
      serverActions: [
        {
          id: "action-1",
          type: "SUBJECTIVE",
          title: "질문 1",
          nextActionId: null,
          nextCompletionId: "completion-1",
          options: [],
        },
      ],
      serverCompletions: [{ id: "completion-1", title: "완료" }],
      actionDraftSnapshot: {
        draftItems: [],
        itemOrderKeys: [],
        formSnapshotByItemKey: {},
      },
    });

    expect(result.canPublish).toBe(false);
    expect(result.issues.some(issue => issue.type === "missing-entry")).toBe(true);
  });

  it("draft 액션이 첫 entry인 경우도 정상 해석한다", () => {
    const result = computePublishAvailability({
      entryActionId: null,
      serverActions: [],
      serverCompletions: [],
      actionDraftSnapshot: {
        draftItems: [{ key: "a-1" }],
        itemOrderKeys: ["draft:a-1"],
        formSnapshotByItemKey: {
          "draft:a-1": {
            actionType: "SUBJECTIVE",
            values: {
              title: "임시 질문",
              nextActionId: null,
              nextCompletionId: "draft:completion:c-1",
              options: [],
            },
          },
        },
      },
      completionDraftSnapshot: {
        draftItems: [{ key: "c-1", title: "임시 완료" }],
        formSnapshotByItemKey: {
          "draft:c-1": {
            title: "임시 완료",
          },
        },
      },
    });

    expect(result.canPublish).toBe(true);
    expect(result.debug.entrySource).toBe("order");
    expect(result.debug.resolvedEntryActionId).toBe("draft:a-1");
  });

  it("order entry 후보가 유효하지 않으면 서버 entry를 사용한다", () => {
    const resolved = resolveEntryActionIdForPublish({
      entryActionId: "action-1",
      serverActions: [
        {
          id: "action-1",
          type: "SUBJECTIVE",
          title: "질문 1",
          nextActionId: null,
          nextCompletionId: null,
          options: [],
        },
      ],
      actionDraftSnapshot: {
        draftItems: [],
        itemOrderKeys: ["existing:not-found"],
      },
    });

    expect(resolved.entryActionId).toBe("action-1");
    expect(resolved.source).toBe("server");
  });

  it("AI 완료화면 사용 시 completion 연결이 없어도 완료화면이 1개 이상이면 발행 가능하다", () => {
    const result = computePublishAvailability({
      entryActionId: "action-1",
      useAiCompletion: true,
      serverActions: [
        {
          id: "action-1",
          type: "SUBJECTIVE",
          title: "질문 1",
          nextActionId: null,
          nextCompletionId: null,
          options: [],
        },
      ],
      serverCompletions: [{ id: "completion-1", title: "완료" }],
    });

    expect(result.canPublish).toBe(true);
    expect(result.issues).toHaveLength(0);
  });

  it("AI 완료화면 사용 시 완료화면이 없으면 발행 불가하다", () => {
    const result = computePublishAvailability({
      entryActionId: "action-1",
      useAiCompletion: true,
      serverActions: [
        {
          id: "action-1",
          type: "SUBJECTIVE",
          title: "질문 1",
          nextActionId: null,
          nextCompletionId: null,
          options: [],
        },
      ],
      serverCompletions: [],
    });

    expect(result.canPublish).toBe(false);
    expect(result.blockingMessage).toBe(
      "AI 완료화면 사용 시 결과 화면을 최소 1개 이상 추가해야 합니다.",
    );
    expect(result.issues.some(issue => issue.type === "missing-completion")).toBe(true);
  });
});
