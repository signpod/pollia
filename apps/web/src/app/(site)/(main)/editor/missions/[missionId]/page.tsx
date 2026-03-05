import { getMission } from "@/actions/mission";
import { getReward } from "@/actions/reward/read";
import { EditorMissionTabContent } from "./components/EditorMissionTabContent";

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

  return <EditorMissionTabContent missionId={missionId} mission={mission} reward={reward} />;
}
