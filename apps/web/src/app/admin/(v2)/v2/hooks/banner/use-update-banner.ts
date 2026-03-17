"use client";

import { updateBanner } from "@/actions/banner/update";
import { assertActionSuccess } from "@/actions/common/error";
import { adminV2BannerQueryKeys } from "@/app/admin/(v2)/v2/constants/queryKeys";
import type { UpdateBannerRequest } from "@/types/dto/banner";
import { useMutation, useQueryClient } from "@tanstack/react-query";

export function useUpdateBanner() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...request }: UpdateBannerRequest & { id: string }) => {
      const result = await updateBanner(id, request);
      assertActionSuccess(result);
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: adminV2BannerQueryKeys.all() });
    },
  });
}

export type UseUpdateBannerReturn = ReturnType<typeof useUpdateBanner>;
