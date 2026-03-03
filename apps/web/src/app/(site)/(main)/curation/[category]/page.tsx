import { missionService } from "@/server/services/mission";
import { MissionCategory, MissionType } from "@prisma/client";
import { notFound } from "next/navigation";
import { CurationSection } from "../../components/CurationSection";
import { toSurveyCardData } from "../../utils";

const CURATION_META: Record<MissionCategory, { title: string; description: string }> = {
  [MissionCategory.TEST]: {
    title: "인기 심리 테스트",
    description: "지금 가장 핫한 심리/유형 테스트",
  },
  [MissionCategory.RESEARCH]: {
    title: "설문 & 리서치",
    description: "참여하고 의견을 나눠보세요",
  },
  [MissionCategory.EVENT]: {
    title: "이벤트",
    description: "다양한 이벤트에 참여해보세요",
  },
  [MissionCategory.CHALLENGE]: {
    title: "챌린지",
    description: "도전하고 성취감을 느껴보세요",
  },
  [MissionCategory.QUIZ]: {
    title: "퀴즈/게임",
    description: "재미있는 퀴즈와 게임에 참여해보세요",
  },
};

function isValidCategory(value: string): value is MissionCategory {
  return Object.values(MissionCategory).includes(value as MissionCategory);
}

export const dynamic = "force-dynamic";

interface CurationPageProps {
  params: Promise<{ category: string }>;
}

export default async function CurationPage({ params }: CurationPageProps) {
  const { category } = await params;

  if (!isValidCategory(category)) {
    notFound();
  }

  const meta = CURATION_META[category];
  const missionsRaw = await missionService.getAllMissions({
    limit: 20,
    type: MissionType.GENERAL,
    category,
  });

  const missions = missionsRaw.map(toSurveyCardData);

  return (
    <main className="flex min-h-screen flex-col bg-white pb-10">
      <div className="pt-6">
        <CurationSection
          title={meta.title}
          description={meta.description}
          missions={missions}
          columns={2}
        />
      </div>
    </main>
  );
}
