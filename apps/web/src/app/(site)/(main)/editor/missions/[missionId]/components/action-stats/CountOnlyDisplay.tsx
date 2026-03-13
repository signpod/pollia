"use client";

import type { CountOnlyActionStats } from "@/types/dto/action-stats";

interface CountOnlyDisplayProps {
  data: CountOnlyActionStats;
}

export function CountOnlyDisplay({ data }: CountOnlyDisplayProps) {
  if (data.totalResponses === 0) {
    return <p className="py-6 text-center text-sm text-zinc-400">응답이 없습니다.</p>;
  }

  return (
    <div className="flex items-center gap-2 rounded-lg bg-zinc-50 px-3 py-2">
      <span className="text-sm text-zinc-500">총 응답 수</span>
      <span className="text-sm font-semibold text-zinc-800">{data.totalResponses}건</span>
    </div>
  );
}
