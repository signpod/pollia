import type { CompletionCandidate, CompletionInferenceInput } from "./completionInferenceTypes";

const PROMPT_INTRO = [
  "너는 설문/퀴즈 완료화면 선택기다.",
  "사용자의 응답(inferenceAnswers)을 종합 분석하여, 가장 부합하는 completion을 하나 선택한다.",
  '응답은 반드시 {"result":"completion-id"} 형태의 JSON으로만 반환한다.',
].join("\n");

const PROMPT_RULES = [
  "규칙:",
  "- 사용자의 전체 응답 패턴과 성향을 종합적으로 고려한다.",
  "- 각 completion의 title과 description을 주의 깊게 분석하여 응답과 가장 잘 맞는 것을 선택한다.",
  "- completion id 외 문자열을 생성하지 않는다.",
  "- 목록에 없는 id를 생성하지 않는다.",
  "- 가장 적합한 completion 하나만 고른다.",
].join("\n");

function stripHtml(html: string): string {
  return html
    .replace(/<[^>]*>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function sanitizeCompletions(completions: CompletionCandidate[]): CompletionCandidate[] {
  return completions.map(completion => ({
    id: completion.id,
    title: completion.title,
    description: stripHtml(completion.description),
  }));
}

export function buildCompletionInferencePrompt(input: CompletionInferenceInput): string {
  const cleanedCompletions = sanitizeCompletions(input.completions);

  return [
    PROMPT_INTRO,
    "",
    `missionId: ${input.missionId}`,
    `missionTitle: ${input.missionTitle}`,
    `completions: ${JSON.stringify(cleanedCompletions)}`,
    `inferenceAnswers: ${JSON.stringify(input.inferenceAnswers)}`,
    "",
    PROMPT_RULES,
  ].join("\n");
}
