import { getMission } from "@/actions/mission";
import { getReward } from "@/actions/reward/read";
import { Separator } from "@/components/ui/separator";
import { ProjectBasicInfoCard } from "./components/ProjectBasicInfoCard";
import { RewardSettingsCard } from "./components/RewardSettingsCard";

interface EditorMissionPageProps {
  params: Promise<{ missionId: string }>;
}

export default async function EditorMissionPage({ params }: EditorMissionPageProps) {
  const { missionId } = await params;
  const mission = (await getMission(missionId)).data;

  const reward = mission.rewardId
    ? await getReward(mission.rewardId)
        .then(result => result.data)
        .catch(() => null)
    : null;

  return (
    <>
      <ProjectBasicInfoCard mission={mission} />
      <Separator className="h-2" />
      <RewardSettingsCard mission={mission} initialReward={reward} />
    </>
  );
}
