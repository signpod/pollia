"use client";

import { updateMission } from "@/actions/mission";
import { missionQueryKeys } from "@/constants/queryKeys/missionQueryKeys";
import type { UpdateMissionRequest, UpdateMissionResponse } from "@/types/dto/mission";
import { useMutation, useQueryClient } from "@tanstack/react-query";

interface UseUpdateMissionOptions {
  onSuccess?: (data: UpdateMissionResponse) => void;
  onError?: (error: Error) => void;
}

interface UpdateMissionPayload {
  missionId: string;
  data: UpdateMissionRequest;
}

export function useUpdateMission(options: UseUpdateMissionOptions = {}) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ missionId, data }: UpdateMissionPayload): Promise<UpdateMissionResponse> =>
      updateMission(missionId, data),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({
        queryKey: missionQueryKeys.mission(variables.missionId),
      });
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
