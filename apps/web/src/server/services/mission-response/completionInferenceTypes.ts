import type { ActionType } from "@prisma/client";

export type StructuredAnswerForKey =
  | { actionId: string; type: "MULTIPLE_CHOICE" | "TAG" | "BRANCH"; optionIds: string[] }
  | { actionId: string; type: "SCALE" | "RATING"; value: number }
  | { actionId: string; type: "DATE"; values: string[] }
  | { actionId: string; type: "TIME"; values: string[] };

export interface CompletionCandidate {
  id: string;
  title: string;
  description: string;
}

export interface InferenceOptionContext {
  id: string;
  title: string;
  description: string | null;
}

interface InferenceAnswerBase {
  actionId: string;
  actionType: ActionType;
  actionTitle: string;
  actionDescription: string | null;
}

export type CompletionInferenceAnswer =
  | (InferenceAnswerBase & {
      kind: "OPTION_SELECTION";
      selectedOptions: InferenceOptionContext[];
    })
  | (InferenceAnswerBase & {
      kind: "NUMERIC";
      value: number;
    })
  | (InferenceAnswerBase & {
      kind: "DATE_VALUES";
      values: string[];
    })
  | (InferenceAnswerBase & {
      kind: "TIME_VALUES";
      values: string[];
    })
  | (InferenceAnswerBase & {
      kind: "TEXT";
      value: string;
    })
  | (InferenceAnswerBase & {
      kind: "FILE_UPLOAD";
      fileCount: number;
    });

export interface CompletionInferenceContextSignatureItem {
  actionId: string;
  actionType: ActionType;
  actionTitle: string;
  actionDescription: string | null;
  selectedOptions?: InferenceOptionContext[];
}

export interface CompletionInferenceRawOption {
  id: string;
  title?: string | null;
  description?: string | null;
  nextCompletionId?: string | null;
}

export interface CompletionInferenceRawFileUpload {
  id: string;
}

export interface CompletionInferenceRawAction {
  id: string;
  order: number | null;
  type: ActionType;
  title?: string | null;
  description?: string | null;
  nextCompletionId?: string | null;
}

export interface CompletionInferenceRawAnswer {
  actionId: string;
  textAnswer?: string | null;
  scaleAnswer: number | null;
  dateAnswers: Date[];
  options: CompletionInferenceRawOption[];
  fileUploads: CompletionInferenceRawFileUpload[];
  action: CompletionInferenceRawAction;
}

export interface CompletionInferenceInput {
  missionId: string;
  missionTitle: string;
  completions: CompletionCandidate[];
  inferenceAnswers: CompletionInferenceAnswer[];
}

export interface NormalizedFingerprintPayload {
  version: number;
  keyAnswers: StructuredAnswerForKey[];
  contextSignaturePayload: CompletionInferenceContextSignatureItem[];
  completions: CompletionCandidate[];
}
