import { hashStructuredAnswers } from "./hashStructuredAnswers";
import { normalizeStructuredAnswers } from "./normalizeStructuredAnswers";

describe("structured answer utils", () => {
  it("옵션 순서가 달라도 동일한 fingerprint를 만든다", () => {
    const left = hashStructuredAnswers([
      { actionId: "a1", type: "TAG", optionIds: ["opt-2", "opt-1"] },
    ]);
    const right = hashStructuredAnswers([
      { actionId: "a1", type: "TAG", optionIds: ["opt-1", "opt-2"] },
    ]);

    expect(left?.hash).toBe(right?.hash);
  });

  it("미디어/텍스트만 있으면 keyAnswers는 비어 있고 aiAnswers에는 미디어 요약만 남는다", () => {
    const { keyAnswers, aiAnswers } = normalizeStructuredAnswers([
      {
        actionId: "a-image",
        textAnswer: null,
        scaleAnswer: null,
        dateAnswers: [],
        options: [],
        fileUploads: [{ id: "f1" }, { id: "f2" }],
        action: { id: "a-image", order: 1, type: "IMAGE", title: "이미지", description: null },
      },
      {
        actionId: "a-text",
        textAnswer: null,
        scaleAnswer: null,
        dateAnswers: [],
        options: [],
        fileUploads: [],
        action: { id: "a-text", order: 2, type: "SUBJECTIVE", title: "소감", description: null },
      },
    ]);

    expect(keyAnswers).toEqual([]);
    expect(aiAnswers).toEqual([
      {
        actionId: "a-image",
        actionType: "IMAGE",
        actionTitle: "이미지",
        actionDescription: null,
        kind: "FILE_UPLOAD",
        fileCount: 2,
      },
    ]);
  });
});
