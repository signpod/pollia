"use client";

import type { AiReportData } from "@/types/dto";
import { Typo } from "@repo/ui/components";
import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";

interface ResultDistributionSlideProps {
  data: AiReportData;
}

const COLORS = ["#7c3aed", "#8b5cf6", "#a78bfa", "#c4b5fd", "#ddd6fe", "#ede9fe"];

export function ResultDistributionSlide({ data }: ResultDistributionSlideProps) {
  const { resultDistribution } = data.stats;

  if (resultDistribution.length === 0) {
    return (
      <div className="flex h-full flex-col items-center justify-center px-7 py-7">
        <div className="mb-5 flex items-center gap-2.5">
          <span className="flex size-6 items-center justify-center rounded-md bg-violet-600 text-xs font-bold text-white">
            6
          </span>
          <Typo.SubTitle>결과 유형 분포</Typo.SubTitle>
        </div>
        <Typo.Body size="medium" className="text-zinc-400">
          완료 화면 데이터가 없습니다.
        </Typo.Body>
      </div>
    );
  }

  const chartData = resultDistribution.map(r => ({
    name: r.title,
    value: r.count,
  }));

  return (
    <div className="flex h-full flex-col px-7 py-7">
      <div className="mb-5 flex items-center gap-2.5">
        <span className="flex size-6 items-center justify-center rounded-md bg-violet-600 text-xs font-bold text-white">
          6
        </span>
        <Typo.SubTitle>결과 유형 분포</Typo.SubTitle>
      </div>
      <div className="flex flex-1 items-center justify-center">
        <div className="h-[210px] w-[210px]">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={chartData}
                cx="50%"
                cy="50%"
                innerRadius={50}
                outerRadius={90}
                dataKey="value"
                strokeWidth={2}
                stroke="#fff"
                label={({ name, percent }) =>
                  `${name.length > 6 ? `${name.slice(0, 6)}..` : name} ${(percent * 100).toFixed(0)}%`
                }
                labelLine={false}
              >
                {chartData.map((_, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{ borderRadius: 8, border: "1px solid #e4e4e7", fontSize: 12 }}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>
      <div className="mt-3 space-y-2">
        {resultDistribution.map((r, i) => (
          <div key={r.completionId} className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-2">
              <div
                className="size-3 rounded-full"
                style={{ backgroundColor: COLORS[i % COLORS.length] }}
              />
              <span className="text-zinc-600">{r.title}</span>
            </div>
            <span className="tabular-nums text-zinc-400">
              {r.count}명 ({r.rate.toFixed(1)}%)
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
