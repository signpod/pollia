import { ActionType } from "@prisma/client";
import {
  actionSectionDraftSnapshotSchema,
  completionSectionDraftSnapshotSchema,
} from "../actionSectionDraftSchema";

describe("actionSectionDraftSnapshotSchema", () => {
  it("유효한 action 섹션 draft를 파싱한다", () => {
    // Given
    const input = {
      draftItems: [{ key: "abc123" }],
      formSnapshotByItemKey: {
        "draft:abc123": {
          actionType: ActionType.MULTIPLE_CHOICE,
          values: {
            title: "좋아하는 색은?",
            description: null,
            imageUrl: null,
            imageFileUploadId: null,
            isRequired: true,
            maxSelections: 1,
            options: [
              {
                title: "빨강",
                order: 0,
                nextActionId: null,
                nextCompletionId: null,
              },
            ],
            nextActionId: null,
            nextCompletionId: null,
          },
          nextLinkType: "action",
        },
      },
      actionTypeByItemKey: {
        "draft:abc123": ActionType.MULTIPLE_CHOICE,
      },
      dirtyByItemKey: {
        "draft:abc123": true,
      },
      itemOrderKeys: ["existing:action1", "draft:abc123"],
    };

    // When
    const result = actionSectionDraftSnapshotSchema.safeParse(input);

    // Then
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.draftItems).toHaveLength(1);
      expect(result.data.draftItems[0].key).toBe("abc123");
      expect(result.data.itemOrderKeys).toEqual(["existing:action1", "draft:abc123"]);
    }
  });

  it("itemOrderKeys가 없어도 파싱에 성공한다", () => {
    // Given
    const input = {
      draftItems: [],
      formSnapshotByItemKey: {},
      actionTypeByItemKey: {},
      dirtyByItemKey: {},
    };

    // When
    const result = actionSectionDraftSnapshotSchema.safeParse(input);

    // Then
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.itemOrderKeys).toBeUndefined();
    }
  });

  it("option에 FK 참조가 포함된 draft를 파싱한다", () => {
    // Given
    const input = {
      draftItems: [{ key: "branch1" }],
      formSnapshotByItemKey: {
        "draft:branch1": {
          actionType: ActionType.BRANCH,
          values: {
            title: "분기 질문",
            isRequired: true,
            options: [
              {
                title: "옵션 A",
                order: 0,
                nextActionId: "draft:next1",
                nextCompletionId: null,
              },
              {
                title: "옵션 B",
                order: 1,
                nextActionId: null,
                nextCompletionId: "draft:completion:done",
              },
            ],
          },
          nextLinkType: "action",
        },
      },
      actionTypeByItemKey: { "draft:branch1": ActionType.BRANCH },
      dirtyByItemKey: { "draft:branch1": true },
    };

    // When
    const result = actionSectionDraftSnapshotSchema.safeParse(input);

    // Then
    expect(result.success).toBe(true);
    if (result.success) {
      const snapshot = result.data.formSnapshotByItemKey["draft:branch1"];
      expect(snapshot.values.options?.[0].nextActionId).toBe("draft:next1");
      expect(snapshot.values.options?.[1].nextCompletionId).toBe("draft:completion:done");
    }
  });

  it("잘못된 actionType이면 파싱에 실패한다", () => {
    // Given
    const input = {
      draftItems: [],
      formSnapshotByItemKey: {
        "draft:x": {
          actionType: "INVALID_TYPE",
          values: { title: "test", isRequired: true },
          nextLinkType: "action",
        },
      },
      actionTypeByItemKey: {},
      dirtyByItemKey: {},
    };

    // When
    const result = actionSectionDraftSnapshotSchema.safeParse(input);

    // Then
    expect(result.success).toBe(false);
  });

  it("필수 필드가 누락되면 파싱에 실패한다", () => {
    // Given
    const input = {
      draftItems: [{ key: "abc" }],
    };

    // When
    const result = actionSectionDraftSnapshotSchema.safeParse(input);

    // Then
    expect(result.success).toBe(false);
  });
});

describe("completionSectionDraftSnapshotSchema", () => {
  it("유효한 completion 섹션 draft를 파싱한다", () => {
    // Given
    const input = {
      draftItems: [{ key: "comp1", title: "성공!" }],
      formSnapshotByItemKey: {
        "draft:completion:comp1": {
          title: "미션 완료!",
          description: "축하합니다!",
          imageUrl: null,
          imageFileUploadId: null,
        },
      },
    };

    // When
    const result = completionSectionDraftSnapshotSchema.safeParse(input);

    // Then
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.draftItems).toHaveLength(1);
      expect(result.data.draftItems[0].title).toBe("성공!");
      const snapshot = result.data.formSnapshotByItemKey["draft:completion:comp1"];
      expect(snapshot.title).toBe("미션 완료!");
    }
  });

  it("빈 completion draft를 파싱한다", () => {
    // Given
    const input = {
      draftItems: [],
      formSnapshotByItemKey: {},
    };

    // When
    const result = completionSectionDraftSnapshotSchema.safeParse(input);

    // Then
    expect(result.success).toBe(true);
  });

  it("필수 필드가 누락되면 파싱에 실패한다", () => {
    // Given
    const input = {
      draftItems: [{ key: "comp1" }],
      formSnapshotByItemKey: {},
    };

    // When
    const result = completionSectionDraftSnapshotSchema.safeParse(input);

    // Then
    expect(result.success).toBe(false);
  });
});
