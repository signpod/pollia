import { resolveEditorDesktopFlowPolicy } from "../editor-desktop-flow-policy";

const serverActions = [
  {
    id: "action-1",
    type: "SUBJECTIVE",
    title: "질문",
    nextActionId: null,
    nextCompletionId: null,
    options: [],
  },
];

const serverCompletions = [
  {
    id: "completion-1",
    title: "완료",
  },
];

describe("editor-desktop-flow-policy", () => {
  it("isActive=true이어도 draft snapshot이 있으면 반영한다", () => {
    const actionDraftSnapshot = { draftItems: [{ key: "draft-1" }] };
    const completionDraftSnapshot = { draftItems: [{ key: "draft-1", title: "임시 완료" }] };

    const resolved = resolveEditorDesktopFlowPolicy({
      isActive: true,
      entryActionId: "action-1",
      serverActions,
      serverCompletions,
      actionDraftSnapshot,
      completionDraftSnapshot,
    });

    expect(resolved.actionDraftSnapshot).toBe(actionDraftSnapshot);
    expect(resolved.completionDraftSnapshot).toBe(completionDraftSnapshot);
    expect(resolved.serverActions).toBe(serverActions);
    expect(resolved.serverCompletions).toBe(serverCompletions);
  });

  it("isActive=false이면 draft snapshot을 우선 사용한다", () => {
    const actionDraftSnapshot = { draftItems: [{ key: "draft-1" }] };
    const completionDraftSnapshot = { draftItems: [{ key: "draft-1", title: "임시 완료" }] };

    const resolved = resolveEditorDesktopFlowPolicy({
      isActive: false,
      entryActionId: "action-1",
      serverActions,
      serverCompletions,
      actionDraftSnapshot,
      completionDraftSnapshot,
    });

    expect(resolved.actionDraftSnapshot).toBe(actionDraftSnapshot);
    expect(resolved.completionDraftSnapshot).toBe(completionDraftSnapshot);
  });

  it("draft가 없으면 서버 데이터로 정상 폴백한다", () => {
    const resolved = resolveEditorDesktopFlowPolicy({
      isActive: false,
      entryActionId: "action-1",
      serverActions: null,
      serverCompletions: undefined,
    });

    expect(resolved.serverActions).toEqual([]);
    expect(resolved.serverCompletions).toEqual([]);
    expect(resolved.actionDraftSnapshot).toBeUndefined();
    expect(resolved.completionDraftSnapshot).toBeUndefined();
  });
});
