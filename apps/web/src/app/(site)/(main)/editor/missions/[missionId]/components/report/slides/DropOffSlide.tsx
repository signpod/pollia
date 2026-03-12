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
    <div className="flex h-full flex-col px-7 py-7">
      <div className="mb-5 flex items-center gap-2.5">
        <span className="flex size-6 items-center justify-center rounded-md bg-violet-600 text-xs font-bold text-white">
          3
        </span>
        <Typo.SubTitle>이탈 분석</Typo.SubTitle>
      </div>

      {chartData.length > 0 && (
        <div className="mb-4 h-[200px] rounded-xl bg-zinc-50/60 p-2">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="#f4f4f5" />
              <XAxis type="number" tick={{ fontSize: 11 }} stroke="#d4d4d8" allowDecimals={false} />
              <YAxis
                dataKey="name"
                type="category"
                tick={{ fontSize: 11 }}
                stroke="#d4d4d8"
                width={90}
              />
              <Tooltip
                contentStyle={{ borderRadius: 8, border: "1px solid #e4e4e7", fontSize: 12 }}
              />
              <Bar dataKey="응답" fill="#7c3aed" stackId="a" radius={[0, 0, 0, 0]} />
              <Bar dataKey="이탈" fill="#ede9fe" stackId="a" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      {data.ai.dropOffAnalysis && (
        <div className="rounded-xl border-l-2 border-violet-400 bg-zinc-50/80 py-3 pl-4 pr-4">
          <div className="mb-1 text-xs font-semibold text-violet-600">AI 분석</div>
          <Typo.Body size="medium" className="whitespace-pre-line leading-relaxed text-zinc-600">
            {data.ai.dropOffAnalysis}
          </Typo.Body>
        </div>
      )}
    </div>
  );
}
