import { getReward } from "@/actions/reward";
import { AdminToolbar } from "@/components/common/AdminToolbar";
import prisma from "@/database/utils/prisma/client";
import { getQueryClient } from "@/lib/getQueryClient";
import { dehydrate } from "@tanstack/react-query";
import { MissionClientWrapper } from "./MissionClientWrapper";
import { MissionPageWrapper } from "./MissionPageWrapper";
import { getCachedMission } from "./getCachedMission";

export const revalidate = false;

export default async function MissionPage({ params }: { params: Promise<{ missionId: string }> }) {
  const { missionId } = await params;

  const mission = await getCachedMission(missionId);
  const [reward, creator] = await Promise.all([
    mission.data.rewardId ? getReward(mission.data.rewardId) : null,
    prisma.user.findUnique({
      where: { id: mission.data.creatorId },
      select: { name: true, profileImageFileUpload: { select: { publicUrl: true } } },
    }),
  ]);

  return (
    <>
      <AdminToolbar missionId={missionId} />
      <MissionClientWrapper dehydratedState={dehydrate(getQueryClient())}>
        <MissionPageWrapper
          mission={mission.data}
          reward={reward?.data ?? null}
          creatorName={creator?.name ?? null}
          creatorImageUrl={creator?.profileImageFileUpload?.publicUrl ?? null}
        />
      </MissionClientWrapper>
    </>
  );
}
