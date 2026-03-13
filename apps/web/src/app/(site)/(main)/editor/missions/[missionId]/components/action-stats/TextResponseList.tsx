"use client";

import type { TextActionStats } from "@/types/dto/action-stats";
import { useState } from "react";

interface TextResponseListProps {
  data: TextActionStats;
}

const PAGE_SIZE = 5;

export function TextResponseList({ data }: TextResponseListProps) {
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);

  if (data.totalResponses === 0) {
    return <p className="py-6 text-center text-sm text-zinc-400">응답이 없습니다.</p>;
  }

  const visibleSamples = data.samples.slice(0, visibleCount);
  const hasMore = visibleCount < data.samples.length;

  return (
    <div className="space-y-2">
      <ul className="space-y-1.5">
        {visibleSamples.map((sample, i) => (
          <li
            key={`${data.actionId}-${i}`}
            className="rounded-lg bg-zinc-50 px-3 py-2 text-sm text-zinc-700"
          >
            {sample}
          </li>
        ))}
      </ul>
      {hasMore && (
        <button
          type="button"
          onClick={() => setVisibleCount(v => v + PAGE_SIZE)}
          className="w-full rounded-lg border border-zinc-200 py-1.5 text-xs font-medium text-zinc-500 transition-colors hover:border-zinc-300 hover:text-zinc-700"
        >
          더보기 ({data.samples.length - visibleCount}개 남음)
        </button>
      )}
    </div>
  );
}
