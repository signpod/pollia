"use client";

import { createMission } from "@/actions/mission";
import type { CreateMissionRequest, CreateMissionResponse } from "@/types/dto/mission";
import { useMutation } from "@tanstack/react-query";

interface UseCreateMissionOptions {
  onSuccess?: (data: CreateMissionResponse) => void;
  onError?: (error: Error) => void;
}

export function useCreateMission(options: UseCreateMissionOptions = {}) {
  return useMutation({
    mutationFn: async (payload: CreateMissionRequest): Promise<CreateMissionResponse> => {
      return createMission(payload);
    },
    onSuccess: data => {
      options.onSuccess?.(data);
    },
    onError: error => {
      options.onError?.(error as Error);
    },
  });
}
