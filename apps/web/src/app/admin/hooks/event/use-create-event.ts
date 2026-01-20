"use client";

import { createEvent } from "@/actions/event";
import { adminEventQueryKeys } from "@/app/admin/constants/queryKeys";
import type { CreateEventRequest } from "@/types/dto/event";
import { useMutation, useQueryClient } from "@tanstack/react-query";

interface UseCreateEventOptions {
  onSuccess?: (data: Awaited<ReturnType<typeof createEvent>>) => void;
  onError?: (error: Error) => void;
}

export function useCreateEvent(options?: UseCreateEventOptions) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateEventRequest) => createEvent(data),
    onSuccess: data => {
      queryClient.invalidateQueries({ queryKey: adminEventQueryKeys.all() });
      options?.onSuccess?.(data);
    },
    onError: options?.onError,
  });
}

export type UseCreateEventReturn = ReturnType<typeof useCreateEvent>;
