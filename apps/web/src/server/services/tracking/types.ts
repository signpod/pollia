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
    }>;
  };
}

export interface GetMissionFunnelOptions {
  utmSource?: string;
}
