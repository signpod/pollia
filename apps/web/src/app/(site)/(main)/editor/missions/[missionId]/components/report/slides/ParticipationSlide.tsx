"use client";

import type { AiReportData } from "@/types/dto";
import { Typo } from "@repo/ui/components";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

interface ParticipationSlideProps {
  data: AiReportData;
}

export function ParticipationSlide({ data }: ParticipationSlideProps) {
  const { dailyTrend, funnel } = data.stats;

  const trendData = dailyTrend.map(d => ({
    date: d.date.slice(5),
    count: d.count,
  }));

  const funnelData = funnel.map(f => ({
    name: f.actionTitle.length > 8 ? `${f.actionTitle.slice(0, 8)}...` : f.actionTitle,
    진입: f.entryCount,
    응답: f.responseCount,
  }));

  return (
    <div className="flex h-full flex-col px-7 py-7">
      <div className="mb-5 flex items-center gap-2.5">
        <span className="flex size-6 items-center justify-center rounded-md bg-violet-600 text-xs font-bold text-white">
          2
        </span>
        <Typo.SubTitle>참여 현황</Typo.SubTitle>
      </div>

      {trendData.length > 0 && (
        <div className="mb-5">
          <div className="mb-2 text-xs font-medium text-zinc-400">일별 참여 추이</div>
          <div className="h-[140px] rounded-xl bg-zinc-50/60 p-2">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={trendData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f4f4f5" />
                <XAxis dataKey="date" tick={{ fontSize: 11 }} stroke="#d4d4d8" />
                <YAxis tick={{ fontSize: 11 }} stroke="#d4d4d8" allowDecimals={false} />
                <Tooltip
                  contentStyle={{ borderRadius: 8, border: "1px solid #e4e4e7", fontSize: 12 }}
                />
                <Line
                  type="monotone"
                  dataKey="count"
                  stroke="#7c3aed"
                  strokeWidth={2}
                  dot={{ r: 3, fill: "#7c3aed", strokeWidth: 0 }}
                  activeDot={{ r: 5, fill: "#7c3aed" }}
                  name="참여자"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {funnelData.length > 0 && (
        <div>
          <div className="mb-2 text-xs font-medium text-zinc-400">참여 퍼널 (진입 / 응답)</div>
          <div className="h-[160px] rounded-xl bg-zinc-50/60 p-2">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={funnelData} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="#f4f4f5" />
                <XAxis
                  type="number"
                  tick={{ fontSize: 11 }}
                  stroke="#d4d4d8"
                  allowDecimals={false}
                />
                <YAxis
                  dataKey="name"
                  type="category"
                  tick={{ fontSize: 11 }}
                  stroke="#d4d4d8"
                  width={80}
                />
                <Tooltip
                  contentStyle={{ borderRadius: 8, border: "1px solid #e4e4e7", fontSize: 12 }}
                />
                <Bar dataKey="진입" fill="#ddd6fe" radius={[0, 4, 4, 0]} />
                <Bar dataKey="응답" fill="#7c3aed" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}
    </div>
  );
}
