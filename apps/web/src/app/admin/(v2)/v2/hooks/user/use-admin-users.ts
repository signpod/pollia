"use client";

import { getAdminUsers } from "@/actions/admin-user/read";
import { adminV2UserQueryKeys } from "@/app/admin/(v2)/v2/constants/queryKeys";
import type { GetAdminUsersRequest } from "@/types/dto/admin-user";
import { keepPreviousData, useQuery } from "@tanstack/react-query";

export function useAdminUsers(params?: GetAdminUsersRequest) {
  return useQuery({
    queryKey: adminV2UserQueryKeys.list(params as Record<string, unknown>),
    queryFn: () => getAdminUsers(params),
    placeholderData: keepPreviousData,
  });
}
