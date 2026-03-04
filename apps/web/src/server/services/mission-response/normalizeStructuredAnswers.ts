import { buildCompletionInferenceInput } from "./buildCompletionInferenceInput";
import type {
  CompletionInferenceAnswer,
  CompletionInferenceRawAnswer,
} from "./completionInferenceTypes";

/**
 * @deprecated `buildCompletionInferenceInput`를 직접 사용하세요.
 */
export function normalizeStructuredAnswers(answers: CompletionInferenceRawAnswer[]): {
  keyAnswers: ReturnType<typeof buildCompletionInferenceInput>["keyAnswers"];
  aiAnswers: CompletionInferenceAnswer[];
} {
  const { keyAnswers, inferenceAnswers } = buildCompletionInferenceInput({
    rawAnswers: answers,
    completions: [],
  });

  return { keyAnswers, aiAnswers: inferenceAnswers };
}
