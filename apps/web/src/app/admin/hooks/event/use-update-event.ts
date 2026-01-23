"use client";

import { updateEvent } from "@/actions/event";
import { adminEventQueryKeys } from "@/app/admin/constants/queryKeys";
import type { UpdateEventRequest } from "@/types/dto/event";
import { useMutation, useQueryClient } from "@tanstack/react-query";

interface UseUpdateEventOptions {
  onSuccess?: (data: Awaited<ReturnType<typeof updateEvent>>) => void;
  onError?: (error: Error) => void;
}

interface UpdateEventParams {
  eventId: string;
  data: UpdateEventRequest;
}

export function useUpdateEvent(options?: UseUpdateEventOptions) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ eventId, data }: UpdateEventParams) => updateEvent(eventId, data),
    onSuccess: data => {
      queryClient.invalidateQueries({ queryKey: adminEventQueryKeys.all() });
      options?.onSuccess?.(data);
    },
    onError: options?.onError,
  });
}

export type UseUpdateEventReturn = ReturnType<typeof useUpdateEvent>;
