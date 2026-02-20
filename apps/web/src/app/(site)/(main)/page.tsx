import { getFestivals } from "@/actions/festival";
import { missionService } from "@/server/services/mission";
import { MissionType } from "@prisma/client";
import { BannerSlider } from "./components/BannerSlider";
import { MainContent } from "./components/MainContent";
import type { SurveyCardData } from "./components/SurveyCard";
import { ITEMS_PER_PAGE } from "./constants";
import { calculateDaysLeft, formatDuration } from "./utils";

export const dynamic = "force-dynamic";

export default async function MainPage() {
  const [missions, festivalResponse] = await Promise.all([
    missionService.getAllMissions({ limit: ITEMS_PER_PAGE, type: MissionType.GENERAL }),
    getFestivals({ numOfRows: ITEMS_PER_PAGE }),
  ]);

  const projects: SurveyCardData[] = missions.map(mission => ({
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

  const festivals = festivalResponse.data;

  return (
    <main className="min-h-screen bg-white pb-10 flex flex-col gap-6">
      <BannerSlider />
      <MainContent initialProjects={projects} initialFestivals={festivals} />
    </main>
  );
}
