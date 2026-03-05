import { missionService } from "@/server/services/mission";
import { MissionCategory, MissionType } from "@prisma/client";
import { BannerSlider } from "./components/BannerSlider";
import { CurationSection } from "./components/CurationSection";
import { toSurveyCardData } from "./utils";

export const dynamic = "force-dynamic";

export default async function MainPage() {
  const [testMissionsRaw, researchMissionsRaw] = await Promise.all([
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
  ]);

  const testMissions = testMissionsRaw.map(toSurveyCardData);
  const researchMissions = researchMissionsRaw.map(toSurveyCardData);

  return (
    <main className="flex min-h-screen flex-col bg-white pb-10">
      <BannerSlider />
      <div className="flex flex-col gap-10 pt-10">
        <CurationSection
          title="인기 심리 테스트"
          description="지금 가장 핫한 심리/유형 테스트"
          missions={testMissions}
          viewAllHref="/curation/TEST"
        />
        <CurationSection
          title="설문 & 리서치"
          description="참여하고 의견을 나눠보세요"
          missions={researchMissions}
          viewAllHref="/curation/RESEARCH"
        />
      </div>
    </main>
  );
}
