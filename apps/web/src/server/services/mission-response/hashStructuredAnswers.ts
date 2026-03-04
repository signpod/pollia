import type { StructuredAnswerForKey } from "./completionInferenceTypes";
import { hashCompletionInferenceFingerprint } from "./hashCompletionInferenceFingerprint";

/**
 * @deprecated `hashCompletionInferenceFingerprint`를 직접 사용하세요.
 */
export function hashStructuredAnswers(answers: StructuredAnswerForKey[]): {
  hash: string;
  normalizedPayload: unknown;
} | null {
  return hashCompletionInferenceFingerprint({
    keyAnswers: answers,
    contextSignaturePayload: [],
    completionsSummaryForSignature: [],
  });
}
