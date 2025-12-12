"use client";

import { duplicateMission } from "@/actions/mission";
import type { DuplicateMissionRequest, DuplicateMissionResponse } from "@/types/dto";
import { useMutation } from "@tanstack/react-query";

interface UseDuplicateMissionOptions {
  onSuccess?: (data: DuplicateMissionResponse) => void;
  onError?: (error: Error) => void;
}

export function useDuplicateMission(options: UseDuplicateMissionOptions = {}) {
  return useMutation({
    mutationFn: async (payload: DuplicateMissionRequest): Promise<DuplicateMissionResponse> => {
      return duplicateMission(payload);
    },
    onSuccess: data => {
      options.onSuccess?.(data);
    },
    onError: error => {
      options.onError?.(error as Error);
    },
  });
}
