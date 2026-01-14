import { missionService } from "@/server/services/mission";
import { rewardService } from "@/server/services/reward/rewardService";
import { MissionClientWrapper } from "./MissionClientWrapper";
import { DevTools, MissionContent } from "./components";
import type { MissionRewardData } from "./types/mission";
import { formatDeadline } from "./utils/formatDeadline";

/**
 * 무한 캐시 설정
 * On-demand revalidation을 통해 데이터 갱신 시 캐시를 무효화합니다.
 * Action/Mission 생성/수정/삭제 시 revalidatePath를 호출해야 합니다.
 */
export const revalidate = false;

export default async function MissionPage({ params }: { params: Promise<{ missionId: string }> }) {
  const { missionId } = await params;

  const isDevEnvironment = process.env.NODE_ENV === "development";

  const mission = await missionService.getMission(missionId);
  const reward = mission.rewardId
    ? await rewardService.getReward(mission.rewardId).catch(error => {
        console.error("리워드 조회 실패:", error);
        return null;
      })
    : null;

  const deadlineText = mission.deadline
    ? `${formatDeadline(mission.deadline)} 까지`
    : "정원 마감시";

  return (
    <>
      {isDevEnvironment && <DevTools missionId={missionId} />}
      <MissionClientWrapper>
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
              ? ({
                  imageUrl: reward.imageUrl,
                  name: reward.name,
                  scheduledDate: reward.scheduledDate,
                } satisfies MissionRewardData)
              : null
          }
          brandLogoUrl={mission.brandLogoUrl}
          title={mission.title}
        />
      </MissionClientWrapper>
    </>
  );
}
