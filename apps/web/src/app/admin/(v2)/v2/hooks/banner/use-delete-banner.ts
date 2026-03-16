"use client";

import { deleteBanner } from "@/actions/banner/delete";
import { assertActionSuccess } from "@/actions/common/error";
import { adminV2BannerQueryKeys } from "@/app/admin/(v2)/v2/constants/queryKeys";
import { useMutation, useQueryClient } from "@tanstack/react-query";

export function useDeleteBanner() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const result = await deleteBanner(id);
      assertActionSuccess(result);
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: adminV2BannerQueryKeys.all() });
    },
  });
}
