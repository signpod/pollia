"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { type ReactNode, useState } from "react";

const MOCK_MISSION_ID = "mock-mission-id";
const BASE_TOTAL = 142;
const COMPLETION_RATIO = 0.7;

function toDateString(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

function seededRandom(seed: number): number {
  const x = Math.sin(seed * 9301 + 49297) * 49297;
  return x - Math.floor(x);
}

function generateDailyTrendData(): Array<{ date: string; count: number }> {
  const today = new Date();
  const days: Array<{ date: string; count: number }> = [];

  for (let i = 29; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    const dateStr = toDateString(d);
    const count = Math.floor(seededRandom(i + 1) * 30) + 2;
    days.push({ date: dateStr, count });
  }

  return days;
}

const ALL_DAILY_DATA = generateDailyTrendData();

function filterByDateRange(
  data: Array<{ date: string; count: number }>,
  from?: string,
  to?: string,
): Array<{ date: string; count: number }> {
  if (!from || !to) return data;
  return data.filter(d => d.date >= from && d.date <= to);
}

function buildStatsResponse(filtered: Array<{ date: string; count: number }>) {
  const periodParticipation = filtered.reduce((sum, d) => sum + d.count, 0);
  const completed = Math.round(periodParticipation * COMPLETION_RATIO);
  const rate = periodParticipation > 0 ? (completed / periodParticipation) * 100 : 0;

  return {
    data: {
      total: BASE_TOTAL,
      completed,
      completionRate: Math.round(rate * 10) / 10,
      averageDurationMs: 185000,
      shareCount: 23,
      completionReachStats: [],
    },
  };
}

const MOCK_FUNNEL_DATA = {
  data: {
    nodes: [],
    links: [],
    metadata: {
      totalSessions: 200,
      totalStarted: BASE_TOTAL,
      totalCompleted: 98,
      completionRate: 69.0,
      actions: [
        {
          id: "a1",
          title: "이름 입력",
          order: 0,
          entryCount: 142,
          responseCount: 135,
          entryToResponseRate: 95.1,
          inProgressCount: 7,
          averageCompletionTimeMs: 8500,
        },
        {
          id: "a2",
          title: "선호도 선택",
          order: 1,
          entryCount: 135,
          responseCount: 128,
          entryToResponseRate: 94.8,
          inProgressCount: 7,
          averageCompletionTimeMs: 12300,
        },
        {
          id: "a3",
          title: "사진 업로드",
          order: 2,
          entryCount: 128,
          responseCount: 110,
          entryToResponseRate: 85.9,
          inProgressCount: 18,
          averageCompletionTimeMs: 45600,
        },
        {
          id: "a4",
          title: "의견 작성",
          order: 3,
          entryCount: 110,
          responseCount: 102,
          entryToResponseRate: 92.7,
          inProgressCount: 8,
          averageCompletionTimeMs: 67200,
        },
        {
          id: "a5",
          title: "별점 평가",
          order: 4,
          entryCount: 102,
          responseCount: 98,
          entryToResponseRate: 96.1,
          inProgressCount: 4,
          averageCompletionTimeMs: 5100,
        },
      ],
    },
  },
};

function daysBetween(from: string, to: string): number {
  const start = new Date(from);
  const end = new Date(to);
  return Math.max(1, Math.round((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1);
}

function buildFunnelResponse(from?: string, to?: string) {
  const baseActions = MOCK_FUNNEL_DATA.data.metadata.actions;
  const ratio = from && to ? daysBetween(from, to) / 30 : 1;

  const actions = baseActions.map(action => ({
    ...action,
    entryCount: Math.max(1, Math.round(action.entryCount * ratio)),
    responseCount: Math.max(1, Math.round(action.responseCount * ratio)),
    inProgressCount: Math.max(0, Math.round(action.inProgressCount * ratio)),
    entryToResponseRate: action.entryToResponseRate,
    averageCompletionTimeMs: Math.round(action.averageCompletionTimeMs * (0.8 + ratio * 0.4)),
  }));

  const totalStarted = Math.max(1, Math.round(MOCK_FUNNEL_DATA.data.metadata.totalStarted * ratio));
  const totalCompleted = Math.max(
    1,
    Math.round(MOCK_FUNNEL_DATA.data.metadata.totalCompleted * ratio),
  );

  return {
    data: {
      nodes: [],
      links: [],
      metadata: {
        totalSessions: Math.max(
          1,
          Math.round(MOCK_FUNNEL_DATA.data.metadata.totalSessions * ratio),
        ),
        totalStarted,
        totalCompleted,
        completionRate: Math.round((totalCompleted / totalStarted) * 1000) / 10,
        actions,
      },
    },
  };
}

function populateQueryOnAdd(client: QueryClient, mode: "data" | "empty") {
  client.getQueryCache().subscribe(event => {
    if (event.type !== "added") return;
    const key = event.query.queryKey;

    if (key[0] === "mission-stats") {
      if (mode === "empty") {
        client.setQueryData(key, EMPTY_STATS);
        return;
      }
      const from = typeof key[2] === "string" ? key[2] : undefined;
      const to = typeof key[3] === "string" ? key[3] : undefined;
      const filtered = filterByDateRange(ALL_DAILY_DATA, from, to);
      client.setQueryData(key, buildStatsResponse(filtered));
    }

    if (key[0] === "daily-participation-trend") {
      if (mode === "empty") {
        client.setQueryData(key, { data: [] });
        return;
      }
      const from = typeof key[2] === "string" ? key[2] : undefined;
      const to = typeof key[3] === "string" ? key[3] : undefined;
      const filtered = filterByDateRange(ALL_DAILY_DATA, from, to);
      client.setQueryData(key, { data: filtered });
    }

    if (key[0] === "mission-funnel") {
      if (mode === "empty") {
        client.setQueryData(key, EMPTY_FUNNEL);
        return;
      }
      let from: string | undefined;
      let to: string | undefined;
      const options = key[2];
      if (options && typeof options === "object" && "dateRange" in options) {
        const dr = options.dateRange;
        if (dr && typeof dr === "object" && "from" in dr && "to" in dr) {
          from = typeof dr.from === "string" ? dr.from : undefined;
          to = typeof dr.to === "string" ? dr.to : undefined;
        }
      }
      client.setQueryData(key, buildFunnelResponse(from, to));
    }
  });
}

function createMockQueryClient() {
  const client = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
        refetchOnWindowFocus: false,
        staleTime: Number.POSITIVE_INFINITY,
        refetchInterval: false,
      },
    },
  });

  populateQueryOnAdd(client, "data");

  return client;
}

