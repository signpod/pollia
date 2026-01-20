"use client";

import type { MyMissionResponse } from "@/types/dto/mission-response";
import { Tab, Typo } from "@repo/ui/components";
import { ChevronLeftIcon, ChevronRightIcon } from "lucide-react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useCallback } from "react";
import { CompletedEventCard } from "./CompletedEventCard";
import { EmptyState } from "./EmptyState";
import { InProgressEventCard } from "./InProgressEventCard";

const ITEMS_PER_PAGE = 6;

function PlaceholderCard() {
  return (
    <div
      className="flex w-full items-center gap-4 rounded-2xl border border-transparent p-4"
      aria-hidden
    >
      <div className="h-20 aspect-[2/3] shrink-0" />
      <div className="min-w-0 flex-1" />
    </div>
  );
}

interface EventSectionProps {
  inProgressResponses: MyMissionResponse[];
  completedResponses: MyMissionResponse[];
}

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

function Pagination({ currentPage, totalPages, onPageChange }: PaginationProps) {
  if (totalPages <= 1) return null;

  return (
    <div className="mt-4 flex items-center justify-center gap-2">
      <button
        type="button"
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className="flex h-8 w-8 items-center justify-center rounded-lg border border-zinc-200 disabled:opacity-40"
      >
        <ChevronLeftIcon className="size-4 text-zinc-600" />
      </button>
      <span className="px-2 text-sm text-zinc-600">
        {currentPage} / {totalPages}
      </span>
      <button
        type="button"
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        className="flex h-8 w-8 items-center justify-center rounded-lg border border-zinc-200 disabled:opacity-40"
      >
        <ChevronRightIcon className="size-4 text-zinc-600" />
      </button>
    </div>
  );
}

export function EventSection({ inProgressResponses, completedResponses }: EventSectionProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const inProgressPage = Number(searchParams.get("ip")) || 1;
  const completedPage = Number(searchParams.get("cp")) || 1;

  const inProgressTotalPages = Math.ceil(inProgressResponses.length / ITEMS_PER_PAGE);
  const completedTotalPages = Math.ceil(completedResponses.length / ITEMS_PER_PAGE);

  const createQueryString = useCallback(
    (name: string, value: string) => {
      const params = new URLSearchParams(searchParams.toString());
      params.set(name, value);
      return params.toString();
    },
    [searchParams],
  );

  const setInProgressPage = (page: number) => {
    router.push(`${pathname}?${createQueryString("ip", String(page))}`, { scroll: false });
  };

  const setCompletedPage = (page: number) => {
    router.push(`${pathname}?${createQueryString("cp", String(page))}`, { scroll: false });
  };

  const paginatedInProgress = inProgressResponses.slice(
    (inProgressPage - 1) * ITEMS_PER_PAGE,
    inProgressPage * ITEMS_PER_PAGE,
  );

  const paginatedCompleted = completedResponses.slice(
    (completedPage - 1) * ITEMS_PER_PAGE,
    completedPage * ITEMS_PER_PAGE,
  );

  return (
    <section>
      <Typo.MainTitle size="small" className="mb-3">
        나의 이벤트
      </Typo.MainTitle>
      <Tab.Root initialTab="in-progress" id="me-events-tab">
        <Tab.List>
          <Tab.Item value="in-progress">
            <Typo.Body size="large">진행중 ({inProgressResponses.length})</Typo.Body>
          </Tab.Item>
          <Tab.Item value="completed">
            <Typo.Body size="large">완료 ({completedResponses.length})</Typo.Body>
          </Tab.Item>
        </Tab.List>
        <Tab.Content value="in-progress">
          <div className="flex flex-col gap-3">
            {paginatedInProgress.length > 0 ? (
              <>
                {paginatedInProgress.map(response => (
                  <InProgressEventCard key={response.id} response={response} />
                ))}
                {Array.from({ length: ITEMS_PER_PAGE - paginatedInProgress.length }).map((_, i) => (
                  <PlaceholderCard key={`placeholder-${i}`} />
                ))}
              </>
            ) : (
              <EmptyState message="진행중인 이벤트가 없어요" />
            )}
          </div>
          <Pagination
            currentPage={inProgressPage}
            totalPages={inProgressTotalPages}
            onPageChange={setInProgressPage}
          />
        </Tab.Content>
        <Tab.Content value="completed">
          <div className="flex flex-col gap-3">
            {paginatedCompleted.length > 0 ? (
              <>
                {paginatedCompleted.map(response => (
                  <CompletedEventCard key={response.id} response={response} />
                ))}
                {Array.from({ length: ITEMS_PER_PAGE - paginatedCompleted.length }).map((_, i) => (
                  <PlaceholderCard key={`placeholder-${i}`} />
                ))}
              </>
            ) : (
              <EmptyState message="완료한 이벤트가 없어요" />
            )}
          </div>
          <Pagination
            currentPage={completedPage}
            totalPages={completedTotalPages}
            onPageChange={setCompletedPage}
          />
        </Tab.Content>
      </Tab.Root>
    </section>
  );
}
