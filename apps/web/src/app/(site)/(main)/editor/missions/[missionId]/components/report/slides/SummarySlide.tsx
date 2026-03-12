"use client";

import type { AiReportData } from "@/types/dto";
import { Typo } from "@repo/ui/components";
import { Clock, Share2, Target, Users } from "lucide-react";
import type { LucideIcon } from "lucide-react";

interface SummarySlideProps {
  data: AiReportData;
}

function formatDuration(seconds: number | null): string {
  if (seconds === null) return "-";
  if (seconds < 60) return `${Math.round(seconds)}초`;
  const mins = Math.floor(seconds / 60);
  const secs = Math.round(seconds % 60);
  return secs > 0 ? `${mins}분 ${secs}초` : `${mins}분`;
}

interface KpiCardProps {
  icon: LucideIcon;
  label: string;
  value: string;
}

function KpiCard({ icon: Icon, label, value }: KpiCardProps) {
  return (
    <div className="flex items-center gap-3 rounded-xl border border-zinc-100 bg-zinc-50/50 px-4 py-3.5">
      <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-violet-100">
        <Icon className="size-4 text-violet-600" />
      </div>
      <div>
        <div className="text-xs text-zinc-400">{label}</div>
        <div className="text-lg font-semibold text-zinc-800">{value}</div>
      </div>
    </div>
  );
}

export function SummarySlide({ data }: SummarySlideProps) {
  const { kpis } = data.stats;

  return (
    <div className="flex h-full flex-col px-7 py-7">
      <SlideHeader title="핵심 요약" index={1} />
      <div className="mb-5 rounded-xl border-l-2 border-violet-400 bg-zinc-50/80 py-3.5 pl-4 pr-4">
        <Typo.Body size="medium" className="whitespace-pre-line leading-relaxed text-zinc-600">
          {data.ai.summary}
        </Typo.Body>
      </div>
      <div className="grid grid-cols-2 gap-2.5">
        <KpiCard icon={Users} label="총 참여자" value={`${kpis.totalParticipants}명`} />
        <KpiCard icon={Target} label="완주율" value={`${kpis.completionRate.toFixed(1)}%`} />
        <KpiCard
          icon={Clock}
          label="평균 소요 시간"
          value={formatDuration(kpis.avgDurationSeconds)}
        />
        <KpiCard
          icon={Share2}
          label="공유 수"
          value={kpis.shareCount !== null ? `${kpis.shareCount}회` : "-"}
        />
      </div>
    </div>
  );
}

function SlideHeader({ title, index }: { title: string; index: number }) {
  return (
    <div className="mb-5 flex items-center gap-2.5">
      <span className="flex size-6 items-center justify-center rounded-md bg-violet-600 text-xs font-bold text-white">
        {index}
      </span>
      <Typo.SubTitle>{title}</Typo.SubTitle>
    </div>
  );
}
