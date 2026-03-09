"use client";

import { generateMissionAiReport } from "@/actions/ai";
import { toMutationFn } from "@/actions/common/error";
import type { GenerateMissionAiReportResponse } from "@/types/dto";
import { useMutation } from "@tanstack/react-query";

interface UseGenerateMissionAiReportOptions {
  onSuccess?: (data: GenerateMissionAiReportResponse) => void;
  onError?: (error: Error) => void;
}

export function useGenerateMissionAiReport(options: UseGenerateMissionAiReportOptions = {}) {
  return useMutation<GenerateMissionAiReportResponse, Error, string>({
    mutationFn: toMutationFn(generateMissionAiReport),
    onSuccess: data => {
      options.onSuccess?.(data);
    },
    onError: error => {
      options.onError?.(error as Error);
    },
  });
}
