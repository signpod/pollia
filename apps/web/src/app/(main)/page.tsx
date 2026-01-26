"use client";

import { useReadFestivals } from "@/hooks/festival";
import { useReadMissions } from "@/hooks/mission";
import { useMemo, useState } from "react";
import { BannerSlider } from "./components/BannerSlider";
import { type Category, CategoryFilter } from "./components/CategoryFilter";
import { FestivalCard } from "./components/FestivalCard";
import type { SurveyCardData } from "./components/SurveyCard";
import { SurveyCard } from "./components/SurveyCard";

function calculateDaysLeft(deadline: Date | null): number {
  if (!deadline) return 99;
  const now = new Date();
  const diff = new Date(deadline).getTime() - now.getTime();
  const days = Math.ceil(diff / (1000 * 60 * 60 * 24));
  return Math.max(0, days);
}

function formatDuration(minutes: number | null): string {
  if (!minutes) return "약 5분";
  if (minutes < 60) return `약 ${minutes}분`;
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return mins > 0 ? `약 ${hours}시간 ${mins}분` : `약 ${hours}시간`;
}

type ContentItem =
  | { type: "project"; data: SurveyCardData }
  | { type: "festival"; data: Parameters<typeof FestivalCard>[0]["festival"] };

export default function MainPage() {
  const [selectedCategory, setSelectedCategory] = useState<Category>("all");

  const { data: missionData, isLoading: isMissionLoading } = useReadMissions({
    options: { limit: 8 },
  });
  const { data: festivalData, isLoading: isFestivalLoading } = useReadFestivals({
    numOfRows: 8,
  });

  const isLoading = isMissionLoading || isFestivalLoading;

  const missions = missionData?.pages.flatMap((page) => page.data) ?? [];
  const festivals = festivalData?.data ?? [];

  const projects: SurveyCardData[] = missions.map((mission) => ({
    id: mission.id,
    title: mission.title,
    description: mission.description ?? "",
    imageUrl: mission.imageUrl ?? "/images/default-survey.png",
    duration: formatDuration(mission.estimatedMinutes),
    daysLeft: calculateDaysLeft(mission.deadline),
    reward: null,
    currentParticipants: 0,
    maxParticipants: mission.maxParticipants ?? 100,
  }));

  const mixedContent: ContentItem[] = useMemo(() => {
    const items: ContentItem[] = [];

    projects.forEach((project) => {
      items.push({ type: "project", data: project });
    });

    festivals.forEach((festival) => {
      items.push({ type: "festival", data: festival });
    });

    // 섞기: 랜덤하게 섞지 않고 번갈아가면서 배치
    const result: ContentItem[] = [];
    const projectItems = items.filter((item) => item.type === "project");
    const festivalItems = items.filter((item) => item.type === "festival");

    const maxLen = Math.max(projectItems.length, festivalItems.length);
    for (let i = 0; i < maxLen; i++) {
      const project = projectItems[i];
      const festival = festivalItems[i];
      if (project) result.push(project);
      if (festival) result.push(festival);
    }

    return result;
  }, [projects, festivals]);

  // TODO: 카테고리 필터링 - DB에 category 필드 추가 후 구현
  const filteredContent = useMemo(() => {
    if (selectedCategory === "all") {
      return mixedContent;
    }
    // 추후 카테고리별 필터링 구현
    return mixedContent;
  }, [selectedCategory, mixedContent]);

  return (
    <main className="min-h-screen bg-light">
      <BannerSlider />

      <div className="mx-auto max-w-7xl px-4 pb-16 sm:px-6">
        {/* 카테고리 필터 */}
        <div className="mb-6">
          <CategoryFilter selected={selectedCategory} onSelect={setSelectedCategory} />
        </div>

        {/* 컨텐츠 그리드 */}
        {isLoading && (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="h-72 animate-pulse rounded-xl bg-zinc-100" />
            ))}
          </div>
        )}

        {!isLoading && filteredContent.length > 0 && (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {filteredContent.map((item) =>
              item.type === "project" ? (
                <SurveyCard key={`project-${item.data.id}`} survey={item.data} />
              ) : (
                <FestivalCard key={`festival-${item.data.id}`} festival={item.data} />
              )
            )}
          </div>
        )}

        {!isLoading && filteredContent.length === 0 && (
          <div className="rounded-lg border border-default bg-white p-12 text-center text-sm text-sub">
            현재 진행 중인 컨텐츠가 없습니다.
          </div>
        )}
      </div>
    </main>
  );
}
