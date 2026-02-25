import { serverInstance as rollbar } from "@/rollbar";
import { missionService } from "@/server/services/mission";
import { MissionType } from "@prisma/client";
import { BannerSlider } from "./components/BannerSlider";
import { MainContent } from "./components/MainContent";
import type { SurveyCardData } from "./components/SurveyCard";
import { ITEMS_PER_PAGE } from "./constants";
import { calculateDaysLeft, formatDuration } from "./utils";

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

export default async function MainPage() {
  let projects: SurveyCardData[];

  try {
    const missions = await missionService.getAllMissions({
      limit: ITEMS_PER_PAGE,
      type: MissionType.GENERAL,
    });
    projects = toSurveyCardData(missions);
  } catch (error) {
    console.error("[MainPage] missionService.getAllMissions failed:", error);
    rollbar.error(error);
    projects = [];
  }

  return (
    <main className="min-h-screen bg-white pb-10 flex flex-col gap-6">
      <BannerSlider />
      <MainContent initialProjects={projects} />
    </main>
  );
}
