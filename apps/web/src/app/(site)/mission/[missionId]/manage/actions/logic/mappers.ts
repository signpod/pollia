import type { ActionDetail } from "@/types/dto";
import type { ActionType } from "@prisma/client";
import type { ActionFormValues } from "../components/ActionForm";
import type { CreateActionInput } from "../hooks";

export function mapCreateActionInput(params: {
  missionId: string;
  selectedType: ActionType;
  values: ActionFormValues;
  order: number;
}): CreateActionInput {
  const { missionId, selectedType, values, order } = params;

  return {
    missionId,
    type: selectedType,
    title: values.title,
    description: values.description,
    isRequired: values.isRequired,
    order,
    imageUrl: null,
    imageFileUploadId: null,
    hasOther: values.hasOther,
    nextActionId: values.nextActionId,
    nextCompletionId: values.nextCompletionId,
    ...(values.maxSelections !== undefined && { maxSelections: values.maxSelections }),
    ...(values.options && {
      options: values.options.map((option, index) => ({
        title: option.title,
        description: option.description,
        nextActionId: option.nextActionId,
        nextCompletionId: option.nextCompletionId,
        order: index,
      })),
    }),
  };
}

export function mapUpdateActionInput(params: {
  missionId: string;
  editingActionId: string;
  values: ActionFormValues;
}) {
  const { missionId, editingActionId, values } = params;

  return {
    actionId: editingActionId,
    missionId,
    title: values.title,
    description: values.description,
    isRequired: values.isRequired,
    hasOther: values.hasOther,
    nextActionId: values.nextActionId,
    nextCompletionId: values.nextCompletionId,
    ...(values.maxSelections !== undefined && { maxSelections: values.maxSelections }),
    ...(values.options && {
      options: values.options.map((option, index) => ({
        id: option.id,
        title: option.title,
        description: option.description,
        nextActionId: option.nextActionId,
        nextCompletionId: option.nextCompletionId,
        order: index,
      })),
    }),
  };
}

export function mapEditInitialValues(action: ActionDetail): ActionFormValues {
  return {
    title: action.title,
    description: action.description,
    isRequired: action.isRequired,
    hasOther: action.hasOther ?? false,
    maxSelections: action.maxSelections ?? 1,
    options: action.options?.map(option => ({
      id: option.id,
      title: option.title,
      description: option.description,
      nextActionId: option.nextActionId,
      nextCompletionId: option.nextCompletionId,
      order: option.order,
    })),
    nextActionId: action.nextActionId,
    nextCompletionId: action.nextCompletionId,
  };
}
