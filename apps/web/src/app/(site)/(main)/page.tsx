import { bannerService } from "@/server/services/banner/bannerService";
import { missionService } from "@/server/services/mission";
import { MissionCategory, MissionType } from "@prisma/client";
import { BannerSlider } from "./components/BannerSlider";
import { CurationSection } from "./components/CurationSection";
import { toSurveyCardData } from "./utils";

export const dynamic = "force-dynamic";

export default async function MainPage() {
  const [testMissionsRaw, researchMissionsRaw, banners] = await Promise.all([
    missionService.getAllMissions({
      limit: 6,
      type: MissionType.GENERAL,
      category: MissionCategory.TEST,
      isActive: true,
    }),
    missionService.getAllMissions({
      limit: 6,
      type: MissionType.GENERAL,
      category: MissionCategory.RESEARCH,
      isActive: true,
    }),
    bannerService.listBanners(),
  ]);

  const testMissions = testMissionsRaw.map(toSurveyCardData);
  const researchMissions = researchMissionsRaw.map(toSurveyCardData);

  const bannerSlides = banners.map(b => ({
    id: b.id,
    imageUrl: b.imageUrl,
    title: b.title,
    subtitle: b.subtitle,
    linkUrl: b.linkUrl,
  }));

  return (
    <main className="flex flex-1 flex-col bg-white pb-10">
      <BannerSlider slides={bannerSlides} />
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
