"use client";

import { createSurvey } from "@/actions/mission";
import { missionQueryKeys } from "@/constants/queryKeys/missionQueryKeys";
import type { CreateMissionRequest, CreateMissionResponse } from "@/types/dto";
import { useMutation, useQueryClient } from "@tanstack/react-query";

interface UseCreateMissionOptions {
  onSuccess?: (data: CreateMissionResponse) => void;
  onError?: (error: Error) => void;
}

export function useCreateMission(options: UseCreateMissionOptions = {}) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: CreateMissionRequest): Promise<CreateMissionResponse> =>
      createSurvey(payload),
    onSuccess: data => {
      queryClient.invalidateQueries({
        queryKey: missionQueryKeys.userMissions(),
      });
      options.onSuccess?.(data);
    },
    onError: error => {
      options.onError?.(error as Error);
    },
  });
}
