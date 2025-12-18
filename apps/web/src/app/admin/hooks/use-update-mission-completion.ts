"use client";

import { updateMissionCompletion } from "@/actions/mission-completion";
import { adminMissionCompletionQueryKeys } from "@/app/admin/constants/queryKeys";
import type { UpdateMissionCompletionRequest } from "@/types/dto";
import { useMutation, useQueryClient } from "@tanstack/react-query";

interface UpdateMissionCompletionInput {
  id: string;
  data: UpdateMissionCompletionRequest;
}

interface UseUpdateMissionCompletionOptions {
  onSuccess?: () => void;
  onError?: (error: Error) => void;
}

export function useUpdateMissionCompletion(options: UseUpdateMissionCompletionOptions = {}) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, data }: UpdateMissionCompletionInput) => {
      return await updateMissionCompletion(id, data);
    },

    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: adminMissionCompletionQueryKeys.missionCompletion(variables.id),
      });
      queryClient.invalidateQueries({
        queryKey: adminMissionCompletionQueryKeys.all(),
      });
      options.onSuccess?.();
    },

    onError: error => {
      options.onError?.(error as Error);
    },
  });
}

export type UseUpdateMissionCompletionReturn = ReturnType<typeof useUpdateMissionCompletion>;
