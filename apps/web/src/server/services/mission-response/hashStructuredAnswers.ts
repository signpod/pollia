import { createHash } from "crypto";
import type { StructuredAnswerForKey } from "./completionInferenceTypes";

function normalizeForFingerprint(answers: StructuredAnswerForKey[]) {
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

export function hashStructuredAnswers(answers: StructuredAnswerForKey[]): {
  hash: string;
  normalizedPayload: ReturnType<typeof normalizeForFingerprint>;
} | null {
  if (answers.length === 0) {
    return null;
  }

  const normalizedPayload = normalizeForFingerprint(answers);
  const payload = JSON.stringify(normalizedPayload);
  const hash = createHash("sha256").update(payload).digest("hex");

  return { hash, normalizedPayload };
}
