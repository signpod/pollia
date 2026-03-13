"use client";

import type { ChoiceActionStats } from "@/types/dto/action-stats";
import { Bar, BarChart, CartesianGrid, Cell, ResponsiveContainer, XAxis, YAxis } from "recharts";

interface ChoiceBarChartProps {
  data: ChoiceActionStats;
}

const BAR_HEIGHT = 36;
const CHART_PADDING = 40;

export function ChoiceBarChart({ data }: ChoiceBarChartProps) {
  if (data.totalResponses === 0) {
    return <p className="py-6 text-center text-sm text-zinc-400">응답이 없습니다.</p>;
  }

  const chartHeight = data.options.length * BAR_HEIGHT + CHART_PADDING;

  return (
    <ResponsiveContainer width="100%" height={chartHeight}>
      <BarChart
        data={data.options}
        layout="vertical"
        margin={{ top: 4, right: 60, bottom: 4, left: 0 }}
      >
        <CartesianGrid strokeDasharray="3 3" horizontal={false} />
        <XAxis type="number" hide />
        <YAxis
          type="category"
          dataKey="label"
          width={120}
          tick={{ fontSize: 12, fill: "#71717a" }}
          tickLine={false}
          axisLine={false}
        />
        <Bar dataKey="count" radius={[0, 4, 4, 0]} barSize={20} label={renderBarLabel}>
          {data.options.map(entry => (
            <Cell key={entry.label} fill="#8b5cf6" fillOpacity={0.8} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}

function renderBarLabel(props: {
  x: number;
  y: number;
  width: number;
  height: number;
  value: number;
  index: number;
}) {
  const { x, y, width, height, value } = props;
  return (
    <text x={x + width + 6} y={y + height / 2} dy={4} fontSize={11} fill="#71717a">
      {value}
    </text>
  );
}
