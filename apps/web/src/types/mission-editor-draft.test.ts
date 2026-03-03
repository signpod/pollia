import { toServerEditorDraftPayload } from "./mission-editor-draft";

describe("toServerEditorDraftPayload", () => {
  it("payload가 null/undefined면 모든 섹션을 null로 반환한다", () => {
    expect(toServerEditorDraftPayload(null)).toEqual({
      basic: null,
      reward: null,
      action: null,
      completion: null,
    });

    expect(toServerEditorDraftPayload(undefined)).toEqual({
      basic: null,
      reward: null,
      action: null,
      completion: null,
    });
  });

  it("reward의 Date 값을 ISO 문자열로 직렬화한다", () => {
    const scheduledDate = new Date("2026-03-01T12:00:00.000Z");
    const result = toServerEditorDraftPayload({
      reward: {
        hasReward: true,
        reward: {
          name: "리워드",
          scheduledDate,
        },
      },
    });

    expect(result.reward).toEqual({
      hasReward: true,
      reward: {
        name: "리워드",
        scheduledDate: "2026-03-01T12:00:00.000Z",
      },
    });
  });

  it("basic 중첩 객체/배열의 Date를 JSON-safe 값으로 변환한다", () => {
    const validDate = new Date("2026-04-02T00:00:00.000Z");
    const invalidDate = new Date("invalid-date");
    const result = toServerEditorDraftPayload({
      basic: {
        nested: {
          startAt: validDate,
          endAt: invalidDate,
        },
        timeline: [validDate, invalidDate],
      },
    });

    expect(result.basic).toEqual({
      nested: {
        startAt: "2026-04-02T00:00:00.000Z",
        endAt: null,
      },
      timeline: ["2026-04-02T00:00:00.000Z", null],
    });
  });

  it("action/completion sanitize를 유지하고 내부 값도 JSON-safe로 변환한다", () => {
    const actionDate = new Date("2026-01-01T00:00:00.000Z");
    const completionDate = new Date("2026-01-02T00:00:00.000Z");

    const result = toServerEditorDraftPayload({
      action: {
        draftItems: "not-array",
        itemOrderKeys: "not-array",
        actionTypeByItemKey: null,
        formSnapshotByItemKey: {
          "draft-1": {
            createdAt: actionDate,
            invalid: undefined,
          },
        },
      },
      completion: {
        draftItems: "not-array",
        formSnapshotByItemKey: {
          "completion-1": {
            publishedAt: completionDate,
          },
        },
      },
    });

    expect(result.action).toEqual({
      draftItems: [],
      itemOrderKeys: [],
      actionTypeByItemKey: {},
      formSnapshotByItemKey: {
        "draft-1": {
          createdAt: "2026-01-01T00:00:00.000Z",
        },
      },
    });
    expect(result.completion).toEqual({
      draftItems: [],
      formSnapshotByItemKey: {
        "completion-1": {
          publishedAt: "2026-01-02T00:00:00.000Z",
        },
      },
    });
  });

  it("객체의 비직렬화 속성은 제거하고 배열의 비직렬화 요소는 null로 변환한다", () => {
    const result = toServerEditorDraftPayload({
      basic: {
        keep: "ok",
        dropUndefined: undefined,
        dropFunction: () => "x",
        dropSymbol: Symbol("s"),
        dropBigInt: BigInt(1),
        nested: {
          keep: 1,
          dropUndefined: undefined,
        },
        items: [
          undefined,
          () => "x",
          Symbol("list"),
          BigInt(2),
          Number.NaN,
          Number.POSITIVE_INFINITY,
          Number.NEGATIVE_INFINITY,
          "value",
          42,
          true,
          null,
        ],
      },
    });

    expect(result.basic).toEqual({
      keep: "ok",
      nested: {
        keep: 1,
      },
      items: [null, null, null, null, null, null, null, "value", 42, true, null],
    });
  });

  it("순환 참조가 있어도 throw하지 않고 순환 노드를 null로 대체한다", () => {
    const cyclicObject: Record<string, unknown> = { name: "root" };
    cyclicObject.self = cyclicObject;

    const cyclicArray: unknown[] = [1];
    cyclicArray.push(cyclicArray);

    const result = toServerEditorDraftPayload({
      basic: {
        cyclicObject,
        cyclicArray,
      },
    });

    expect(() => JSON.stringify(result)).not.toThrow();
    expect(result.basic).toEqual({
      cyclicObject: {
        name: "root",
        self: null,
      },
      cyclicArray: [1, null],
    });
  });
});
