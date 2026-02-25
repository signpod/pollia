"use client";

import { getUserMissions } from "@/actions/mission/read";
import { missionQueryKeys } from "@/constants/queryKeys/missionQueryKeys";
import { useQuery } from "@tanstack/react-query";

const MY_CONTENT_LIMIT = 10;

export function useMyContentMissions() {
  return useQuery({
    queryKey: [...missionQueryKeys.userMissions(), "my-content"],
    queryFn: () => getUserMissions({ limit: MY_CONTENT_LIMIT }),
    staleTime: 5 * 60 * 1000,
  });
}
