"use client";

import { useReadMissions } from "@/hooks/mission";
import ProjectIcon from "@public/svgs/project-icon.svg";
import { calculateDaysLeft, formatDuration } from "../utils";
import { SectionHeader } from "./SectionHeader";
import type { SurveyCardData } from "./SurveyCard";
import { SurveyCard } from "./SurveyCard";

export function SurveySection() {
  const { data, isLoading, error } = useReadMissions({ options: { limit: 4 } });

  const missions = data?.pages.flatMap(page => page.data) ?? [];

  const surveys: SurveyCardData[] = missions.slice(0, 4).map(mission => ({
    id: mission.id,
    title: mission.title,
    description: mission.description ?? "",
    imageUrl: mission.imageUrl ?? "",
    duration: formatDuration(mission.estimatedMinutes),
    daysLeft: calculateDaysLeft(mission.deadline),
    reward: null,
    currentParticipants: 0,
    maxParticipants: mission.maxParticipants ?? 100,
    category: mission.category,
    createdAt: mission.createdAt.toISOString(),
    isActive: mission.isActive,
    deadline: mission.deadline?.toISOString() ?? null,
    startDate: (mission as unknown as { startDate?: Date }).startDate?.toISOString() ?? null,
  }));

  const totalCount = missions.length;

  return (
    <section className="bg-white rounded-xl p-6 flex flex-col gap-6">
      <SectionHeader
        icon={<ProjectIcon className="size-5" />}
        title="진행 중인 프로젝트"
        count={totalCount}
        href="/me"
        iconBgClass="bg-violet-50"
      />

      {isLoading && (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-72 animate-pulse rounded-xl bg-zinc-100" />
          ))}
        </div>
      )}

      {error && (
        <div className="rounded-lg border border-default bg-light p-8 text-center text-sm text-sub">
          로그인 후 설문조사를 확인할 수 있습니다.
        </div>
      )}

      {!isLoading && !error && surveys.length > 0 && (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {surveys.map(survey => (
            <SurveyCard key={survey.id} survey={survey} />
          ))}
        </div>
      )}

      {!isLoading && !error && surveys.length === 0 && (
        <div className="rounded-lg border border-default bg-light p-8 text-center text-sm text-sub">
          현재 진행 중인 설문조사가 없습니다.
        </div>
      )}
    </section>
  );
}
