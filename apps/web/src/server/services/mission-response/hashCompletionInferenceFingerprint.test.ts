import { hashCompletionInferenceFingerprint } from "./hashCompletionInferenceFingerprint";

describe("hashCompletionInferenceFingerprint", () => {
  it("옵션 순서가 달라도 동일한 fingerprint를 만든다", () => {
    const left = hashCompletionInferenceFingerprint({
      keyAnswers: [{ actionId: "a1", type: "TAG", optionIds: ["opt-2", "opt-1"] }],
      contextSignaturePayload: [
        {
          actionId: "a1",
          actionType: "TAG",
          actionTitle: "성향",
          actionDescription: "태그 선택",
          selectedOptions: [
            { id: "opt-2", title: "외향형", description: null },
            { id: "opt-1", title: "분석형", description: null },
          ],
        },
      ],
      completionsSummaryForSignature: [{ id: "c1", title: "결과 A", description: "A desc" }],
    });

    const right = hashCompletionInferenceFingerprint({
      keyAnswers: [{ actionId: "a1", type: "TAG", optionIds: ["opt-1", "opt-2"] }],
      contextSignaturePayload: [
        {
          actionId: "a1",
          actionType: "TAG",
          actionTitle: "성향",
          actionDescription: "태그 선택",
          selectedOptions: [
            { id: "opt-1", title: "분석형", description: null },
            { id: "opt-2", title: "외향형", description: null },
          ],
        },
      ],
      completionsSummaryForSignature: [{ id: "c1", title: "결과 A", description: "A desc" }],
    });

    expect(left?.hash).toBe(right?.hash);
  });

  it("action/option/completion 텍스트 컨텍스트가 바뀌면 fingerprint도 바뀐다", () => {
    const base = hashCompletionInferenceFingerprint({
      keyAnswers: [{ actionId: "a1", type: "TAG", optionIds: ["opt-1"] }],
      contextSignaturePayload: [
        {
          actionId: "a1",
          actionType: "TAG",
          actionTitle: "성향",
          actionDescription: "태그 선택",
          selectedOptions: [{ id: "opt-1", title: "분석형", description: null }],
        },
      ],
      completionsSummaryForSignature: [{ id: "c1", title: "결과 A", description: "A desc" }],
    });

    const changedOptionTitle = hashCompletionInferenceFingerprint({
      keyAnswers: [{ actionId: "a1", type: "TAG", optionIds: ["opt-1"] }],
      contextSignaturePayload: [
        {
          actionId: "a1",
          actionType: "TAG",
          actionTitle: "성향",
          actionDescription: "태그 선택",
          selectedOptions: [{ id: "opt-1", title: "전략형", description: null }],
        },
      ],
      completionsSummaryForSignature: [{ id: "c1", title: "결과 A", description: "A desc" }],
    });

    const changedCompletionText = hashCompletionInferenceFingerprint({
      keyAnswers: [{ actionId: "a1", type: "TAG", optionIds: ["opt-1"] }],
      contextSignaturePayload: [
        {
          actionId: "a1",
          actionType: "TAG",
          actionTitle: "성향",
          actionDescription: "태그 선택",
          selectedOptions: [{ id: "opt-1", title: "분석형", description: null }],
        },
      ],
      completionsSummaryForSignature: [{ id: "c1", title: "결과 A+", description: "A desc" }],
    });

    expect(base?.hash).not.toBe(changedOptionTitle?.hash);
    expect(base?.hash).not.toBe(changedCompletionText?.hash);
  });
});
