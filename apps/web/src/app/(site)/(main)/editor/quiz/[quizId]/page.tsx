import { getMission } from "@/actions/mission";
import { getReward } from "@/actions/reward/read";
import { QuizEditorContent } from "./components/QuizEditorContent";

interface QuizEditorPageProps {
  params: Promise<{ quizId: string }>;
}

export default async function QuizEditorPage({ params }: QuizEditorPageProps) {
  const { quizId } = await params;
  const mission = (await getMission(quizId)).data;

  const reward = mission.rewardId
    ? await getReward(mission.rewardId)
        .then(result => result.data)
        .catch(() => null)
    : null;

  return <QuizEditorContent missionId={quizId} mission={mission} reward={reward} />;
}
