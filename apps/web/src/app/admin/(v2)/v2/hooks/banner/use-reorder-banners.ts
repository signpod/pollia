"use client";

import { reorderBanners } from "@/actions/banner/update";
import { assertActionSuccess } from "@/actions/common/error";
import { adminV2BannerQueryKeys } from "@/app/admin/(v2)/v2/constants/queryKeys";
import type { ReorderBannersRequest } from "@/types/dto/banner";
import { useMutation, useQueryClient } from "@tanstack/react-query";

export function useReorderBanners() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (request: ReorderBannersRequest) => {
      const result = await reorderBanners(request);
      assertActionSuccess(result);
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: adminV2BannerQueryKeys.all() });
    },
  });
}

export type UseReorderBannersReturn = ReturnType<typeof useReorderBanners>;
