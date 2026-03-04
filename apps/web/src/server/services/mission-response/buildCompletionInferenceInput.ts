import { formatDateToHHMM, formatDateToYYYYMMDD } from "@/lib/date";
import { ActionType } from "@prisma/client";
import type {
  CompletionCandidate,
  CompletionInferenceAnswer,
  CompletionInferenceContextSignatureItem,
  CompletionInferenceRawAnswer,
  InferenceOptionContext,
  StructuredAnswerForKey,
} from "./completionInferenceTypes";

interface BuildCompletionInferenceInputParams {
  rawAnswers: CompletionInferenceRawAnswer[];
  completions: CompletionCandidate[];
}

interface BuildCompletionInferenceInputResult {
  keyAnswers: StructuredAnswerForKey[];
  inferenceAnswers: CompletionInferenceAnswer[];
  contextSignaturePayload: CompletionInferenceContextSignatureItem[];
  completionsSummaryForSignature: CompletionCandidate[];
}

interface ActionContext {
  actionId: string;
  actionType: ActionType;
  actionTitle: string;
  actionDescription: string | null;
}

function normalizeText(value: string | null | undefined): string {
  return (value ?? "").trim();
}

function normalizeNullableText(value: string | null | undefined): string | null {
  const trimmed = normalizeText(value);
  return trimmed.length > 0 ? trimmed : null;
}

function toActionContext(answer: CompletionInferenceRawAnswer): ActionContext {
  return {
    actionId: answer.actionId,
    actionType: answer.action.type,
    actionTitle: normalizeText(answer.action.title) || answer.actionId,
    actionDescription: normalizeNullableText(answer.action.description),
  };
}

function normalizeDateValues(values: Date[]): string[] {
  return [...new Set(values.map(value => formatDateToYYYYMMDD(value)))].sort();
}

function normalizeTimeValues(values: Date[]): string[] {
  return [...new Set(values.map(value => formatDateToHHMM(value)))].sort();
}

function normalizeSelectedOptions(
  options: CompletionInferenceRawAnswer["options"],
): InferenceOptionContext[] {
  const deduped = new Map<string, InferenceOptionContext>();

  for (const option of options) {
    if (deduped.has(option.id)) {
      continue;
    }
    deduped.set(option.id, {
      id: option.id,
      title: normalizeText(option.title) || option.id,
      description: normalizeNullableText(option.description),
    });
  }

  return [...deduped.values()].sort((left, right) => left.id.localeCompare(right.id));
}

function sortAnswersByActionOrder(answers: CompletionInferenceRawAnswer[]) {
  return [...answers].sort((left, right) => {
    const leftOrder = left.action.order ?? Number.MAX_SAFE_INTEGER;
    const rightOrder = right.action.order ?? Number.MAX_SAFE_INTEGER;
    if (leftOrder !== rightOrder) {
      return leftOrder - rightOrder;
    }
    return left.actionId.localeCompare(right.actionId);
  });
}

function sortCompletionsForSignature(completions: CompletionCandidate[]): CompletionCandidate[] {
  return [...completions]
    .map(completion => ({
      id: completion.id,
      title: normalizeText(completion.title),
      description: normalizeText(completion.description),
    }))
    .sort((left, right) => left.id.localeCompare(right.id));
}

export function buildCompletionInferenceInput(
  input: BuildCompletionInferenceInputParams,
): BuildCompletionInferenceInputResult {
  const orderedAnswers = sortAnswersByActionOrder(input.rawAnswers);
  const keyAnswers: StructuredAnswerForKey[] = [];
  const inferenceAnswers: CompletionInferenceAnswer[] = [];
  const contextSignaturePayload: CompletionInferenceContextSignatureItem[] = [];

  for (const answer of orderedAnswers) {
    const actionContext = toActionContext(answer);

    switch (answer.action.type) {
      case ActionType.MULTIPLE_CHOICE:
      case ActionType.TAG:
      case ActionType.BRANCH: {
        const selectedOptions = normalizeSelectedOptions(answer.options);
        if (selectedOptions.length === 0) {
          continue;
        }

        keyAnswers.push({
          actionId: answer.actionId,
          type: answer.action.type,
          optionIds: selectedOptions.map(option => option.id),
        });

        inferenceAnswers.push({
          ...actionContext,
          kind: "OPTION_SELECTION",
          selectedOptions,
        });

        contextSignaturePayload.push({
          ...actionContext,
          selectedOptions,
        });
        continue;
      }
      case ActionType.SCALE:
      case ActionType.RATING: {
        if (answer.scaleAnswer === null || answer.scaleAnswer === undefined) {
          continue;
        }

        keyAnswers.push({
          actionId: answer.actionId,
          type: answer.action.type,
          value: answer.scaleAnswer,
        });

        inferenceAnswers.push({
          ...actionContext,
          kind: "NUMERIC",
          value: answer.scaleAnswer,
        });

        contextSignaturePayload.push(actionContext);
        continue;
      }
      case ActionType.DATE: {
        const values = normalizeDateValues(answer.dateAnswers ?? []);
        if (values.length === 0) {
          continue;
        }

        keyAnswers.push({
          actionId: answer.actionId,
          type: "DATE",
          values,
        });

        inferenceAnswers.push({
          ...actionContext,
          kind: "DATE_VALUES",
          values,
        });

        contextSignaturePayload.push(actionContext);
        continue;
      }
      case ActionType.TIME: {
        const values = normalizeTimeValues(answer.dateAnswers ?? []);
        if (values.length === 0) {
          continue;
        }

        keyAnswers.push({
          actionId: answer.actionId,
          type: "TIME",
          values,
        });

        inferenceAnswers.push({
          ...actionContext,
          kind: "TIME_VALUES",
          values,
        });

        contextSignaturePayload.push(actionContext);
        continue;
      }
      case ActionType.SUBJECTIVE:
      case ActionType.SHORT_TEXT: {
        const textValue = normalizeNullableText(answer.textAnswer);
        if (!textValue) {
          continue;
        }

        inferenceAnswers.push({
          ...actionContext,
          kind: "TEXT",
          value: textValue,
        });

        contextSignaturePayload.push(actionContext);
        continue;
      }
      case ActionType.IMAGE:
      case ActionType.VIDEO:
      case ActionType.PDF: {
        const fileCount = answer.fileUploads?.length ?? 0;
        if (fileCount <= 0) {
          continue;
        }

        inferenceAnswers.push({
          ...actionContext,
          kind: "FILE_UPLOAD",
          fileCount,
        });

        contextSignaturePayload.push(actionContext);
        continue;
      }
      default:
        continue;
    }
  }

  return {
    keyAnswers,
    inferenceAnswers,
    contextSignaturePayload,
    completionsSummaryForSignature: sortCompletionsForSignature(input.completions),
  };
}
