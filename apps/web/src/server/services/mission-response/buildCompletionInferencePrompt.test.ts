import { buildCompletionInferencePrompt } from "./buildCompletionInferencePrompt";
import type { CompletionInferenceInput } from "./completionInferenceTypes";

describe("buildCompletionInferencePrompt", () => {
  it("프롬프트에 completions, inferenceAnswers, 규칙 섹션을 포함한다", () => {
    const input: CompletionInferenceInput = {
      missionId: "mission-1",
      missionTitle: "성향 테스트",
      completions: [{ id: "c1", title: "결과 A", description: "A 설명" }],
      inferenceAnswers: [
        {
          actionId: "a1",
          actionType: "TAG",
          actionTitle: "성향 선택",
          actionDescription: "태그를 골라주세요",
          kind: "OPTION_SELECTION",
          selectedOptions: [{ id: "o1", title: "분석형", description: null }],
        },
      ],
    };

    const prompt = buildCompletionInferencePrompt(input);

    expect(prompt).toContain("completions:");
    expect(prompt).toContain("inferenceAnswers:");
    expect(prompt).toContain("규칙:");
    expect(prompt).toContain('{"result":"completion-id"}');
    expect(prompt).toContain("목록에 없는 id를 생성하지 않는다.");
  });
});
