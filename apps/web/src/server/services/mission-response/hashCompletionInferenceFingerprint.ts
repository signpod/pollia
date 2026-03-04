import { createHash } from "node:crypto";
import type {
  CompletionCandidate,
  CompletionInferenceContextSignatureItem,
  NormalizedFingerprintPayload,
  StructuredAnswerForKey,
} from "./completionInferenceTypes";

const FINGERPRINT_VERSION = 2;

interface HashCompletionInferenceFingerprintInput {
  keyAnswers: StructuredAnswerForKey[];
  contextSignaturePayload: CompletionInferenceContextSignatureItem[];
  completionsSummaryForSignature: CompletionCandidate[];
}

function normalizeKeyAnswers(answers: StructuredAnswerForKey[]) {
  return [...answers]
    .map(answer => {
      switch (answer.type) {
        case "MULTIPLE_CHOICE":
        case "TAG":
        case "BRANCH":
          return {
            actionId: answer.actionId,
            type: answer.type,
            optionIds: [...answer.optionIds].sort(),
          };
        case "DATE":
        case "TIME":
          return {
            actionId: answer.actionId,
            type: answer.type,
            values: [...answer.values].sort(),
          };
        case "SCALE":
        case "RATING":
          return {
            actionId: answer.actionId,
            type: answer.type,
            value: answer.value,
          };
      }
    })
    .sort((left, right) => {
      if (left.actionId !== right.actionId) {
        return left.actionId.localeCompare(right.actionId);
      }
      return left.type.localeCompare(right.type);
    });
}

function normalizeContextPayload(context: CompletionInferenceContextSignatureItem[]) {
  return [...context]
    .map(item => ({
      actionId: item.actionId,
      actionType: item.actionType,
      actionTitle: item.actionTitle,
      actionDescription: item.actionDescription,
      selectedOptions: item.selectedOptions
        ? [...item.selectedOptions]
            .map(option => ({
              id: option.id,
              title: option.title,
              description: option.description,
            }))
            .sort((left, right) => left.id.localeCompare(right.id))
        : undefined,
    }))
    .sort((left, right) => left.actionId.localeCompare(right.actionId));
}

function normalizeCompletions(completions: CompletionCandidate[]) {
  return [...completions]
    .map(completion => ({
      id: completion.id,
      title: completion.title,
      description: completion.description,
    }))
    .sort((left, right) => left.id.localeCompare(right.id));
}

export function hashCompletionInferenceFingerprint(
  input: HashCompletionInferenceFingerprintInput,
): { hash: string; normalizedPayload: NormalizedFingerprintPayload } | null {
  if (input.keyAnswers.length === 0) {
    return null;
  }

  const normalizedPayload = {
    version: FINGERPRINT_VERSION,
    keyAnswers: normalizeKeyAnswers(input.keyAnswers),
    contextSignaturePayload: normalizeContextPayload(input.contextSignaturePayload),
    completions: normalizeCompletions(input.completionsSummaryForSignature),
  };

  const hash = createHash("sha256").update(JSON.stringify(normalizedPayload)).digest("hex");

  return { hash, normalizedPayload };
}
