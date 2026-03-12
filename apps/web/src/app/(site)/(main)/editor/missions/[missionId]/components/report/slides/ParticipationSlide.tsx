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
    <div className="flex h-full flex-col px-6 py-6">
      <Typo.SubTitle className="mb-4">참여 현황</Typo.SubTitle>

      {trendData.length > 0 && (
        <div className="mb-6">
          <Typo.Body size="small" className="mb-2 text-zinc-500">
            일별 참여 추이
          </Typo.Body>
          <div className="h-[140px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={trendData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f4f4f5" />
                <XAxis dataKey="date" tick={{ fontSize: 11 }} stroke="#a1a1aa" />
                <YAxis tick={{ fontSize: 11 }} stroke="#a1a1aa" allowDecimals={false} />
                <Tooltip />
                <Line
                  type="monotone"
                  dataKey="count"
                  stroke="#7c3aed"
                  strokeWidth={2}
                  dot={{ r: 3, fill: "#7c3aed" }}
                  name="참여자"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {funnelData.length > 0 && (
        <div>
          <Typo.Body size="small" className="mb-2 text-zinc-500">
            참여 퍼널 (진입 / 응답)
          </Typo.Body>
          <div className="h-[160px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={funnelData} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="#f4f4f5" />
                <XAxis
                  type="number"
                  tick={{ fontSize: 11 }}
                  stroke="#a1a1aa"
                  allowDecimals={false}
                />
                <YAxis
                  dataKey="name"
                  type="category"
                  tick={{ fontSize: 11 }}
                  stroke="#a1a1aa"
                  width={80}
                />
                <Tooltip />
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
