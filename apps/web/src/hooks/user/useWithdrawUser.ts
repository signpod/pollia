"use client";

import { toMutationFn } from "@/actions/common/error";
import { withdrawUser } from "@/actions/user/withdraw";
import { toast } from "@/components/common/Toast";
import type { WithdrawUserRequest } from "@/types/dto/user";
import { useMutation } from "@tanstack/react-query";

const WITHDRAW_MESSAGES = {
  error: "탈퇴 처리 중 오류가 발생했어요.",
} as const;

export const useWithdrawUser = () => {
  const withdrawMutation = useMutation<{ message: string }, Error, WithdrawUserRequest>({
    mutationFn: toMutationFn(withdrawUser),
    onError: () => {
      toast.warning(WITHDRAW_MESSAGES.error);
    },
  });

  return {
    withdrawAsync: withdrawMutation.mutateAsync,
    isPending: withdrawMutation.isPending,
  };
};

export type UseWithdrawUserReturn = ReturnType<typeof useWithdrawUser>;
