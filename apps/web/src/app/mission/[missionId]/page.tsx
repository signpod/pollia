import { getAuthError } from "@/lib/getAuthError";
import { missionService } from "@/server/services/mission";
import { rewardService } from "@/server/services/reward/rewardService";
import { headers } from "next/headers";
import { DevTools, MissionContent } from "./components";
import { MissionClientWrapper } from "./MissionClientWrapper";
import { formatDeadline } from "./utils/formatDeadline";

export default async function MissionPage({ params }: { params: Promise<{ missionId: string }> }) {
  const { missionId } = await params;
  const authError = await getAuthError();

  const headersList = await headers();
  const host = headersList.get("host") ?? "";
  const appUrlHost = process.env.NEXT_PUBLIC_APP_URL
    ? new URL(process.env.NEXT_PUBLIC_APP_URL).host
    : "";
  const isDevEnvironment = host === appUrlHost;

  // 서버에서 데이터 페칭
  const mission = await missionService.getMission(missionId);
  const reward = mission.rewardId
    ? await rewardService.getReward(mission.rewardId).catch(() => null)
    : null;

  const deadlineText = mission.deadline
    ? `${formatDeadline(mission.deadline)} 까지`
    : "정원 마감시";

  return (
    <>
      {isDevEnvironment && <DevTools missionId={missionId} />}
      <MissionClientWrapper initialError={authError}>
        <MissionContent
          missionId={missionId}
          missionType={mission.type}
          missionTitle={mission.title}
          missionImageUrl={mission.imageUrl}
          description={mission.description}
          target={mission.target}
          estimatedMinutes={mission.estimatedMinutes}
          deadlineText={deadlineText}
          reward={
            reward
              ? {
                  imageUrl: reward.imageUrl,
                  name: reward.name,
                  scheduledDate: reward.scheduledDate,
                }
              : null
          }
        />
      </MissionClientWrapper>
    </>
  );
}
