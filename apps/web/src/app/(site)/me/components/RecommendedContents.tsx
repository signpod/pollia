"use client";

import { getAllMissions } from "@/actions/mission/read";
import { MissionCarousel } from "@/components/common/MissionCarousel";
import { missionQueryKeys } from "@/constants/queryKeys/missionQueryKeys";
import UBIQUITOUS_CONSTANTS from "@/constants/ubiquitous";
import { MissionType } from "@prisma/client";
import { useQuery } from "@tanstack/react-query";

interface RecommendedContentsProps {
  userName: string;
}

export function RecommendedContents({ userName }: RecommendedContentsProps) {
  const { data: missions } = useQuery({
    queryKey: [...missionQueryKeys.allMissions(), "recommended"],
    queryFn: () => getAllMissions({ limit: 6, type: MissionType.GENERAL }),
    select: data => data.data,
    staleTime: 5 * 60 * 1000,
  });

  if (!missions || missions.length === 0) return null;

  return (
    <MissionCarousel
      title={`${userName}님의 추천 ${UBIQUITOUS_CONSTANTS.MISSION}`}
      missions={missions}
      cardClassName="w-[159.5px] sm:w-[200px]"
    />
  );
}
