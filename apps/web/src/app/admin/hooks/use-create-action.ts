"use client";

import {
  createMultipleChoiceAction,
  createScaleAction,
  createSubjectiveAction,
} from "@/actions/action/create";
import { adminActionQueryKeys } from "@/app/admin/constants/queryKeys";
import type {
  CreateMultipleChoiceActionRequest,
  CreateScaleActionRequest,
  CreateSubjectiveActionRequest,
} from "@/types/dto";
import { useMutation, useQueryClient } from "@tanstack/react-query";

type ActionType = "MULTIPLE_CHOICE" | "SCALE" | "RATING" | "TAG" | "SUBJECTIVE" | "IMAGE";

interface CreateActionInput {
  missionId: string;
  type: ActionType;
  title: string;
  description?: string;
  imageUrl?: string;
  order: number;
  options?: {
    title: string;
    description?: string;
    imageUrl?: string;
    order: number;
  }[];
  maxSelections?: number;
}

interface UseCreateActionOptions {
  onSuccess?: () => void;
  onError?: (error: Error) => void;
}

export function useCreateAction(options: UseCreateActionOptions = {}) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: CreateActionInput) => {
      switch (input.type) {
        case "MULTIPLE_CHOICE": {
          const request: CreateMultipleChoiceActionRequest = {
            missionId: input.missionId,
            title: input.title,
            description: input.description,
            imageUrl: input.imageUrl,
            order: input.order,
            maxSelections: input.maxSelections ?? 1,
            options:
              input.options?.map((opt, index) => ({
                title: opt.title,
                description: opt.description,
                imageUrl: opt.imageUrl,
                order: opt.order ?? index,
              })) ?? [],
          };
          return await createMultipleChoiceAction(request);
        }

        case "SCALE": {
          const request: CreateScaleActionRequest = {
            missionId: input.missionId,
            title: input.title,
            description: input.description,
            imageUrl: input.imageUrl,
            order: input.order,
          };
          return await createScaleAction(request);
        }

        case "SUBJECTIVE": {
          const request: CreateSubjectiveActionRequest = {
            missionId: input.missionId,
            title: input.title,
            description: input.description,
            imageUrl: input.imageUrl,
            order: input.order,
          };
          return await createSubjectiveAction(request);
        }

        case "RATING":
        case "TAG":
        case "IMAGE":
          throw new Error(`아직 지원하지 않는 액션 타입입니다: ${input.type}`);

        default:
          throw new Error(`알 수 없는 액션 타입입니다: ${input.type}`);
      }
    },

    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: adminActionQueryKeys.actions(variables.missionId),
      });
      options.onSuccess?.();
    },

    onError: error => {
      options.onError?.(error as Error);
    },
  });
}

export type UseCreateActionReturn = ReturnType<typeof useCreateAction>;
