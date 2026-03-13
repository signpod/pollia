"use client";

import type { ScaleActionStats } from "@/types/dto/action-stats";
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

interface ScaleDistributionChartProps {
  data: ScaleActionStats;
}

export function ScaleDistributionChart({ data }: ScaleDistributionChartProps) {
  if (data.totalResponses === 0) {
    return <p className="py-6 text-center text-sm text-zinc-400">응답이 없습니다.</p>;
  }

  return (
    <div className="space-y-4">
      <ResponsiveContainer width="100%" height={200}>
        <BarChart data={data.distribution} margin={{ top: 4, right: 12, bottom: 4, left: -20 }}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} />
          <XAxis dataKey="score" tick={{ fontSize: 12, fill: "#71717a" }} tickLine={false} />
          <YAxis
            allowDecimals={false}
            tick={{ fontSize: 12, fill: "#71717a" }}
            tickLine={false}
            axisLine={false}
          />
          <Tooltip
            formatter={(value: number) => [`${value}명`, "응답 수"]}
            labelFormatter={label => `점수: ${label}`}
            contentStyle={{ fontSize: 12, borderRadius: 8, border: "1px solid #e4e4e7" }}
          />
          <Bar dataKey="count" fill="#8b5cf6" radius={[4, 4, 0, 0]} barSize={32} />
        </BarChart>
      </ResponsiveContainer>

      <div className="grid grid-cols-4 gap-2">
        <StatCard label="평균" value={data.mean} />
        <StatCard label="중앙값" value={data.median} />
        <StatCard label="최솟값" value={data.min} />
        <StatCard label="최댓값" value={data.max} />
      </div>
    </div>
  );
}

function StatCard({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-lg bg-zinc-50 px-3 py-2 text-center">
      <p className="text-xs text-zinc-500">{label}</p>
      <p className="text-sm font-semibold text-zinc-800">{value}</p>
    </div>
  );
}
