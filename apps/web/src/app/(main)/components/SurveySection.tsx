"use client";

import { useReadMissions } from "@/hooks/mission";
import ProjectIcon from "@public/svgs/project-icon.svg";
import { SectionHeader } from "./SectionHeader";
import type { SurveyCardData } from "./SurveyCard";
import { SurveyCard } from "./SurveyCard";

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

export function SurveySection() {
  const { data, isLoading, error } = useReadMissions({ options: { limit: 4 } });

  const missions = data?.pages.flatMap(page => page.data) ?? [];

  const surveys: SurveyCardData[] = missions.slice(0, 4).map(mission => ({
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
