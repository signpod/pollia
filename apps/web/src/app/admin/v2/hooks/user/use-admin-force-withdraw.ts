"use client";

import { adminForceWithdraw } from "@/actions/admin-user/update";
import { assertActionSuccess } from "@/actions/common/error";
import { adminV2UserQueryKeys } from "@/app/admin/v2/constants/queryKeys";
import { useMutation, useQueryClient } from "@tanstack/react-query";

export function useAdminForceWithdraw() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (userId: string) => {
      const result = await adminForceWithdraw(userId);
      assertActionSuccess(result);
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: adminV2UserQueryKeys.all() });
    },
  });
}
