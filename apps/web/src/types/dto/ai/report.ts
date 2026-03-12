export interface AiReportData {
  version: 2;
  generatedAt: string;
  stats: {
    cover: {
      missionTitle: string;
      startDate: string | null;
      endDate: string | null;
    };
    kpis: {
      totalParticipants: number;
      completionRate: number;
      avgDurationSeconds: number | null;
      shareCount: number | null; // TODO: 백엔드 연결 필요
    };
    dailyTrend: Array<{ date: string; count: number }>;
    funnel: Array<{
      actionId: string;
      actionTitle: string;
      entryCount: number;
      responseCount: number;
    }>;
    multipleChoice: Array<{
      actionId: string;
      title: string;
      responses: Array<{ label: string; count: number }>;
    }>;
    resultDistribution: Array<{
      completionId: string;
      title: string;
      count: number;
      rate: number;
    }>;
  };
  ai: {
    summary: string;
    dropOffAnalysis: string;
    subjective: {
      topKeywords: Array<{ keyword: string; count: number }>;
      sentiment: { positive: number; neutral: number; negative: number };
      summary: string;
    };
    insights: string[];
    suggestions: string[];
  };
}

export interface AiReportAiAnalysis {
  summary: string;
  dropOffAnalysis: string;
  subjective: {
    topKeywords: Array<{ keyword: string; count: number }>;
    sentiment: { positive: number; neutral: number; negative: number };
    summary: string;
  };
  insights: string[];
  suggestions: string[];
}
