"use client";

import PollPollE from "@public/svgs/poll-poll-e.svg";
import { EmptyState } from "@repo/ui/components";
import { Loader2 } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { useInfiniteContent } from "../hooks";
import { type Category, CategoryFilter } from "./CategoryFilter";
import { StickyCategoryTab } from "./StickyCategoryTab";
import type { SurveyCardData } from "./SurveyCard";
import { SurveyCard } from "./SurveyCard";

interface MainContentProps {
  initialProjects: SurveyCardData[];
}

export function MainContent({ initialProjects }: MainContentProps) {
  const [selectedCategory, setSelectedCategory] = useState<Category>("all");
  const categoryFilterRef = useRef<HTMLDivElement>(null);
  const stickyRef = useRef<HTMLDivElement>(null);
  const HEADER_HEIGHT = 48;

  const handleStickyCategoryChange = (category: Category) => {
    setSelectedCategory(category);
    const el = categoryFilterRef.current;
    if (el) {
      const top =
        el.getBoundingClientRect().top + window.scrollY - HEADER_HEIGHT + el.offsetHeight / 2 + 4;
      window.scrollTo({ top, behavior: "instant" });
    }
  };

  useEffect(() => {
    const el = categoryFilterRef.current;
    const sticky = stickyRef.current;
    if (!el || !sticky) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry) {
          const hidden = !entry.isIntersecting;
          sticky.style.opacity = hidden ? "1" : "0";
          sticky.style.pointerEvents = hidden ? "auto" : "none";
        }
      },
      { threshold: 0.5, rootMargin: `-${HEADER_HEIGHT}px 0px 0px 0px` },
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const { mixedContent, isLoadingMore, hasNextPage, observerRef } = useInfiniteContent({
    initialProjects,
  });

  const filteredContent = useMemo(() => {
    if (selectedCategory === "all") {
      return mixedContent;
    }
    return mixedContent.filter(item => item.data.category === selectedCategory);
  }, [selectedCategory, mixedContent]);

  return (
    <div className="flex flex-col gap-6">
      <StickyCategoryTab
        containerRef={stickyRef}
        selected={selectedCategory}
        onSelect={handleStickyCategoryChange}
      />
      <div ref={categoryFilterRef}>
        <CategoryFilter selected={selectedCategory} onSelect={setSelectedCategory} />
      </div>
      {filteredContent.length > 0 ? (
        <>
          <div className="grid grid-cols-2 gap-x-4 gap-y-10 px-5 md:grid-cols-3">
            {filteredContent.map(item => (
              <SurveyCard key={`project-${item.data.id}`} survey={item.data} />
            ))}
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
