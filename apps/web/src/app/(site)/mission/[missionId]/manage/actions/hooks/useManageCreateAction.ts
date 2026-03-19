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
import { toMutationFn } from "@/actions/common/error";
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
import type { BaseActionResponse } from "@/types/dto";
import type { ActionType } from "@prisma/client";
import { useMutation, useQueryClient } from "@tanstack/react-query";

interface ActionOptionInputWithOptionalOrder {
  id?: string;
  title: string;
  description?: string | null;
  imageUrl?: string | null;
  fileUploadId?: string | null;
  isCorrect?: boolean;
  nextActionId?: string | null;
  nextCompletionId?: string | null;
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

  return useMutation<BaseActionResponse, Error, CreateActionInput>({
    mutationFn: toMutationFn(async (input: CreateActionInput) => {
      const baseFields = {
        missionId: input.missionId,
        title: input.title,
        description: input.description,
        imageUrl: input.imageUrl,
        imageFileUploadId: input.imageFileUploadId,
        order: input.order,
        isRequired: input.isRequired,
        nextActionId: input.nextActionId,
        nextCompletionId: input.nextCompletionId,
      };

      const branchBaseFields = {
        missionId: input.missionId,
        title: input.title,
        description: input.description,
        imageUrl: input.imageUrl,
        imageFileUploadId: input.imageFileUploadId,
        order: input.order,
        isRequired: input.isRequired,
      };

      const buildOptions = (options?: ActionOptionInputWithOptionalOrder[]) =>
        options?.map((opt, index) => ({
          title: opt.title,
          description: opt.description,
          imageUrl: opt.imageUrl,
          fileUploadId: opt.fileUploadId,
          isCorrect: opt.isCorrect,
          nextActionId: opt.nextActionId,
          nextCompletionId: opt.nextCompletionId,
          order: opt.order ?? index,
        })) ?? [];

      switch (input.type) {
        case "MULTIPLE_CHOICE": {
          const request: CreateMultipleChoiceActionRequest = {
            ...baseFields,
            hasOther: input.hasOther,
            maxSelections: input.maxSelections ?? 1,
            options: buildOptions(input.options),
          };
          return createMultipleChoiceAction(request);
        }

        case "SCALE": {
          const request: CreateScaleActionRequest = {
            ...baseFields,
            options: buildOptions(input.options),
          };
          return createScaleAction(request);
        }

        case "SUBJECTIVE": {
          const request: CreateSubjectiveActionRequest = {
            ...baseFields,
          };
          return createSubjectiveAction(request);
        }

        case "SHORT_TEXT": {
          const request: CreateShortTextActionRequest = {
            ...baseFields,
            options: buildOptions(input.options),
          };
          return createShortTextAction(request);
        }

        case "TAG": {
          const request: CreateTagActionRequest = {
            ...baseFields,
            hasOther: input.hasOther,
            maxSelections: input.maxSelections ?? 1,
            options: buildOptions(input.options),
          };
          return createTagAction(request);
        }

        case "RATING": {
          const request: CreateRatingActionRequest = {
            ...baseFields,
          };
          return createRatingAction(request);
        }

        case "IMAGE": {
          const request: CreateImageActionRequest = {
            ...baseFields,
            maxSelections: input.maxSelections,
          };
          return createImageAction(request);
        }

        case "PDF": {
          const request: CreatePdfActionRequest = {
            ...baseFields,
          };
          return createPdfAction(request);
        }

        case "VIDEO": {
          const request: CreateVideoActionRequest = {
            ...baseFields,
          };
          return createVideoAction(request);
        }

        case "DATE": {
          const request: CreateDateActionRequest = {
            ...baseFields,
            maxSelections: input.maxSelections ?? 1,
          };
          return createDateAction(request);
        }

        case "TIME": {
          const request: CreateTimeActionRequest = {
            ...baseFields,
            maxSelections: input.maxSelections ?? 1,
          };
          return createTimeAction(request);
        }

        case "BRANCH": {
          const request: CreateBranchActionRequest = {
            ...branchBaseFields,
            maxSelections: BRANCH_MAX_SELECTIONS,
            hasOther: BRANCH_HAS_OTHER,
            options: buildOptions(input.options),
          };
          return createBranchAction(request);
        }

        default:
          throw new Error(`알 수 없는 액션 타입입니다: ${input.type}`);
      }
    }),

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
