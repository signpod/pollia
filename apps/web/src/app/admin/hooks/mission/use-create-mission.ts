"use client";

import { createMission } from "@/actions/mission";
import { adminEventQueryKeys, adminMissionQueryKeys } from "@/app/admin/constants/queryKeys";
import UBIQUITOUS_CONSTANTS from "@/constants/ubiquitous";
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
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({
        queryKey: adminMissionQueryKeys.all(),
      });

      if (variables.eventId) {
        queryClient.invalidateQueries({
          queryKey: adminEventQueryKeys.all(),
        });
      }

      options.onSuccess?.(data);
    },
    onError: error => {
      console.error(`${UBIQUITOUS_CONSTANTS.MISSION} 생성 실패:`, error);
      options.onError?.(error as Error);
    },
  });
}

export type UseCreateMissionReturn = ReturnType<typeof useCreateMission>;
