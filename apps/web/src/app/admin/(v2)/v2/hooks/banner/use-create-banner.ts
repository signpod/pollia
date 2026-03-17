"use client";

import { createBanner } from "@/actions/banner/create";
import { assertActionSuccess } from "@/actions/common/error";
import { adminV2BannerQueryKeys } from "@/app/admin/(v2)/v2/constants/queryKeys";
import type { CreateBannerRequest } from "@/types/dto/banner";
import { useMutation, useQueryClient } from "@tanstack/react-query";

export function useCreateBanner() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (request: CreateBannerRequest) => {
      const result = await createBanner(request);
      assertActionSuccess(result);
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: adminV2BannerQueryKeys.all() });
    },
  });
}

export type UseCreateBannerReturn = ReturnType<typeof useCreateBanner>;
