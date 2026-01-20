"use client";

import { updateMission } from "@/actions/mission";
import { adminEventQueryKeys, adminMissionQueryKeys } from "@/app/admin/constants/queryKeys";
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
        queryKey: adminMissionQueryKeys.mission(variables.missionId),
      });
      queryClient.invalidateQueries({
        queryKey: adminMissionQueryKeys.all(),
      });
      queryClient.invalidateQueries({
        queryKey: adminEventQueryKeys.all(),
      });
      options.onSuccess?.(data);
    },
    onError: error => {
      console.error("미션 수정 실패:", error);
      options.onError?.(error as Error);
    },
  });
}

export type UseUpdateMissionReturn = ReturnType<typeof useUpdateMission>;
