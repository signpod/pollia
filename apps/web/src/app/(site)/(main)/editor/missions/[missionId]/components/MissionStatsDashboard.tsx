"use client";

import { useGenerateMissionAiReport, useMissionAiReport } from "@/hooks/ai";
import { useReadMissionResponsesPage, useReadMissionStats } from "@/hooks/mission-response";
import { formatDateToHHMM, formatDateToYYYYMMDD } from "@/lib/date";
import type { ColumnDef } from "@/server/services/submission-list";
import type { ActionType } from "@prisma/client";
import { Typo } from "@repo/ui/components";
import { useQueryClient } from "@tanstack/react-query";
import { Sparkles } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import Markdown from "react-markdown";
import remarkGfm from "remark-gfm";

interface MissionStatsDashboardProps {
  missionId: string;
}

const DEFAULT_PAGE_SIZE = 20;

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
      <section className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        <StatCard
          title="총 참여자 수"
          value={stats ? `${stats.total}명` : "-"}
          isLoading={statsQuery.isPending}
        />
        <StatCard
          title="완료자 수"
          value={stats ? `${stats.completed}명` : "-"}
          isLoading={statsQuery.isPending}
        />
        <StatCard
          title="완주율"
          value={stats ? `${stats.completionRate.toFixed(1)}%` : "-"}
          isLoading={statsQuery.isPending}
        />
      </section>

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

  const savedReport = reportQuery.data?.data.report;
  const isGenerating = generateMutation.isPending;

  return (
    <section className="rounded-xl border border-zinc-200 bg-white p-5">
      <div className="flex items-center justify-between">
        <Typo.SubTitle>AI 통계 분석 리포트</Typo.SubTitle>
        <button
          type="button"
          disabled={isGenerating || !hasResponses}
          onClick={() => generateMutation.mutate(missionId)}
          className="flex items-center gap-1.5 rounded-lg bg-zinc-900 px-3 py-1.5 text-sm font-medium text-white transition-colors hover:bg-zinc-800 disabled:cursor-not-allowed disabled:opacity-40"
        >
          <Sparkles className="size-4" />
          {isGenerating ? "생성 중..." : savedReport ? "다시 생성" : "리포트 생성"}
        </button>
      </div>

      {generateMutation.error && (
        <div className="mt-3 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {generateMutation.error.message}
        </div>
      )}

      {!savedReport && !isGenerating && (
        <Typo.Body size="medium" className="mt-3 text-zinc-500">
          {hasResponses
            ? "AI가 응답 데이터를 분석하여 핵심 인사이트 리포트를 생성합니다."
            : "응답 데이터가 있어야 리포트를 생성할 수 있습니다."}
        </Typo.Body>
      )}

      {isGenerating && (
        <div className="mt-4 flex items-center gap-2 text-sm text-zinc-500">
          <div className="size-4 animate-spin rounded-full border-2 border-zinc-300 border-t-zinc-600" />
          응답 데이터를 분석하고 있습니다. 잠시만 기다려주세요.
        </div>
      )}

      {savedReport && !isGenerating && (
        <div className="prose prose-sm prose-zinc mt-4 max-w-none">
          <Markdown remarkPlugins={[remarkGfm]}>{savedReport}</Markdown>
        </div>
      )}
    </section>
  );
}
