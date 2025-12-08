"use client";

import { updateAction } from "@/actions/action/update";
import { adminActionQueryKeys } from "@/app/admin/constants/queryKeys";
import { useMutation, useQueryClient } from "@tanstack/react-query";

interface UpdateActionInput {
  actionId: string;
  missionId: string;
  title?: string;
  description?: string;
  imageUrl?: string;
  order?: number;
  maxSelections?: number;
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
        order: input.order,
        maxSelections: input.maxSelections,
      });
    },

    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: adminActionQueryKeys.actions(variables.missionId),
      });
      options.onSuccess?.();
    },

    onError: error => {
      options.onError?.(error as Error);
    },
  });
}

export type UseUpdateActionReturn = ReturnType<typeof useUpdateAction>;
