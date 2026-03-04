"use client";

import { generateMissionAiReport } from "@/actions/ai";
import type { GenerateMissionAiReportResponse } from "@/types/dto";
import { useMutation } from "@tanstack/react-query";

interface UseGenerateMissionAiReportOptions {
  onSuccess?: (data: GenerateMissionAiReportResponse) => void;
  onError?: (error: Error) => void;
}

export function useGenerateMissionAiReport(options: UseGenerateMissionAiReportOptions = {}) {
  return useMutation({
    mutationFn: async (missionId: string): Promise<GenerateMissionAiReportResponse> =>
      generateMissionAiReport(missionId),
    onSuccess: data => {
      options.onSuccess?.(data);
    },
    onError: error => {
      options.onError?.(error as Error);
    },
  });
}
