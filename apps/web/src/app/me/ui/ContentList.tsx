"use client";

import { Survey } from "@prisma/client";
import { List } from "./List";
import { SurveyQuestionSummary } from "@/types/domain/survey";
import { useEffect, useRef, useMemo } from "react";
import { Button, Typo } from "@repo/ui/components";
import { Loader2Icon } from "lucide-react";
import { cn } from "@repo/ui/lib";
import { DraftFilterType, SortOrderType } from "@/atoms/me/searchAtoms";

export function ContentList({
  items,
  baseHref,
  hasNextPage,
  fetchNextPage,
  isFetchingNextPage,
  searchQuery = "",
  draftFilter = "all",
  sortOrder = "latest",
}: {
  items:
    | SurveyQuestionSummary[]
    | Pick<
        Survey,
        "id" | "title" | "description" | "imageUrl" | "createdAt" | "updatedAt"
      >[];
  baseHref: string;
  hasNextPage: boolean;
  fetchNextPage: () => void;
  isFetchingNextPage: boolean;
  searchQuery?: string;
  draftFilter?: DraftFilterType;
  sortOrder?: SortOrderType;
}) {
  const observerTarget = useRef<HTMLDivElement>(null);

  const filteredAndSortedItems = useMemo(() => {
    const filtered = items.filter((item) => {
      const matchesSearch = item.title
        .toLowerCase()
        .includes(searchQuery.toLowerCase());

      if ("isDraft" in item) {
        if (draftFilter === "used") {
          return matchesSearch && !item.isDraft;
        }
        if (draftFilter === "unused") {
          return matchesSearch && item.isDraft;
        }
      }

      return matchesSearch;
    });

    if (filtered.length > 0 && filtered[0] && "createdAt" in filtered[0]) {
      return [...filtered].sort((a, b) => {
        const dateA = new Date(a.createdAt).getTime();
        const dateB = new Date(b.createdAt).getTime();
        return sortOrder === "latest" ? dateB - dateA : dateA - dateB;
      });
    }

    return filtered;
  }, [items, searchQuery, draftFilter, sortOrder]);

  useEffect(() => {
    const currentTarget = observerTarget.current;
    if (!currentTarget) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting && hasNextPage && !isFetchingNextPage) {
          fetchNextPage();
        }
      },
      { threshold: 0.1 }
    );

    observer.observe(currentTarget);

    return () => {
      if (currentTarget) {
        observer.unobserve(currentTarget);
      }
    };
  }, [hasNextPage, fetchNextPage, isFetchingNextPage]);

  return (
    <List.Root>
      <List.Content>
        {filteredAndSortedItems?.map((item) => (
          <div
            key={item.id}
            className={cn(
              "flex gap-3 px-5 items-start",
              "hover:bg-violet-50 transition-colors duration-200"
            )}
          >
            <List.Item
              key={item.id}
              title={item.title}
              href={`${baseHref}/${item.id}`}
              createdAt={item.createdAt}
              leadingIcon={"isDraft" in item ? <UsedTag item={item} /> : null}
              className="flex-1"
            />
          </div>
        ))}
      </List.Content>

      {hasNextPage && (
        <div ref={observerTarget} className="py-4 text-center">
          {isFetchingNextPage ? (
            <div className="flex items-center justify-center">
              <Loader2Icon className="size-12 text-zinc-300 animate-spin" />
            </div>
          ) : (
            <Button onClick={fetchNextPage} variant="secondary">
              더 보기
            </Button>
          )}
        </div>
      )}
    </List.Root>
  );
}

function UsedTag({
  item,
}: {
  item:
    | SurveyQuestionSummary
    | Pick<
        Survey,
        "id" | "title" | "description" | "imageUrl" | "createdAt" | "updatedAt"
      >;
}) {
  const isDraft = "isDraft" in item ? item.isDraft : false;
  const text = isDraft ? "미사용" : "사용";

  return (
    <div
      className={cn(
        "px-2 py-1 rounded-full text-center ring-1 ring-transparent",
        isDraft ? "bg-gray-100 text-gray-600" : "bg-violet-100 text-violet-600"
      )}
    >
      <Typo.Body size="small">{text}</Typo.Body>
    </div>
  );
}
