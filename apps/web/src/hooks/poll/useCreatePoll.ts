"use client";

import { useMutation } from "@tanstack/react-query";
import { CreatePollRequest, CreatePollResponse } from "@/types/dto";
import { createPoll } from "@/actions/poll";

interface UseCreatePollOptions {
  onSuccess?: (data: CreatePollResponse) => void;
  onError?: (error: Error) => void;
}

export function useCreatePoll(options: UseCreatePollOptions = {}) {
  return useMutation({
    mutationFn: async (
      payload: CreatePollRequest
    ): Promise<CreatePollResponse> => {
      const result = await createPoll(payload);

      if (!result.success) {
        throw new Error(result.error || "폴 생성에 실패했습니다.");
      }

      return result;
    },
    onSuccess: (data) => {
      options.onSuccess?.(data);
    },
    onError: (error) => {
      console.error("❌ 폴 생성 실패:", error);
      options.onError?.(error as Error);
    },
  });
}
