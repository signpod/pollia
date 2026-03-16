"use client";

import { getAdminMissions } from "@/actions/admin-mission/read";
import { adminV2MissionQueryKeys } from "@/app/admin/(v2)/v2/constants/queryKeys";
import type { GetAdminMissionsRequest } from "@/types/dto/admin-mission";
import { keepPreviousData, useQuery } from "@tanstack/react-query";

export function useAdminV2Missions(params?: GetAdminMissionsRequest) {
  return useQuery({
    queryKey: adminV2MissionQueryKeys.list(params as Record<string, unknown>),
    queryFn: () => getAdminMissions(params),
    placeholderData: keepPreviousData,
  });
}
