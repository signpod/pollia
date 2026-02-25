"use client";

import {
  createBranchAction,
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
import { actionQueryKeys } from "@/constants/queryKeys/actionQueryKeys";
import { BRANCH_HAS_OTHER, BRANCH_MAX_SELECTIONS } from "@/schemas/action";
import type {
  BaseActionRequest,
  CreateBranchActionRequest,
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
import type { ActionType } from "@prisma/client";
import { useMutation, useQueryClient } from "@tanstack/react-query";

interface ActionOptionInputWithOptionalOrder {
  id?: string;
  title: string;
  description?: string | null;
  imageUrl?: string | null;
  fileUploadId?: string | null;
  nextActionId?: string | null;
  order?: number;
}

export interface CreateActionInput extends BaseActionRequest {
  missionId: string;
  type: ActionType;
  options?: ActionOptionInputWithOptionalOrder[];
  maxSelections?: number;
}

interface UseManageCreateActionOptions {
  onSuccess?: (data: { data: { id: string; missionId: string | null } }) => void;
  onError?: (error: Error) => void;
}

export function useManageCreateAction(options: UseManageCreateActionOptions = {}) {
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

        case "BRANCH": {
          const request: CreateBranchActionRequest = {
            missionId: input.missionId,
            title: input.title,
            description: input.description,
            imageUrl: input.imageUrl,
            imageFileUploadId: input.imageFileUploadId,
            order: input.order,
            isRequired: input.isRequired,
            maxSelections: BRANCH_MAX_SELECTIONS,
            hasOther: BRANCH_HAS_OTHER,
            options:
              input.options?.map((opt, index) => ({
                title: opt.title,
                description: opt.description,
                imageUrl: opt.imageUrl,
                fileUploadId: opt.fileUploadId,
                order: opt.order ?? index,
              })) ?? [],
          };
          return await createBranchAction(request);
        }

        default:
          throw new Error(`알 수 없는 액션 타입입니다: ${input.type}`);
      }
    },

    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({
        queryKey: actionQueryKeys.actions({ missionId: variables.missionId }),
      });
      options.onSuccess?.(data as { data: { id: string; missionId: string | null } });
    },

    onError: error => {
      options.onError?.(error as Error);
    },
  });
}
