"use client";

import {
  createDateAction,
  createImageAction,
  createMultipleChoiceAction,
  createPdfAction,
  createRatingAction,
  createScaleAction,
  createShortTextAction,
  createSubjectiveAction,
  createTagAction,
  createTimeAction,
  createVideoAction,
} from "@/actions/action/create";
import { adminActionQueryKeys } from "@/app/admin/constants/queryKeys";
import type { ActionType } from "@/app/admin/missions/[id]/edit/components/action-forms";
import type {
  ActionOptionInput,
  BaseActionRequest,
  CreateDateActionRequest,
  CreateImageActionRequest,
  CreateMultipleChoiceActionRequest,
  CreatePdfActionRequest,
  CreateRatingActionRequest,
  CreateScaleActionRequest,
  CreateShortTextActionRequest,
  CreateSubjectiveActionRequest,
  CreateTagActionRequest,
  CreateTimeActionRequest,
  CreateVideoActionRequest,
} from "@/types/dto";
import { useMutation, useQueryClient } from "@tanstack/react-query";

interface CreateActionInput extends BaseActionRequest {
  missionId: string;
  type: ActionType;
  options?: ActionOptionInput[];
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
            hasOther: input.hasOther,
            maxSelections: input.maxSelections ?? 1,
            options:
              input.options?.map((opt, index) => ({
                title: opt.title,
                description: opt.description,
                imageUrl: opt.imageUrl,
                fileUploadId: opt.fileUploadId,
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
                fileUploadId: opt.fileUploadId,
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

        case "SHORT_TEXT": {
          const request: CreateShortTextActionRequest = {
            missionId: input.missionId,
            title: input.title,
            description: input.description,
            imageUrl: input.imageUrl,
            imageFileUploadId: input.imageFileUploadId,
            order: input.order,
            isRequired: input.isRequired,
          };
          return await createShortTextAction(request);
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
            hasOther: input.hasOther,
            maxSelections: input.maxSelections ?? 1,
            options:
              input.options?.map((opt, index) => ({
                title: opt.title,
                description: opt.description,
                imageUrl: opt.imageUrl,
                fileUploadId: opt.fileUploadId,
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
            maxSelections: input.maxSelections,
          };
          return await createImageAction(request);
        }

        case "PDF": {
          const request: CreatePdfActionRequest = {
            missionId: input.missionId,
            title: input.title,
            description: input.description,
            imageUrl: input.imageUrl,
            imageFileUploadId: input.imageFileUploadId,
            order: input.order,
            isRequired: input.isRequired,
          };
          return await createPdfAction(request);
        }

        case "VIDEO": {
          const request: CreateVideoActionRequest = {
            missionId: input.missionId,
            title: input.title,
            description: input.description,
            imageUrl: input.imageUrl,
            imageFileUploadId: input.imageFileUploadId,
            order: input.order,
            isRequired: input.isRequired,
          };
          return await createVideoAction(request);
        }

        case "DATE": {
          const request: CreateDateActionRequest = {
            missionId: input.missionId,
            title: input.title,
            description: input.description,
            imageUrl: input.imageUrl,
            imageFileUploadId: input.imageFileUploadId,
            order: input.order,
            isRequired: input.isRequired,
            maxSelections: input.maxSelections ?? 1,
          };
          return await createDateAction(request);
        }

        case "TIME": {
          const request: CreateTimeActionRequest = {
            missionId: input.missionId,
            title: input.title,
            description: input.description,
            imageUrl: input.imageUrl,
            imageFileUploadId: input.imageFileUploadId,
            order: input.order,
            isRequired: input.isRequired,
            maxSelections: input.maxSelections ?? 1,
          };
          return await createTimeAction(request);
        }

        default:
          throw new Error(`알 수 없는 액션 타입입니다: ${input.type} (타입: ${typeof input.type})`);
      }
    },

    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: adminActionQueryKeys.actions(variables.missionId),
      });
      options.onSuccess?.();
    },

    onError: error => {
      console.error("액션 생성 실패:", error);
      options.onError?.(error as Error);
    },
  });
}

export type UseCreateActionReturn = ReturnType<typeof useCreateAction>;
