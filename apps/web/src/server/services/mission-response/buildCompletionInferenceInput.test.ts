import { ActionType } from "@prisma/client";
import { buildCompletionInferenceInput } from "./buildCompletionInferenceInput";
import type { CompletionInferenceRawAnswer } from "./completionInferenceTypes";

function createAnswer(
  overrides: Partial<CompletionInferenceRawAnswer>,
): CompletionInferenceRawAnswer {
  return {
    actionId: "action-1",
    textAnswer: null,
    scaleAnswer: null,
    dateAnswers: [],
    options: [],
    fileUploads: [],
    action: {
      id: "action-1",
      order: 1,
      type: ActionType.TAG,
      title: "선호 태그",
      description: "가장 선호하는 태그를 선택해주세요",
      nextCompletionId: null,
    },
    ...overrides,
  };
}

describe("buildCompletionInferenceInput", () => {
  it("선택 옵션의 텍스트 컨텍스트를 inferenceAnswers에 포함하고 keyAnswers는 최소 신호만 유지한다", () => {
    const result = buildCompletionInferenceInput({
      rawAnswers: [
        createAnswer({
          actionId: "action-tag",
          action: {
            id: "action-tag",
            order: 1,
            type: ActionType.TAG,
            title: "성향 태그",
            description: "현재 성향을 골라주세요",
            nextCompletionId: null,
          },
          options: [
            { id: "opt-b", title: "외향형", description: "사람들과 어울리기 선호" },
            { id: "opt-a", title: "분석형", description: "데이터 기반 사고" },
          ],
        }),
      ],
      completions: [{ id: "c1", title: "결과 A", description: "A 설명" }],
    });

    expect(result.keyAnswers).toEqual([
      {
        actionId: "action-tag",
        type: "TAG",
        optionIds: ["opt-a", "opt-b"],
      },
    ]);

    expect(result.inferenceAnswers).toEqual([
      {
        actionId: "action-tag",
        actionType: "TAG",
        actionTitle: "성향 태그",
        actionDescription: "현재 성향을 골라주세요",
        kind: "OPTION_SELECTION",
        selectedOptions: [
          { id: "opt-a", title: "분석형", description: "데이터 기반 사고" },
          { id: "opt-b", title: "외향형", description: "사람들과 어울리기 선호" },
        ],
      },
    ]);
  });

  it("SUBJECTIVE/SHORT_TEXT 응답을 inferenceAnswers(TEXT)로 포함한다", () => {
    const result = buildCompletionInferenceInput({
      rawAnswers: [
        createAnswer({
          actionId: "action-text",
          textAnswer: "  사용자 자유 응답  ",
          action: {
            id: "action-text",
            order: 1,
            type: ActionType.SUBJECTIVE,
            title: "소감",
            description: "참여 소감을 작성해주세요",
            nextCompletionId: null,
          },
        }),
      ],
      completions: [{ id: "c1", title: "결과 A", description: "A 설명" }],
    });

    expect(result.keyAnswers).toEqual([]);
    expect(result.inferenceAnswers).toEqual([
      {
        actionId: "action-text",
        actionType: "SUBJECTIVE",
        actionTitle: "소감",
        actionDescription: "참여 소감을 작성해주세요",
        kind: "TEXT",
        value: "사용자 자유 응답",
      },
    ]);
  });

  it("미디어 응답은 fileCount만 inferenceAnswers에 반영한다", () => {
    const result = buildCompletionInferenceInput({
      rawAnswers: [
        createAnswer({
          actionId: "action-image",
          fileUploads: [{ id: "f-1" }, { id: "f-2" }],
          action: {
            id: "action-image",
            order: 1,
            type: ActionType.IMAGE,
            title: "이미지 업로드",
            description: "이미지를 올려주세요",
            nextCompletionId: null,
          },
        }),
      ],
      completions: [{ id: "c1", title: "결과 A", description: "A 설명" }],
    });

    expect(result.keyAnswers).toEqual([]);
    expect(result.inferenceAnswers).toEqual([
      {
        actionId: "action-image",
        actionType: "IMAGE",
        actionTitle: "이미지 업로드",
        actionDescription: "이미지를 올려주세요",
        kind: "FILE_UPLOAD",
        fileCount: 2,
      },
    ]);
  });
});
