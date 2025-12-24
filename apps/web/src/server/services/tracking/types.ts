export interface FunnelNode {
  id: string;
  name: string;
  type: "start" | "entry" | "response" | "drop";
  count: number;
}

export interface FunnelLink {
  source: string;
  target: string;
  value: number;
}

export interface MissionFunnelData {
  nodes: FunnelNode[];
  links: FunnelLink[];
  metadata: {
    totalSessions: number;
    totalStarted: number;
    totalCompleted: number;
    completionRate: number;
    actions: Array<{
      id: string;
      title: string;
      order: number;
      entryCount: number;
      responseCount: number;
      entryToResponseRate: number;
      inProgressCount: number;
      averageCompletionTimeMs: number | null;
    }>;
  };
}

export interface GetMissionFunnelOptions {
  utmSource?: string;
}

export interface SessionMaps {
  sessionEntries: Map<string, Set<string>>;
  sessionResponses: Map<string, Set<string>>;
  entries: Array<{ sessionId: string; actionId: string; enteredAt: Date }>;
  responses: Array<{ sessionId: string; actionId: string; respondedAt: Date }>;
}

export interface Statistics {
  totalSessions: number;
  totalStarted: number;
  totalCompleted: number;
  completionRate: number;
}

export interface ActionSummary {
  id: string;
  title: string;
  order: number;
}
