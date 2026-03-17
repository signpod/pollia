"use client";

import type { ChoiceActionStats } from "@/types/dto/action-stats";
import { Bar, BarChart, CartesianGrid, Cell, ResponsiveContainer, XAxis, YAxis } from "recharts";

interface ChoiceBarChartProps {
  data: ChoiceActionStats;
}

const BAR_HEIGHT = 36;
const CHART_PADDING = 40;
const Y_AXIS_WIDTH = 120;
const FONT_SIZE = 12;
const LINE_HEIGHT = 16;
const MAX_LINES = 2;

function splitLabel(text: string, maxWidth: number): string[] {
  const charWidth = (char: string) =>
    /[\u3000-\u9fff\uac00-\ud7af]/.test(char) ? FONT_SIZE : FONT_SIZE * 0.6;

  const lines: string[] = [];
  let currentLine = "";
  let currentWidth = 0;

  for (const char of text) {
    const w = charWidth(char);
    if (currentWidth + w > maxWidth && currentLine) {
      lines.push(currentLine);
      currentLine = char;
      currentWidth = w;
    } else {
      currentLine += char;
      currentWidth += w;
    }
  }
  if (currentLine) lines.push(currentLine);

  if (lines.length > MAX_LINES) {
    const lastLine = lines[MAX_LINES - 1] ?? "";
    lines.length = MAX_LINES;
    lines[MAX_LINES - 1] = `${lastLine.slice(0, -1)}…`;
  }

  return lines;
}

function renderYAxisTick(props: { x: number; y: number; payload: { value: string } }) {
  const { x, y, payload } = props;
  const lines = splitLabel(payload.value, Y_AXIS_WIDTH - 12);

  return (
    <g transform={`translate(${x},${y})`}>
      <title>{payload.value}</title>
      {lines.map((line, i) => (
        <text
          key={i}
          x={0}
          y={0}
          dy={i * LINE_HEIGHT - ((lines.length - 1) * LINE_HEIGHT) / 2 + 4}
          textAnchor="end"
          fontSize={FONT_SIZE}
          fill="#71717a"
        >
          {line}
        </text>
      ))}
    </g>
  );
}

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
          width={Y_AXIS_WIDTH}
          tick={renderYAxisTick}
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
