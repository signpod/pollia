import { getFestivals } from "@/actions/festival";
import { ChannelTalk } from "@/components/common/ChannelTalk";
import { missionService } from "@/server/services/mission";
import { BannerSlider } from "./components/BannerSlider";
import { MainContent } from "./components/MainContent";
import type { SurveyCardData } from "./components/SurveyCard";
import { ITEMS_PER_PAGE } from "./constants";
import { calculateDaysLeft, formatDuration } from "./utils";

export const revalidate = 60;

export default async function MainPage() {
  const [missions, festivalResponse] = await Promise.all([
    missionService.getAllMissions({ limit: ITEMS_PER_PAGE }),
    getFestivals({ numOfRows: ITEMS_PER_PAGE }),
  ]);

  const projects: SurveyCardData[] = missions.map((mission) => ({
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
  }));

  const festivals = festivalResponse.data;

  return (
    <main className="min-h-screen bg-light">
      <BannerSlider />
      <MainContent initialProjects={projects} initialFestivals={festivals} />
      <ChannelTalk />
    </main>
  );
}