const EMPTY_STATS = {
  data: {
    total: 0,
    completed: 0,
    completionRate: 0,
    averageDurationMs: null,
    shareCount: 0,
    completionReachStats: [],
  },
};

const EMPTY_FUNNEL = {
  data: {
    nodes: [],
    links: [],
    metadata: {
      totalSessions: 0,
      totalStarted: 0,
      totalCompleted: 0,
      completionRate: 0,
      actions: [],
    },
  },
};

function createEmptyMockQueryClient() {
  const client = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
        refetchOnWindowFocus: false,
        staleTime: Number.POSITIVE_INFINITY,
        refetchInterval: false,
      },
    },
  });

  populateQueryOnAdd(client, "empty");

  return client;
}

export { MOCK_MISSION_ID };

export function StatsMockProvider({ children }: { children: ReactNode }) {
  const [queryClient] = useState(createMockQueryClient);

  return (
    <QueryClientProvider client={queryClient}>
      <div className="min-h-screen bg-zinc-50 p-6">{children}</div>
    </QueryClientProvider>
  );
}

export function EmptyStatsMockProvider({ children }: { children: ReactNode }) {
  const [queryClient] = useState(createEmptyMockQueryClient);

  return (
    <QueryClientProvider client={queryClient}>
      <div className="min-h-screen bg-zinc-50 p-6">{children}</div>
    </QueryClientProvider>
  );
}
