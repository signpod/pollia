import { formatDateToHHMM, formatDateToYYYYMMDD } from "@/lib/date";
import { ActionType } from "@prisma/client";
import type { StructuredAnswerForAi, StructuredAnswerForKey } from "./completionInferenceTypes";

interface RawOption {
  id: string;
}

interface RawFileUpload {
  id: string;
}

interface RawAction {
  id: string;
  order: number | null;
  type: ActionType;
}

interface RawAnswer {
  actionId: string;
  scaleAnswer: number | null;
  dateAnswers: Date[];
  options: RawOption[];
  fileUploads: RawFileUpload[];
  action: RawAction;
}

function normalizeOptionIds(options: RawOption[]): string[] {
  return [...new Set(options.map(option => option.id))].sort();
}

function normalizeDateValues(values: Date[]): string[] {
  return [...new Set(values.map(value => formatDateToYYYYMMDD(value)))].sort();
}

function normalizeTimeValues(values: Date[]): string[] {
  return [...new Set(values.map(value => formatDateToHHMM(value)))].sort();
}

export function normalizeStructuredAnswers(answers: RawAnswer[]): {
  keyAnswers: StructuredAnswerForKey[];
  aiAnswers: StructuredAnswerForAi[];
} {
  const orderedAnswers = [...answers].sort((left, right) => {
    const leftOrder = left.action.order ?? Number.MAX_SAFE_INTEGER;
    const rightOrder = right.action.order ?? Number.MAX_SAFE_INTEGER;
    if (leftOrder !== rightOrder) {
      return leftOrder - rightOrder;
    }
    return left.actionId.localeCompare(right.actionId);
  });

  const keyAnswers: StructuredAnswerForKey[] = [];
  const aiAnswers: StructuredAnswerForAi[] = [];

  for (const answer of orderedAnswers) {
    const { actionId } = answer;

    switch (answer.action.type) {
      case ActionType.MULTIPLE_CHOICE:
      case ActionType.TAG:
      case ActionType.BRANCH: {
        const optionIds = normalizeOptionIds(answer.options);
        if (optionIds.length === 0) {
          break;
        }

        const normalized = {
          actionId,
          type: answer.action.type,
          optionIds,
        } as const;
        keyAnswers.push(normalized);
        aiAnswers.push(normalized);
        break;
      }
      case ActionType.SCALE:
      case ActionType.RATING: {
        if (answer.scaleAnswer === null || answer.scaleAnswer === undefined) {
          break;
        }

        const normalized = {
          actionId,
          type: answer.action.type,
          value: answer.scaleAnswer,
        } as const;
        keyAnswers.push(normalized);
        aiAnswers.push(normalized);
        break;
      }
      case ActionType.DATE: {
        const values = normalizeDateValues(answer.dateAnswers ?? []);
        if (values.length === 0) {
          break;
        }

        const normalized = {
          actionId,
          type: "DATE" as const,
          values,
        };
        keyAnswers.push(normalized);
        aiAnswers.push(normalized);
        break;
      }
      case ActionType.TIME: {
        const values = normalizeTimeValues(answer.dateAnswers ?? []);
        if (values.length === 0) {
          break;
        }

        const normalized = {
          actionId,
          type: "TIME" as const,
          values,
        };
        keyAnswers.push(normalized);
        aiAnswers.push(normalized);
        break;
      }
      case ActionType.IMAGE:
      case ActionType.VIDEO:
      case ActionType.PDF: {
        const fileCount = answer.fileUploads?.length ?? 0;
        if (fileCount <= 0) {
          break;
        }

        aiAnswers.push({
          actionId,
          type: answer.action.type,
          fileCount,
        });
        break;
      }
      default:
        break;
    }
  }

  return { keyAnswers, aiAnswers };
}
