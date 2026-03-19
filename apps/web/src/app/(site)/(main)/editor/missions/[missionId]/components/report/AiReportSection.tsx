"use client";

import { useGenerateMissionAiReport, useMissionAiReport } from "@/hooks/ai";
import { Typo } from "@repo/ui/components";
import { useQueryClient } from "@tanstack/react-query";
import { BarChart3, ChevronDown, Download, Loader2, RefreshCw, Sparkles } from "lucide-react";
import { useCallback, useRef, useState } from "react";
import { AiReportSlideViewer } from "./AiReportSlideViewer";

interface AiReportSectionProps {
  missionId: string;
  hasResponses: boolean;
}

export function AiReportSection({ missionId, hasResponses: _hasResponses }: AiReportSectionProps) {
  const [isOpen, setIsOpen] = useState(false);
  const queryClient = useQueryClient();
  const reportQuery = useMissionAiReport(missionId);
  const generateMutation = useGenerateMissionAiReport({
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["mission-ai-report", missionId],
      });
    },
  });

  const exportPdfRef = useRef<(() => Promise<void>) | null>(null);
  const [isExporting, setIsExporting] = useState(false);

  const reportData = reportQuery.data?.data.reportData ?? null;
  const isGenerating = generateMutation.isPending;
  const isLoading = reportQuery.isPending;

  const handleToggle = useCallback(() => {
    setIsOpen(prev => !prev);
  }, []);

  return (
    <section>
      <button
        type="button"
        onClick={handleToggle}
        className="flex w-full items-center justify-between px-5 py-4"
      >
        <div className="flex items-center gap-2">
          <Typo.SubTitle>AI 리포트</Typo.SubTitle>
          <Sparkles className="size-4 text-violet-500" />
          {reportData && (
            <span className="rounded-full bg-violet-100 px-2 py-0.5 text-xs font-medium text-violet-600">
              생성됨
            </span>
          )}
        </div>
        <ChevronDown
          className={`size-5 text-zinc-500 transition-transform duration-200 ${
            isOpen ? "rotate-180" : ""
          }`}
        />
      </button>

      {isOpen && (
        <div className="px-5 pb-5">
          {isLoading ? (
            <div className="flex h-[180px] items-center justify-center text-sm text-zinc-500">
              데이터를 불러오는 중입니다.
            </div>
          ) : isGenerating ? (
            <div className="flex flex-col items-center justify-center py-20">
              <div className="mb-5 flex size-14 items-center justify-center rounded-2xl bg-violet-50">
                <div className="size-6 animate-spin rounded-full border-2 border-violet-200 border-t-violet-600" />
              </div>
              <Typo.SubTitle className="mb-1.5 text-zinc-800">리포트 생성 중</Typo.SubTitle>
              <Typo.Body size="medium" className="text-center text-zinc-500">
                AI가 데이터를 분석하여 리포트를 작성 중입니다.
                <br />약 10~20초 정도 소요됩니다.
              </Typo.Body>
            </div>
          ) : reportData ? (
            <div>
              <div className="mb-4 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => exportPdfRef.current?.()}
                  disabled={isExporting}
                  className="flex items-center gap-1.5 rounded-lg border border-zinc-200 px-3 py-1.5 text-xs font-medium text-zinc-500 transition-colors hover:border-zinc-300 hover:text-zinc-700 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {isExporting ? (
                    <Loader2 className="size-3 animate-spin" />
                  ) : (
                    <Download className="size-3" />
                  )}
                  PDF 저장
                </button>
                <button
                  type="button"
                  onClick={() => generateMutation.mutate(missionId)}
                  className="flex items-center gap-1.5 rounded-lg border border-zinc-200 px-3 py-1.5 text-xs font-medium text-zinc-500 transition-colors hover:border-zinc-300 hover:text-zinc-700"
                >
                  <RefreshCw className="size-3" />
                  다시 생성
                </button>
              </div>
              <AiReportSlideViewer
                data={reportData}
                onExportRef={exportPdfRef}
                onExportingChange={setIsExporting}
              />
              {generateMutation.error && (
                <div className="mt-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                  {generateMutation.error.message}
                </div>
              )}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-16">
              <div className="mb-5 flex size-14 items-center justify-center rounded-2xl bg-violet-50">
                <BarChart3 className="size-7 text-violet-500" />
              </div>
              <Typo.SubTitle className="mb-1.5 text-zinc-800">아직 리포트가 없습니다</Typo.SubTitle>
              <Typo.Body size="medium" className="mb-7 text-center text-zinc-500">
                AI 리포트를 생성하면
                <br />
                데이터 분석 결과를 확인할 수 있습니다.
              </Typo.Body>
              <button
                type="button"
                onClick={() => generateMutation.mutate(missionId)}
                className="flex items-center gap-2 rounded-xl bg-violet-600 px-6 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-violet-700"
              >
                <Sparkles className="size-4" />
                AI 리포트 생성
              </button>
              {generateMutation.error && (
                <div className="mt-5 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                  {generateMutation.error.message}
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </section>
  );
}
