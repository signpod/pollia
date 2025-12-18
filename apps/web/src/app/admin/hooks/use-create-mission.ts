"use client";

import { createMission } from "@/actions/mission";
import { adminMissionQueryKeys } from "@/app/admin/constants/queryKeys";
import type { CreateMissionRequest, CreateMissionResponse } from "@/types/dto/mission";
import { useMutation, useQueryClient } from "@tanstack/react-query";

interface UseCreateMissionOptions {
  onSuccess?: (data: CreateMissionResponse) => void;
  onError?: (error: Error) => void;
}

export function useCreateMission(options: UseCreateMissionOptions = {}) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: CreateMissionRequest): Promise<CreateMissionResponse> => {
      return createMission(payload);
    },
    onSuccess: data => {
      queryClient.invalidateQueries({
        queryKey: adminMissionQueryKeys.all(),
      });
      options.onSuccess?.(data);
    },
    onError: error => {
      options.onError?.(error as Error);
    },
  });
}
