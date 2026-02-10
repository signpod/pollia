"use client";

import type { FestivalData } from "@/types/dto/festival";
import { Inbox, Loader2 } from "lucide-react";
import { useMemo, useState } from "react";
import { useInfiniteContent } from "../hooks";
import { type Category, CategoryFilter } from "./CategoryFilter";
import { FestivalCard } from "./FestivalCard";
import type { SurveyCardData } from "./SurveyCard";
import { SurveyCard } from "./SurveyCard";

interface MainContentProps {
  initialProjects: SurveyCardData[];
  initialFestivals: FestivalData[];
}

export function MainContent({ initialProjects, initialFestivals }: MainContentProps) {
  const [selectedCategory, setSelectedCategory] = useState<Category>("all");

  const { mixedContent, isLoadingMore, hasNextPage, observerRef } = useInfiniteContent({
    initialProjects,
    initialFestivals,
  });

  const filteredContent = useMemo(() => {
    if (selectedCategory === "all") {
      return mixedContent;
    }
    return mixedContent.filter(item => {
      if (item.type === "project") {
        return item.data.category === selectedCategory;
      }
      return false;
    });
  }, [selectedCategory, mixedContent]);

  return (
    <div className="mx-auto max-w-7xl px-4 pb-16 sm:px-6">
      <div className="mb-6">
        <CategoryFilter selected={selectedCategory} onSelect={setSelectedCategory} />
      </div>

      {filteredContent.length > 0 ? (
        <>
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {filteredContent.map(item =>
              item.type === "project" ? (
                <SurveyCard key={`project-${item.data.id}`} survey={item.data} />
              ) : (
                <FestivalCard key={`festival-${item.data.id}`} festival={item.data} />
              ),
            )}
          </div>

          <div ref={observerRef} className="mt-8 flex h-10 justify-center">
            {isLoadingMore ? (
              <Loader2 className="size-6 animate-spin text-violet-500" />
            ) : !hasNextPage ? (
              <p className="text-sm text-sub">모든 컨텐츠를 불러왔어요</p>
            ) : null}
          </div>
        </>
      ) : (
        <div className="flex flex-col items-center justify-center rounded-xl border border-default bg-white py-16">
          <div className="mb-4 flex size-16 items-center justify-center rounded-full bg-zinc-100">
            <Inbox className="size-8 text-zinc-400" />
          </div>
          <p className="text-sm text-sub">진행 중인 컨텐츠가 없어요</p>
        </div>
      )}
    </div>
  );
}
