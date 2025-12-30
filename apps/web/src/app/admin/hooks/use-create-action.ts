"use client";

import {
  createImageAction,
  createMultipleChoiceAction,
  createRatingAction,
  createScaleAction,
  createSubjectiveAction,
  createTagAction,
} from "@/actions/action/create";
import { adminActionQueryKeys } from "@/app/admin/constants/queryKeys";
import type { ActionType } from "@/app/admin/missions/[id]/edit/components/action-forms";
import type {
  CreateImageActionRequest,
  CreateMultipleChoiceActionRequest,
  CreateRatingActionRequest,
  CreateScaleActionRequest,
  CreateSubjectiveActionRequest,
  CreateTagActionRequest,
} from "@/types/dto";
import { useMutation, useQueryClient } from "@tanstack/react-query";

interface CreateActionInput {
  missionId: string;
  type: ActionType;
  title: string;
  description?: string;
  imageUrl?: string;
  imageFileUploadId?: string;
  order: number;
  isRequired?: boolean;
  options?: {
    title: string;
    description?: string;
    imageUrl?: string;
    imageFileUploadId?: string;
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
            imageFileUploadId: input.imageFileUploadId,
            order: input.order,
            isRequired: input.isRequired,
            maxSelections: input.maxSelections ?? 1,
            options:
              input.options?.map((opt, index) => ({
                title: opt.title,
                description: opt.description,
                imageUrl: opt.imageUrl,
                imageFileUploadId: opt.imageFileUploadId,
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
            imageFileUploadId: input.imageFileUploadId,
            order: input.order,
            isRequired: input.isRequired,
            options:
              input.options?.map((opt, index) => ({
                title: opt.title,
                description: opt.description,
                imageUrl: opt.imageUrl,
                imageFileUploadId: opt.imageFileUploadId,
                order: opt.order ?? index,
              })) ?? [],
          };
          return await createScaleAction(request);
        }

        case "SUBJECTIVE": {
          const request: CreateSubjectiveActionRequest = {
            missionId: input.missionId,
            title: input.title,
            description: input.description,
            imageUrl: input.imageUrl,
            imageFileUploadId: input.imageFileUploadId,
            order: input.order,
            isRequired: input.isRequired,
          };
          return await createSubjectiveAction(request);
        }

        case "TAG": {
          const request: CreateTagActionRequest = {
            missionId: input.missionId,
            title: input.title,
            description: input.description,
            imageUrl: input.imageUrl,
            imageFileUploadId: input.imageFileUploadId,
            order: input.order,
            isRequired: input.isRequired,
            maxSelections: input.maxSelections ?? 1,
            options:
              input.options?.map((opt, index) => ({
                title: opt.title,
                description: opt.description,
                imageUrl: opt.imageUrl,
                imageFileUploadId: opt.imageFileUploadId,
                order: opt.order ?? index,
              })) ?? [],
          };
          return await createTagAction(request);
        }

        case "RATING": {
          const request: CreateRatingActionRequest = {
            missionId: input.missionId,
            title: input.title,
            description: input.description,
            imageUrl: input.imageUrl,
            imageFileUploadId: input.imageFileUploadId,
            order: input.order,
            isRequired: input.isRequired,
          };
          return await createRatingAction(request);
        }

        case "IMAGE": {
          const request: CreateImageActionRequest = {
            missionId: input.missionId,
            title: input.title,
            description: input.description,
            imageUrl: input.imageUrl,
            imageFileUploadId: input.imageFileUploadId,
            order: input.order,
            isRequired: input.isRequired,
          };
          return await createImageAction(request);
        }

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
