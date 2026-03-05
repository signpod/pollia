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
    report: string;
    usage?: AiUsage;
  };
}

export interface GetMissionAiReportResponse {
  data: {
    report: string | null;
  };
}
