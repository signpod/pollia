export type StructuredAnswerForKey =
  | { actionId: string; type: "MULTIPLE_CHOICE" | "TAG" | "BRANCH"; optionIds: string[] }
  | { actionId: string; type: "SCALE" | "RATING"; value: number }
  | { actionId: string; type: "DATE"; values: string[] }
  | { actionId: string; type: "TIME"; values: string[] };

export type StructuredAnswerForAi =
  | StructuredAnswerForKey
  | { actionId: string; type: "IMAGE" | "VIDEO" | "PDF"; fileCount: number };

export interface CompletionInferenceInput {
  missionId: string;
  missionTitle: string;
  completions: Array<{
    id: string;
    title: string;
    description: string;
  }>;
  structuredAnswers: StructuredAnswerForAi[];
}
