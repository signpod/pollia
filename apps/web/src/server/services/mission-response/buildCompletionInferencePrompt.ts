import type { CompletionInferenceInput } from "./completionInferenceTypes";

const PROMPT_INTRO = [
  "너는 설문 완료화면 선택기다.",
  "입력된 completion 목록 중 반드시 하나의 completion id를 선택한다.",
  '응답은 반드시 {"result":"completion-id"} 형태의 JSON으로만 반환한다.',
].join("\n");

const PROMPT_RULES = [
  "규칙:",
  "- completion id 외 문자열을 생성하지 않는다.",
  "- 목록에 없는 id를 생성하지 않는다.",
  "- 가장 적합한 completion 하나만 고른다.",
].join("\n");

export function buildCompletionInferencePrompt(input: CompletionInferenceInput): string {
  return [
    PROMPT_INTRO,
    "",
    `missionId: ${input.missionId}`,
    `missionTitle: ${input.missionTitle}`,
    `completions: ${JSON.stringify(input.completions)}`,
    `inferenceAnswers: ${JSON.stringify(input.inferenceAnswers)}`,
    "",
    PROMPT_RULES,
  ].join("\n");
}
