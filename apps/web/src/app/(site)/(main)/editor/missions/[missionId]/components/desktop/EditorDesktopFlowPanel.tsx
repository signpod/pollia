"use client";

import { Typo } from "@repo/ui/components";
import { useMemo } from "react";
import { FlowOverviewCanvas } from "../FlowOverviewCanvas";
import { buildFlowOverviewSummary } from "../editor-flow-overview.utils";
import type { EditorFlowAnalysisResult } from "../editor-publish-flow-validation";

interface EditorDesktopFlowPanelProps {
  analysis: EditorFlowAnalysisResult | null;
  isLoading: boolean;
  errorMessage?: string | null;
}

function SummaryItem({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-md border border-zinc-200 bg-zinc-50 px-2.5 py-2">
      <p className="text-[11px] font-medium text-zinc-500">{label}</p>
      <p className="mt-0.5 text-sm font-semibold text-zinc-900">{value}</p>
    </div>
  );
}

export function EditorDesktopFlowPanel({
  analysis,
  isLoading,
  errorMessage,
}: EditorDesktopFlowPanelProps) {
  const summary = useMemo(() => (analysis ? buildFlowOverviewSummary(analysis) : null), [analysis]);

  return (
    <section className="flex h-full min-h-[460px] flex-col overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-[0_10px_40px_rgba(9,9,11,0.08)]">
      <header className="border-b border-zinc-100 px-4 py-3">
        <Typo.Body size="medium" className="font-semibold text-zinc-900">
          플로우 요약
        </Typo.Body>
        <Typo.Body size="small" className="mt-1 text-zinc-500">
          현재 편집 상태 기준 진행 구조
        </Typo.Body>
        {summary && (
          <div className="mt-3 grid grid-cols-3 gap-2">
            <SummaryItem label="질문" value={summary.actionCount} />
            <SummaryItem label="완료" value={summary.completionCount} />
            <SummaryItem label="연결" value={summary.connectionCount} />
          </div>
        )}
      </header>

      <div className="min-h-0 flex-1 p-3">
        {isLoading ? (
          <div className="flex h-full items-center justify-center rounded-xl border border-zinc-200 bg-zinc-50">
            <Typo.Body size="small" className="text-zinc-500">
              플로우 로딩 중...
            </Typo.Body>
          </div>
        ) : errorMessage ? (
          <div className="flex h-full items-center justify-center rounded-xl border border-red-200 bg-red-50 px-4 text-center">
            <Typo.Body size="small" className="text-red-600">
              {errorMessage}
            </Typo.Body>
          </div>
        ) : analysis ? (
          <FlowOverviewCanvas analysis={analysis} variant="compact" />
        ) : (
          <div className="flex h-full items-center justify-center rounded-xl border border-zinc-200 bg-zinc-50 px-4 text-center">
            <Typo.Body size="small" className="text-zinc-500">
              플로우 데이터가 없습니다.
            </Typo.Body>
          </div>
        )}
      </div>
    </section>
  );
}
