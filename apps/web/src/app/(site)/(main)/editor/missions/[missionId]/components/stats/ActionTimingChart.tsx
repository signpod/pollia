"use client";

import { useReadMissionFunnel } from "@/hooks/tracking/useReadMissionFunnel";
import { Typo } from "@repo/ui/components";
import { useMemo } from "react";
import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

interface ActionTimingChartProps {
  missionId: string;
}

function msToSeconds(ms: number): number {
  return Math.round((ms / 1000) * 10) / 10;
}

function truncateLabel(label: string, maxLength = 8): string {
  return label.length > maxLength ? `${label.slice(0, maxLength)}...` : label;
}

export function ActionTimingChart({ missionId }: ActionTimingChartProps) {
  const { data, isPending, error } = useReadMissionFunnel(missionId);

  const chartData = useMemo(() => {
    const actions = data?.data?.metadata?.actions;
    if (!actions || actions.length === 0) return [];

    return actions
      .filter(
        (action): action is typeof action & { averageCompletionTimeMs: number } =>
          action.averageCompletionTimeMs !== null,
      )
      .sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
      .map((action, idx) => ({
        name: action.title || `Q${idx + 1}`,
        seconds: msToSeconds(action.averageCompletionTimeMs),
      }));
  }, [data]);

  return (
    <div className="rounded-xl border border-zinc-200 bg-white p-5">
      <Typo.SubTitle className="mb-4">액션별 평균 소요 시간</Typo.SubTitle>

      {isPending && (
        <div className="flex h-[200px] items-center justify-center text-sm text-zinc-500">
          차트를 불러오는 중입니다.
        </div>
      )}

      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          소요 시간 데이터를 불러오지 못했습니다.
        </div>
      )}

      {!isPending && !error && chartData.length === 0 && (
        <div className="flex h-[200px] items-center justify-center text-sm text-zinc-500">
          소요 시간 데이터가 없습니다.
        </div>
      )}

      {!isPending && !error && chartData.length > 0 && (
        <ResponsiveContainer width="100%" height={220}>
          <LineChart data={chartData} margin={{ top: 5, right: 10, left: -10, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e4e4e7" />
            <XAxis
              dataKey="name"
              tickFormatter={truncateLabel}
              tick={{ fontSize: 12, fill: "#71717a" }}
              axisLine={{ stroke: "#d4d4d8" }}
            />
            <YAxis
              tick={{ fontSize: 12, fill: "#71717a" }}
              axisLine={{ stroke: "#d4d4d8" }}
              unit="s"
            />
            <Tooltip
              contentStyle={{
                borderRadius: 8,
                border: "1px solid #e4e4e7",
                fontSize: 13,
              }}
              formatter={(value: number) => [`${value}초`, "평균 소요 시간"]}
            />
            <Line
              type="monotone"
              dataKey="seconds"
              stroke="#18181b"
              strokeWidth={2}
              dot={{ r: 3, fill: "#18181b" }}
              activeDot={{ r: 5 }}
            />
          </LineChart>
        </ResponsiveContainer>
      )}
    </div>
  );
}
