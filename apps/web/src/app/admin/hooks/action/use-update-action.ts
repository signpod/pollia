"use client";

import { updateAction } from "@/actions/action/update";
import { adminActionQueryKeys } from "@/app/admin/constants/queryKeys";
import type { UpdateActionRequest } from "@/types/dto";
import { useMutation, useQueryClient } from "@tanstack/react-query";

interface UpdateActionInput extends UpdateActionRequest {
  actionId: string;
  missionId: string;
}

interface UseUpdateActionOptions {
  onSuccess?: () => void;
  onError?: (error: Error) => void;
}

export function useUpdateAction(options: UseUpdateActionOptions = {}) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: UpdateActionInput) => {
      return await updateAction(input.actionId, {
        title: input.title,
        description: input.description,
        imageUrl: input.imageUrl,
        imageFileUploadId: input.imageFileUploadId,
        order: input.order,
        maxSelections: input.maxSelections,
        isRequired: input.isRequired,
        hasOther: input.hasOther,
        options: input.options,
      });
    },

    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: adminActionQueryKeys.actions(variables.missionId),
      });
      options.onSuccess?.();
    },

    onError: error => {
      console.error("액션 수정 실패:", error);
      options.onError?.(error as Error);
    },
  });
}

export type UseUpdateActionReturn = ReturnType<typeof useUpdateAction>;
