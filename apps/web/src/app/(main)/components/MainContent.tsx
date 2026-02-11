"use client";

import type { FestivalData } from "@/types/dto/festival";
import PollPollE from "@public/svgs/poll-poll-e.svg";
import { EmptyState } from "@repo/ui/components";
import { Loader2 } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { useInfiniteContent } from "../hooks";
import { type Category, CategoryFilter } from "./CategoryFilter";
import { FestivalCard } from "./FestivalCard";
import { StickyCategoryTab } from "./StickyCategoryTab";
import type { SurveyCardData } from "./SurveyCard";
import { SurveyCard } from "./SurveyCard";

interface MainContentProps {
  initialProjects: SurveyCardData[];
  initialFestivals: FestivalData[];
}

export function MainContent({ initialProjects, initialFestivals }: MainContentProps) {
  const [selectedCategory, setSelectedCategory] = useState<Category>("all");
  const [isCategoryFilterHidden, setIsCategoryFilterHidden] = useState(false);
  const categoryFilterRef = useRef<HTMLDivElement>(null);

  const HEADER_HEIGHT = 48;

  const handleCategoryChange = (category: Category) => {
    setSelectedCategory(category);
    const el = categoryFilterRef.current;
    if (el) {
      const top = el.getBoundingClientRect().top + window.scrollY - HEADER_HEIGHT;
      window.scrollTo({ top, behavior: "instant" });
    }
  };

  useEffect(() => {
    const el = categoryFilterRef.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry) {
          setIsCategoryFilterHidden(!entry.isIntersecting);
        }
      },
      { threshold: 0 },
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, []);

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
      if (item.type === "festival") {
        return selectedCategory === "EVENT";
      }
      return false;
    });
  }, [selectedCategory, mixedContent]);

  return (
    <div className="flex flex-col gap-6">
      <StickyCategoryTab
        selected={selectedCategory}
        onSelect={handleCategoryChange}
        visible={isCategoryFilterHidden}
      />
      <div ref={categoryFilterRef}>
        <CategoryFilter selected={selectedCategory} onSelect={handleCategoryChange} />
      </div>
      {filteredContent.length > 0 ? (
        <>
          <div className="grid grid-cols-2 gap-x-4 gap-y-10 px-5">
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
        <div className="px-5">
          <EmptyState
            icon={<PollPollE className="size-30 text-zinc-200" />}
            title="아직 준비 중이에요"
            description="새로운 컨텐츠가 곧 찾아올 거예요!"
          />
        </div>
      )}
    </div>
  );
}
