"use client";

import { useReadMissionFunnel } from "@/hooks/tracking/useReadMissionFunnel";
import type { DateRangeString } from "@/types/common/dateRange";
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
  dateRange?: DateRangeString;
}

function msToSeconds(ms: number): number {
  return Math.round((ms / 1000) * 10) / 10;
}

function CustomXAxisTick({ x, y, payload }: { x: number; y: number; payload: { value: string } }) {
  const label = payload.value.length > 20 ? `${payload.value.slice(0, 20)}...` : payload.value;
  return (
    <g transform={`translate(${x},${y})`}>
      <text
        x={0}
        y={0}
        dy={12}
        textAnchor="end"
        fill="#71717a"
        fontSize={11}
        transform="rotate(-30)"
      >
        {label}
      </text>
    </g>
  );
}

export function ActionTimingChart({ missionId, dateRange }: ActionTimingChartProps) {
  const { data, isPending, error } = useReadMissionFunnel(missionId, { dateRange });

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
          <LineChart data={chartData} margin={{ top: 5, right: 10, left: -10, bottom: 40 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e4e4e7" />
            <XAxis
              dataKey="name"
              tick={<CustomXAxisTick x={0} y={0} payload={{ value: "" }} />}
              axisLine={{ stroke: "#d4d4d8" }}
              interval={0}
              height={60}
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
