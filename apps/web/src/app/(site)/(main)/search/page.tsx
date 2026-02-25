import { missionService } from "@/server/services/mission";
import { MissionType } from "@prisma/client";
import { Suspense } from "react";
import type { SurveyCardData } from "../components/SurveyCard";
import { calculateDaysLeft, formatDuration } from "../utils";
import { SearchContent } from "./components/SearchContent";
import { RECOMMENDED_MISSIONS_LIMIT } from "./constants";

export const dynamic = "force-dynamic";

function toSurveyCardData(
  missions: Awaited<ReturnType<typeof missionService.getAllMissions>>,
): SurveyCardData[] {
  return missions.map(mission => ({
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
}

interface SearchPageProps {
  searchParams: Promise<{ q?: string }>;
}

export default async function SearchPage({ searchParams }: SearchPageProps) {
  const params = await searchParams;
  const initialQuery = params.q ?? null;

  let recommended: SurveyCardData[] = [];
  try {
    const missions = await missionService.getAllMissions({
      limit: RECOMMENDED_MISSIONS_LIMIT,
      type: MissionType.GENERAL,
    });
    recommended = toSurveyCardData(missions);
  } catch (error) {
    console.error("[SearchPage] missionService.getAllMissions failed:", error);
  }

  return (
    <Suspense
      fallback={
        <main className="min-h-screen bg-white px-5 py-8">
          <div className="h-12 rounded-full bg-zinc-100" />
        </main>
      }
    >
      <SearchContent initialQuery={initialQuery} recommendedMissions={recommended} />
    </Suspense>
  );
}
