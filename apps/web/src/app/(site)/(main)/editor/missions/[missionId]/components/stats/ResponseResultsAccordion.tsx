"use client";

import { useReadMissionResponsesPage } from "@/hooks/mission-response";
import { formatDateToHHMM, formatDateToYYYYMMDD } from "@/lib/date";
import type { ColumnDef } from "@/server/services/submission-list/types";
import type { ActionType } from "@prisma/client";
import { Typo } from "@repo/ui/components";
import { ChevronDown } from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";

const PAGE_SIZE = 20;

interface ResponseResultsAccordionProps {
  missionId: string;
}

export function ResponseResultsAccordion({ missionId }: ResponseResultsAccordionProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [page, setPage] = useState(1);

  const { data, isPending, error, isFetching } = useReadMissionResponsesPage(missionId, {
    page,
    pageSize: PAGE_SIZE,
  });

  const responseData = data?.data;
  const pagination = responseData?.pagination;
  const rows = responseData?.rows ?? [];
  const columns = responseData?.columns ?? [];

  const handleToggle = useCallback(() => {
    setIsOpen(prev => !prev);
  }, []);

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

    if (start > 2) items.push("ellipsis");
    for (let value = start; value <= end; value++) items.push(value);
    if (end < totalPages - 1) items.push("ellipsis");

    items.push(totalPages);
    return items;
  }, [pagination?.totalPages, page]);

  const totalRows = pagination?.totalRows ?? 0;

  return (
    <section className="rounded-xl border border-zinc-200 bg-white">
      <button
        type="button"
        onClick={handleToggle}
        className="flex w-full items-center justify-between px-5 py-4"
      >
        <div className="flex items-center gap-2">
          <Typo.SubTitle>참여 결과</Typo.SubTitle>
          {totalRows > 0 && (
            <span className="rounded-full bg-zinc-100 px-2 py-0.5 text-xs font-medium text-zinc-600">
              {totalRows}건
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
          {isPending && (
            <div className="flex h-[180px] items-center justify-center text-sm text-zinc-500">
              데이터를 불러오는 중입니다.
            </div>
          )}

          {!isPending && error && (
            <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              참여 결과 데이터를 불러오지 못했습니다.
            </div>
          )}

          {!isPending && !error && rows.length === 0 && (
            <div className="flex h-[180px] items-center justify-center text-sm text-zinc-500">
              아직 참여한 응답 데이터가 없습니다.
            </div>
          )}

          {!isPending && !error && rows.length > 0 && (
            <>
              <div className="mb-2 text-right">
                <Typo.Body size="small" className="text-zinc-500">
                  페이지 {pagination?.page ?? 1} / {pagination?.totalPages ?? 1}
                </Typo.Body>
              </div>

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
                    disabled={page <= 1 || isFetching}
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
                        disabled={isFetching}
                      >
                        {item}
                      </button>
                    );
                  })}
                  <button
                    type="button"
                    className="rounded-md border border-zinc-200 px-3 py-1.5 text-sm text-zinc-600 disabled:cursor-not-allowed disabled:opacity-40"
                    onClick={() => setPage(previous => previous + 1)}
                    disabled={page >= pagination.totalPages || isFetching}
                  >
                    다음
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      )}
    </section>
  );
}

function formatResponseDateTime(value: Date | string): string {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "-";
  return `${formatDateToYYYYMMDD(date)} ${formatDateToHHMM(date)}`;
}

function formatAnswerValue(value: string | null | undefined, column: ColumnDef) {
  if (value === null || value === undefined || value === "") {
    return <span className="text-zinc-400">-</span>;
  }

  if (column.type === "DATE") return formatDateToYYYYMMDD(value);
  if (column.type === "TIME") return formatDateToHHMM(value);

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
