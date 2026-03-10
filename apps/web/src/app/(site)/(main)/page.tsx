import { missionService } from "@/server/services/mission";
import { MissionCategory, MissionType } from "@prisma/client";
import { BannerSlider } from "./components/BannerSlider";
import { CurationSection } from "./components/CurationSection";
import { toSurveyCardData } from "./utils";

export const dynamic = "force-dynamic";

const FEATURED_MISSION_IDS = ["cmmiuqm3h000hkz040g6ywtia", "cmme8bjkt0003jm04g04tdw8v"];

export default async function MainPage() {
  const [testMissionsRaw, researchMissionsRaw, ...bannerMissions] = await Promise.all([
    missionService.getAllMissions({
      limit: 6,
      type: MissionType.GENERAL,
      category: MissionCategory.TEST,
    }),
    missionService.getAllMissions({
      limit: 6,
      type: MissionType.GENERAL,
      category: MissionCategory.RESEARCH,
    }),
    ...FEATURED_MISSION_IDS.map(id => missionService.getMission(id).catch(() => null)),
  ]);

  const featuredMissions = (
    bannerMissions as (Awaited<ReturnType<typeof missionService.getMission>> | null)[]
  )
    .filter((m): m is NonNullable<typeof m> => m !== null && m.imageUrl !== null)
    .map(m => ({ id: m.id, imageUrl: m.imageUrl! }));

  const testMissions = testMissionsRaw.filter(m => m.isActive).map(toSurveyCardData);
  const researchMissions = researchMissionsRaw.filter(m => m.isActive).map(toSurveyCardData);

  return (
    <main className="flex min-h-screen flex-col bg-white pb-10">
      <BannerSlider missions={featuredMissions} />
      <div className="flex flex-col gap-10 pt-10">
        <CurationSection
          title="인기 심리 테스트"
          description="지금 가장 핫한 심리/유형 테스트"
          missions={testMissions}
          viewAllHref={testMissions.length >= 6 ? "/curation/TEST" : undefined}
        />
        <CurationSection
          title="설문 & 리서치"
          description="참여하고 의견을 나눠보세요"
          missions={researchMissions}
          viewAllHref={researchMissions.length >= 6 ? "/curation/RESEARCH" : undefined}
        />
      </div>
    </main>
  );
}
