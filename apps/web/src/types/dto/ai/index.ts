import type { AiReportData as AiReportDataType } from "./report";

export type { AiReportAiAnalysis, AiReportData } from "./report";

export interface AiUsage {
  inputTokens: number;
  outputTokens: number;
  totalTokens: number;
}

export interface RunAiPromptRequest {
  prompt: string;
}

export interface RunAiPromptResponse {
  data: {
    result: string;
    usage?: AiUsage;
  };
}

export interface GenerateMissionAiReportResponse {
  data: {
    reportData: AiReportDataType;
    usage?: AiUsage;
  };
}

export interface GetMissionAiReportResponse {
  data: {
    reportData: AiReportDataType | null;
  };
}
