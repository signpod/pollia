"use client";

import { getBanners } from "@/actions/banner/read";
import { adminV2BannerQueryKeys } from "@/app/admin/(v2)/v2/constants/queryKeys";
import { useQuery } from "@tanstack/react-query";

export function useAdminBanners() {
  return useQuery({
    queryKey: adminV2BannerQueryKeys.list(),
    queryFn: () => getBanners(),
    staleTime: 5 * 60 * 1000,
    retry: 3,
    retryDelay: attemptIndex => Math.min(1000 * 2 ** attemptIndex, 30000),
  });
}

export type UseAdminBannersReturn = ReturnType<typeof useAdminBanners>;
