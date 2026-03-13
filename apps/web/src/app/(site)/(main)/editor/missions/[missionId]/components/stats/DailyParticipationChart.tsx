"use client";

import { useReadDailyParticipationTrend } from "@/hooks/mission-response";
import type { DateRangeString } from "@/types/common/dateRange";
import { Typo } from "@repo/ui/components";
import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

interface DailyParticipationChartProps {
  missionId: string;
  dateRange: DateRangeString | undefined;
}

function formatDateLabel(dateStr: string): string {
  const parts = dateStr.split("-");
  if (parts.length === 3) {
    return `${parts[1]}/${parts[2]}`;
  }
  return dateStr;
}

export function DailyParticipationChart({ missionId, dateRange }: DailyParticipationChartProps) {
  const { data, isPending, error } = useReadDailyParticipationTrend(missionId, dateRange);
  const trendData = data?.data ?? [];

  return (
    <div className="rounded-xl border border-zinc-200 bg-white p-5">
      <Typo.SubTitle className="mb-4">일별 참여 추이</Typo.SubTitle>

      {isPending && (
        <div className="flex h-[200px] items-center justify-center text-sm text-zinc-500">
          차트를 불러오는 중입니다.
        </div>
      )}

      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          참여 추이를 불러오지 못했습니다.
        </div>
      )}

      {!isPending && !error && trendData.length === 0 && (
        <div className="flex h-[200px] items-center justify-center text-sm text-zinc-500">
          해당 기간에 참여 데이터가 없습니다.
        </div>
      )}

      {!isPending && !error && trendData.length > 0 && (
        <ResponsiveContainer width="100%" height={220}>
          <LineChart data={trendData} margin={{ top: 5, right: 10, left: -10, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e4e4e7" />
            <XAxis
              dataKey="date"
              tickFormatter={formatDateLabel}
              tick={{ fontSize: 12, fill: "#71717a" }}
              axisLine={{ stroke: "#d4d4d8" }}
            />
            <YAxis
              allowDecimals={false}
              tick={{ fontSize: 12, fill: "#71717a" }}
              axisLine={{ stroke: "#d4d4d8" }}
            />
            <Tooltip
              contentStyle={{
                borderRadius: 8,
                border: "1px solid #e4e4e7",
                fontSize: 13,
              }}
              labelFormatter={(label: string) => label}
              formatter={(value: number) => [`${value}명`, "참여 수"]}
            />
            <Line
              type="monotone"
              dataKey="count"
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
