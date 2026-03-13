"use client";

import { useGenerateMissionAiReport, useMissionAiReport } from "@/hooks/ai";
import { useReadMissionResponsesPage, useReadMissionStats } from "@/hooks/mission-response";
import { formatDateToHHMM, formatDateToYYYYMMDD } from "@/lib/date";
import { formatMillisecondsToKorean } from "@/lib/utils";
import type { ColumnDef } from "@/server/services/submission-list/types";
import type { ActionType } from "@prisma/client";
import { Typo } from "@repo/ui/components";
import { useQueryClient } from "@tanstack/react-query";
import { BarChart3, RefreshCw, Sparkles } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { AiReportSlideViewer } from "./report/AiReportSlideViewer";
import { ResultDistributionAccordion } from "./stats/ResultDistributionAccordion";
import { StatsDetailAccordion } from "./stats/StatsDetailAccordion";

const DEFAULT_PAGE_SIZE = 20;

interface MissionStatsDashboardProps {
  missionId: string;
}

export function MissionStatsDashboard({ missionId }: MissionStatsDashboardProps) {
  const [page, setPage] = useState(1);

  const statsQuery = useReadMissionStats(missionId);
  const responsesQuery = useReadMissionResponsesPage(missionId, {
    page,
    pageSize: DEFAULT_PAGE_SIZE,
  });

  const stats = statsQuery.data?.data;
  const responseData = responsesQuery.data?.data;
  const pagination = responseData?.pagination;
  const rows = responseData?.rows ?? [];
  const columns = responseData?.columns ?? [];
  useEffect(() => {
    if (!pagination) return;
    if (pagination.totalPages > 0 && page > pagination.totalPages) {
      setPage(pagination.totalPages);
    }
  }, [pagination, page]);

  const pageItems = useMemo(() => {
    const totalPages = pagination?.totalPages ?? 0;
    if (totalPages <= 1) return [];
    if (totalPages <= 7) {
      return Array.from({ length: totalPages }, (_, index) => index + 1);
    }

    const items: Array<number | "ellipsis"> = [1];
    const start = Math.max(2, page - 1);
    const end = Math.min(totalPages - 1, page + 1);

    if (start > 2) {
      items.push("ellipsis");
    }

    for (let value = start; value <= end; value++) {
      items.push(value);
    }

    if (end < totalPages - 1) {
      items.push("ellipsis");
    }

    items.push(totalPages);
    return items;
  }, [pagination?.totalPages, page]);

  const isInitialLoading = statsQuery.isPending || responsesQuery.isPending;

  return (
    <div className="space-y-4 px-5 py-5">
      <section className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <StatCard
          title="총 참여수"
          value={stats ? `${stats.total}명` : "-"}
          isLoading={statsQuery.isPending}
        />
        <StatCard
          title="완주율"
          value={stats ? `${stats.completionRate.toFixed(1)}%` : "-"}
          isLoading={statsQuery.isPending}
        />
        <StatCard
          title="평균 소요시간"
          value={
            stats?.averageDurationMs ? formatMillisecondsToKorean(stats.averageDurationMs) : "-"
          }
          isLoading={statsQuery.isPending}
        />
        <StatCard
          title="공유 수"
          value={stats ? `${stats.shareCount}회` : "-"}
          isLoading={statsQuery.isPending}
        />
      </section>

      <StatsDetailAccordion missionId={missionId} />
      <ResultDistributionAccordion missionId={missionId} />

      <section className="rounded-xl border border-zinc-200 bg-white p-5">
        <div className="mb-4 flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <Typo.SubTitle>Raw Data</Typo.SubTitle>
            <Typo.Body size="medium" className="mt-1 text-zinc-500">
              닉네임, 응답 시간, 질문별 답변을 확인할 수 있습니다.
            </Typo.Body>
          </div>
          <Typo.Body size="small" className="text-zinc-500">
            총 {pagination?.totalRows ?? 0}건 / 페이지 {pagination?.page ?? 1}
          </Typo.Body>
        </div>

        {isInitialLoading && (
          <div className="rounded-lg border border-dashed border-zinc-200 px-4 py-10 text-center text-sm text-zinc-500">
            데이터를 불러오는 중입니다.
          </div>
        )}

        {!isInitialLoading && (statsQuery.error || responsesQuery.error) && (
          <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-6 text-sm text-red-700">
            {statsQuery.error?.message ??
              responsesQuery.error?.message ??
              "통계 데이터를 불러오지 못했습니다."}
          </div>
        )}

        {!isInitialLoading && !statsQuery.error && !responsesQuery.error && rows.length === 0 && (
          <div className="rounded-lg border border-dashed border-zinc-200 px-4 py-10 text-center text-sm text-zinc-500">
            아직 참여한 응답 데이터가 없습니다.
          </div>
        )}

        {!isInitialLoading && !statsQuery.error && !responsesQuery.error && rows.length > 0 && (
          <>
            <div className="overflow-x-auto rounded-lg border border-zinc-200">
              <table className="min-w-full border-collapse text-left text-sm">
                <thead className="bg-zinc-50">
                  <tr>
                    <th className="whitespace-nowrap border-b border-zinc-200 px-3 py-2 font-medium text-zinc-700">
                      닉네임
                    </th>
                    <th className="whitespace-nowrap border-b border-zinc-200 px-3 py-2 font-medium text-zinc-700">
                      응답 시간
                    </th>
                    {columns.map(column => (
                      <th
                        key={column.id}
                        className="min-w-[160px] whitespace-nowrap border-b border-zinc-200 px-3 py-2 font-medium text-zinc-700"
                      >
                        {column.title}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {rows.map(row => (
                    <tr key={row.id} className="border-b border-zinc-100 last:border-0">
                      <td className="whitespace-nowrap px-3 py-2 font-medium text-zinc-800">
                        {row.user.name && row.user.name.trim().length > 0
                          ? row.user.name
                          : "게스트"}
                      </td>
                      <td className="whitespace-nowrap px-3 py-2 text-zinc-700">
                        {formatResponseDateTime(row.responseAt)}
                      </td>
                      {columns.map(column => {
                        const answer = row.answers.find(value => value.actionId === column.id);
                        return (
                          <td key={`${row.id}-${column.id}`} className="px-3 py-2 text-zinc-700">
                            {formatAnswerValue(answer?.value, column)}
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {pagination && pagination.totalPages > 1 && (
              <div className="mt-4 flex items-center justify-center gap-1">
                <button
                  type="button"
                  className="rounded-md border border-zinc-200 px-3 py-1.5 text-sm text-zinc-600 disabled:cursor-not-allowed disabled:opacity-40"
                  onClick={() => setPage(previous => Math.max(1, previous - 1))}
                  disabled={page <= 1 || responsesQuery.isFetching}
                >
                  이전
                </button>
                {pageItems.map((item, idx) => {
                  if (item === "ellipsis") {
                    return (
                      <span key={`ellipsis-${idx}`} className="px-2 text-sm text-zinc-400">
                        ...
                      </span>
                    );
                  }

                  return (
                    <button
                      type="button"
                      key={item}
                      className={`min-w-8 rounded-md border px-2 py-1.5 text-sm ${
                        page === item
                          ? "border-zinc-900 bg-zinc-900 text-white"
                          : "border-zinc-200 text-zinc-700"
                      }`}
                      onClick={() => setPage(item)}
                      disabled={responsesQuery.isFetching}
                    >
                      {item}
                    </button>
                  );
                })}
                <button
                  type="button"
                  className="rounded-md border border-zinc-200 px-3 py-1.5 text-sm text-zinc-600 disabled:cursor-not-allowed disabled:opacity-40"
                  onClick={() => setPage(previous => previous + 1)}
                  disabled={page >= pagination.totalPages || responsesQuery.isFetching}
                >
                  다음
                </button>
              </div>
            )}
          </>
        )}
      </section>

      <AiReportSection missionId={missionId} hasResponses={rows.length > 0} />
    </div>
  );
}

function StatCard({
  title,
  value,
  isLoading,
}: { title: string; value: string; isLoading: boolean }) {
  return (
    <div className="rounded-xl border border-zinc-200 bg-white p-4">
      <Typo.Body size="small" className="text-zinc-500">
        {title}
      </Typo.Body>
      <Typo.SubTitle className="mt-1 text-2xl">{isLoading ? "..." : value}</Typo.SubTitle>
    </div>
  );
}

function formatResponseDateTime(value: Date | string): string {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return "-";
  }

  return `${formatDateToYYYYMMDD(date)} ${formatDateToHHMM(date)}`;
}

function formatAnswerValue(value: string | null | undefined, column: ColumnDef) {
  if (value === null || value === undefined || value === "") {
    return <span className="text-zinc-400">-</span>;
  }

  if (column.type === "DATE") {
    return formatDateToYYYYMMDD(value);
  }

  if (column.type === "TIME") {
    return formatDateToHHMM(value);
  }

  if (isFileType(column.type)) {
    return (
      <a href={value} target="_blank" rel="noopener noreferrer" className="text-blue-600 underline">
        파일 보기
      </a>
    );
  }

  if (value.length > 80) {
    return <span title={value}>{value.slice(0, 80)}...</span>;
  }

  return value;
}

function isFileType(type: ActionType): boolean {
  return type === "IMAGE" || type === "VIDEO" || type === "PDF";
}

function AiReportSection({
  missionId,
  hasResponses,
}: { missionId: string; hasResponses: boolean }) {
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

  return (
    <StatsAccordion
      icon={Sparkles}
      title="AI 리포트"
      badge={
        reportData ? (
          <span className="rounded-full bg-violet-100 px-2 py-0.5 text-xs font-medium text-violet-600">
            생성됨
          </span>
        ) : null
      }
    >
      {isLoading ? (
        <div className="flex items-center justify-center px-5 py-20">
          <div className="size-6 animate-spin rounded-full border-2 border-violet-200 border-t-violet-600" />
        </div>
      ) : isGenerating ? (
        <div className="flex flex-col items-center justify-center px-5 py-24">
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
        <div className="px-5 py-5">
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
        <div className="flex flex-col items-center justify-center px-5 py-20">
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
    </StatsAccordion>
  );
}
