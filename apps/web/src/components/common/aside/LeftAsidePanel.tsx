"use client";

import PolliaWordmark from "@public/svgs/pollia-wordmark.svg";
import { Tooltip, Typo } from "@repo/ui/components";
import { useState } from "react";

// TODO: 실제 링크 연결 필요
export function LeftAsidePanel() {
  const [activeTooltip, setActiveTooltip] = useState<string | null>(null);

  const comingSoonProps = (id: string) =>
    ({
      "data-tooltip-id": id,
      onMouseEnter: () => setActiveTooltip(id),
      onMouseLeave: () => setActiveTooltip(null),
      onClick: () => setActiveTooltip(prev => (prev === id ? null : id)),
    }) as const;

  return (
    <div className="flex w-56 flex-col gap-3">
      <div className="flex flex-col gap-3 rounded-xl border border-zinc-100 bg-white p-4">
        <PolliaWordmark className="h-4 w-auto self-start" />
        <Typo.Body size="small" className="text-zinc-900">
          세상에서 가장 재밌는
          <br />
          리서치 콘텐츠 플랫폼
        </Typo.Body>
        <button
          type="button"
          {...comingSoonProps("aside-intro")}
          className="flex cursor-not-allowed items-center justify-center rounded-lg bg-zinc-100 py-2 opacity-60"
        >
          <Typo.Body size="small" className="font-bold text-zinc-600">
            서비스 소개
          </Typo.Body>
        </button>
      </div>

      {activeTooltip && (
        <Tooltip id={activeTooltip} placement="top">
          <Typo.Body size="small" className="text-zinc-600 whitespace-nowrap">
            준비중이에요! 조금만 기다려주세요 😊
          </Typo.Body>
        </Tooltip>
      )}
    </div>
  );
}
