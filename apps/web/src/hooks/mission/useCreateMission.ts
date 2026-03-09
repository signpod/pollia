"use client";

import { toMutationFn } from "@/actions/common/error";
import { createMission } from "@/actions/mission";
import { missionQueryKeys } from "@/constants/queryKeys/missionQueryKeys";
import type { CreateMissionRequest, CreateMissionResponse } from "@/types/dto";
import { useMutation, useQueryClient } from "@tanstack/react-query";

interface UseCreateMissionOptions {
  onSuccess?: (data: CreateMissionResponse) => void;
  onError?: (error: Error) => void;
}

export function useCreateMission(options: UseCreateMissionOptions = {}) {
  const queryClient = useQueryClient();

  return useMutation<CreateMissionResponse, Error, CreateMissionRequest>({
    mutationFn: toMutationFn(createMission),
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
