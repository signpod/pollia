"use client";

import { getBanners } from "@/actions/banner/read";
import { adminV2BannerQueryKeys } from "@/app/admin/(v2)/v2/constants/queryKeys";
import { useQuery } from "@tanstack/react-query";

export function useAdminBanners() {
  return useQuery({
    queryKey: adminV2BannerQueryKeys.list(),
    queryFn: () => getBanners(),
  });
}
