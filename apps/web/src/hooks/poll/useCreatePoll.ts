"use client";

import { createPoll } from "@/actions/poll";
import { CreatePollRequest, CreatePollResponse } from "@/types/dto";
import { useMutation } from "@tanstack/react-query";

interface UseCreatePollOptions {
  onSuccess?: (data: CreatePollResponse) => void;
  onError?: (error: Error) => void;
}

export function useCreatePoll(options: UseCreatePollOptions = {}) {
  return useMutation({
    mutationFn: async (payload: CreatePollRequest): Promise<CreatePollResponse> =>
      createPoll(payload),
    onSuccess: data => {
      options.onSuccess?.(data);
    },
    onError: error => {
      console.error("❌ 폴 생성 실패:", error);
      options.onError?.(error as Error);
    },
  });
}
