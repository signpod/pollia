import { getMission } from "@/actions/mission";
import { getReward } from "@/actions/reward";
import { getQueryClient } from "@/lib/getQueryClient";
import { dehydrate } from "@tanstack/react-query";
import { MissionClientWrapper } from "./MissionClientWrapper";
import { MissionPageWrapper } from "./MissionPageWrapper";
import { DevTools } from "./components";

/**
 * 무한 캐시 설정
 * On-demand revalidation을 통해 데이터 갱신 시 캐시를 무효화합니다.
 * Action/Mission 생성/수정/삭제 시 revalidatePath를 호출해야 합니다.
 */
export const revalidate = false;

export default async function MissionPage({ params }: { params: Promise<{ missionId: string }> }) {
  const { missionId } = await params;

  const mission = await getMission(missionId);
  const reward = mission.data.rewardId ? await getReward(mission.data.rewardId) : null;

  return (
    <>
      <DevTools missionId={missionId} />
      <MissionClientWrapper dehydratedState={dehydrate(getQueryClient())}>
        <MissionPageWrapper mission={mission.data} reward={reward?.data ?? null} />
      </MissionClientWrapper>
    </>
  );
}
