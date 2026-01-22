"use client";

import { deleteEvent } from "@/actions/event";
import { adminEventQueryKeys, adminMissionQueryKeys } from "@/app/admin/constants/queryKeys";
import { useMutation, useQueryClient } from "@tanstack/react-query";

interface UseDeleteEventOptions {
  onSuccess?: (data: Awaited<ReturnType<typeof deleteEvent>>) => void;
  onError?: (error: Error) => void;
}

export function useDeleteEvent(options?: UseDeleteEventOptions) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (eventId: string) => deleteEvent(eventId),
    onSuccess: data => {
      queryClient.invalidateQueries({ queryKey: adminEventQueryKeys.all() });
      queryClient.invalidateQueries({ queryKey: adminMissionQueryKeys.all() });
      options?.onSuccess?.(data);
    },
    onError: options?.onError,
  });
}

export type UseDeleteEventReturn = ReturnType<typeof useDeleteEvent>;
