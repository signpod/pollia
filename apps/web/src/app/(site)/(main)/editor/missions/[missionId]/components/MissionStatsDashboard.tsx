"use client";

import { useGenerateMissionAiReport, useMissionAiReport } from "@/hooks/ai";
import { Typo } from "@repo/ui/components";
import { useQueryClient } from "@tanstack/react-query";
import { RefreshCw, Sparkles } from "lucide-react";
import { AiReportSlideViewer } from "./report/AiReportSlideViewer";

interface MissionStatsDashboardProps {
  missionId: string;
}

export function MissionStatsDashboard({ missionId }: MissionStatsDashboardProps) {
  const queryClient = useQueryClient();
  const reportQuery = useMissionAiReport(missionId);
  const generateMutation = useGenerateMissionAiReport({
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["mission-ai-report", missionId],
      });
    },
  });

  const reportData = reportQuery.data?.data.reportData ?? null;
  const isGenerating = generateMutation.isPending;
  const isLoading = reportQuery.isPending;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center px-5 py-20">
        <div className="size-5 animate-spin rounded-full border-2 border-zinc-300 border-t-zinc-600" />
      </div>
    );
  }

  if (isGenerating) {
    return (
      <div className="flex flex-col items-center justify-center px-5 py-20">
        <div className="mb-4 size-8 animate-spin rounded-full border-2 border-zinc-300 border-t-zinc-600" />
        <Typo.Body size="medium" className="text-center text-zinc-600">
          AI가 데이터를 분석하여 리포트를 작성 중입니다.
        </Typo.Body>
        <Typo.Body size="small" className="mt-1 text-zinc-400">
          약 10~20초 정도 소요됩니다.
        </Typo.Body>
      </div>
    );
  }

  if (reportData) {
    return (
      <div className="space-y-4 px-5 py-5">
        <div className="flex items-center justify-end">
          <button
            type="button"
            onClick={() => generateMutation.mutate(missionId)}
            className="flex items-center gap-1.5 rounded-lg border border-zinc-200 px-3 py-1.5 text-sm font-medium text-zinc-600 transition-colors hover:bg-zinc-50"
          >
            <RefreshCw className="size-3.5" />
            다시 생성
          </button>
        </div>
        <AiReportSlideViewer data={reportData} />
        {generateMutation.error && (
          <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {generateMutation.error.message}
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center px-5 py-20">
      <Typo.Body size="medium" className="mb-6 text-center text-zinc-500">
        AI 리포트를 생성하면
        <br />
        데이터 분석 결과를 확인할 수 있습니다.
      </Typo.Body>
      <button
        type="button"
        onClick={() => generateMutation.mutate(missionId)}
        className="flex items-center gap-1.5 rounded-lg bg-zinc-900 px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-zinc-800"
      >
        <Sparkles className="size-4" />
        AI 리포트 생성
      </button>
      {generateMutation.error && (
        <div className="mt-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {generateMutation.error.message}
        </div>
      )}
    </div>
  );
}
