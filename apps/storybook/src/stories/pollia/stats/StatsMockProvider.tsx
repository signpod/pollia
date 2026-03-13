"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { type ReactNode, useState } from "react";

const MOCK_MISSION_ID = "mock-mission-id";
const BASE_TOTAL = 142;

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
  const completed = filtered.reduce((sum, d) => sum + d.count, 0);
  const rate = BASE_TOTAL > 0 ? (completed / BASE_TOTAL) * 100 : 0;

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

interface DateRange {
  from: string;
  to: string;
}

function getPresetDateRanges(): Array<DateRange | undefined> {
  const today = new Date();
  const todayStr = toDateString(today);

  const sevenDaysAgo = new Date(today);
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 6);

  const thirtyDaysAgo = new Date(today);
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 29);

  return [
    undefined,
    { from: todayStr, to: todayStr },
    { from: toDateString(sevenDaysAgo), to: todayStr },
    { from: toDateString(thirtyDaysAgo), to: todayStr },
  ];
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

  const presets = getPresetDateRanges();

  for (const range of presets) {
    const filtered = filterByDateRange(ALL_DAILY_DATA, range?.from, range?.to);

    const statsKey = range
      ? ["mission-stats", MOCK_MISSION_ID, range.from, range.to]
      : ["mission-stats", MOCK_MISSION_ID];

    const trendKey = range
      ? ["daily-participation-trend", MOCK_MISSION_ID, range.from, range.to]
      : ["daily-participation-trend", MOCK_MISSION_ID];

    client.setQueryData(statsKey, buildStatsResponse(filtered));
    client.setQueryData(trendKey, { data: filtered });
  }

  client.setQueryData(["mission-funnel", MOCK_MISSION_ID, {}], MOCK_FUNNEL_DATA);

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
