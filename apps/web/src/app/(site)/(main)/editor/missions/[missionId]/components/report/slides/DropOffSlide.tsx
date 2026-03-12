"use client";

import type { AiReportData } from "@/types/dto";
import { Typo } from "@repo/ui/components";
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

interface DropOffSlideProps {
  data: AiReportData;
}

export function DropOffSlide({ data }: DropOffSlideProps) {
  const { funnel } = data.stats;

  const chartData = funnel.map(f => {
    const dropOff = f.entryCount > 0 ? f.entryCount - f.responseCount : 0;
    return {
      name: f.actionTitle.length > 10 ? `${f.actionTitle.slice(0, 10)}...` : f.actionTitle,
      이탈: dropOff,
      응답: f.responseCount,
    };
  });

  return (
    <div className="flex h-full flex-col px-6 py-6">
      <Typo.SubTitle className="mb-4">이탈 분석</Typo.SubTitle>

      {chartData.length > 0 && (
        <div className="mb-4 h-[200px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="#f4f4f5" />
              <XAxis type="number" tick={{ fontSize: 11 }} stroke="#a1a1aa" allowDecimals={false} />
              <YAxis
                dataKey="name"
                type="category"
                tick={{ fontSize: 11 }}
                stroke="#a1a1aa"
                width={90}
              />
              <Tooltip />
              <Bar dataKey="응답" fill="#18181b" stackId="a" radius={[0, 0, 0, 0]} />
              <Bar dataKey="이탈" fill="#fca5a5" stackId="a" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      {data.ai.dropOffAnalysis && (
        <div className="rounded-lg bg-zinc-50 p-4">
          <Typo.Body size="small" className="mb-1 font-medium text-zinc-600">
            AI 분석
          </Typo.Body>
          <Typo.Body size="medium" className="whitespace-pre-line leading-relaxed text-zinc-700">
            {data.ai.dropOffAnalysis}
          </Typo.Body>
        </div>
      )}
    </div>
  );
}
