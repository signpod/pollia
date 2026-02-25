"use client";

import { updateUser } from "@/actions/user";
import { toast } from "@/components/common/Toast";
import { userQueryKeys } from "@/constants/queryKeys/userQueryKeys";
import type { GetCurrentUserResponse } from "@/types/dto/user";
import { useMutation, useQueryClient } from "@tanstack/react-query";

interface UpdateUserNameContext {
  previousData: GetCurrentUserResponse | undefined;
}

const UPDATE_NAME_MESSAGES = {
  success: "닉네임이 변경되었어요.",
  error: "닉네임 변경 중 오류가 발생했어요.",
} as const;

export const useUpdateUserName = () => {
  const queryClient = useQueryClient();

  return useMutation<{ data: unknown }, Error, string, UpdateUserNameContext>({
    mutationFn: async (name: string) => {
      return await updateUser({ name });
    },

    onMutate: async name => {
      await queryClient.cancelQueries({
        queryKey: userQueryKeys.currentUser(),
      });

      const previousData = queryClient.getQueryData<GetCurrentUserResponse>(
        userQueryKeys.currentUser(),
      );

      queryClient.setQueryData<GetCurrentUserResponse>(userQueryKeys.currentUser(), oldData => {
        if (!oldData?.data) return oldData;
        return {
          data: { ...oldData.data, name },
        } as GetCurrentUserResponse;
      });

      return { previousData };
    },

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: userQueryKeys.currentUser(),
      });
      toast.success(UPDATE_NAME_MESSAGES.success);
    },

    onError: (_, __, context) => {
      if (context?.previousData) {
        queryClient.setQueryData(userQueryKeys.currentUser(), context.previousData);
      }
      toast.warning(UPDATE_NAME_MESSAGES.error);
    },
  });
};

export type UseUpdateUserNameReturn = ReturnType<typeof useUpdateUserName>;
