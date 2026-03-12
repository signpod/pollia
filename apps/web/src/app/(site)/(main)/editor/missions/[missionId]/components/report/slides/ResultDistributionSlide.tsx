"use client";

import type { AiReportData } from "@/types/dto";
import { Typo } from "@repo/ui/components";
import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";

interface ResultDistributionSlideProps {
  data: AiReportData;
}

const COLORS = ["#18181b", "#3f3f46", "#71717a", "#a1a1aa", "#d4d4d8", "#e4e4e7"];

export function ResultDistributionSlide({ data }: ResultDistributionSlideProps) {
  const { resultDistribution } = data.stats;

  if (resultDistribution.length === 0) {
    return (
      <div className="flex h-full flex-col items-center justify-center px-6 py-6">
        <Typo.SubTitle className="mb-2">결과 유형 분포</Typo.SubTitle>
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
    <div className="flex h-full flex-col px-6 py-6">
      <Typo.SubTitle className="mb-4">결과 유형 분포</Typo.SubTitle>
      <div className="flex flex-1 items-center justify-center">
        <div className="h-[220px] w-[220px]">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={chartData}
                cx="50%"
                cy="50%"
                outerRadius={90}
                dataKey="value"
                label={({ name, percent }) =>
                  `${name.length > 6 ? `${name.slice(0, 6)}..` : name} ${(percent * 100).toFixed(0)}%`
                }
                labelLine={false}
              >
                {chartData.map((_, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>
      <div className="mt-4 space-y-1.5">
        {resultDistribution.map((r, i) => (
          <div key={r.completionId} className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-2">
              <div
                className="size-3 rounded-sm"
                style={{ backgroundColor: COLORS[i % COLORS.length] }}
              />
              <span className="text-zinc-700">{r.title}</span>
            </div>
            <span className="text-zinc-500">
              {r.count}명 ({r.rate.toFixed(1)}%)
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
