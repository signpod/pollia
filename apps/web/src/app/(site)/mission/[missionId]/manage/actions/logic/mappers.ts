import type { ActionDetail } from "@/types/dto";
import type { ActionType } from "@prisma/client";
import type { ActionFormValues } from "../components/ActionForm";
import type { CreateActionInput } from "../hooks";

const OPTION_BASED_TYPES = new Set<ActionType>([
  "MULTIPLE_CHOICE",
  "SCALE",
  "TAG",
  "BRANCH",
  "OX",
  "SHORT_TEXT",
]);
export const DRAFT_ACTION_ID_PREFIX = "draft:";

export function makeDraftActionId(draftKey: string) {
  return `${DRAFT_ACTION_ID_PREFIX}${draftKey}`;
}

export function isDraftActionId(actionId: string | null | undefined): actionId is string {
  return Boolean(actionId?.startsWith(DRAFT_ACTION_ID_PREFIX));
}

export function hasDraftActionReference(values: ActionFormValues): boolean {
  if (isDraftActionId(values.nextActionId)) {
    return true;
  }

  return values.options?.some(option => isDraftActionId(option.nextActionId) === true) ?? false;
}

export function resolveDraftActionReferences(
  values: ActionFormValues,
  idMap: Map<string, string>,
  unresolvedToNull = true,
): ActionFormValues {
  const resolveActionId = (actionId: string | null | undefined) => {
    if (!isDraftActionId(actionId)) {
      return actionId ?? null;
    }

    const resolved = idMap.get(actionId);
    if (resolved) {
      return resolved;
    }

    return unresolvedToNull ? null : actionId;
  };

  return {
    ...values,
    nextActionId: resolveActionId(values.nextActionId),
    options: values.options?.map(option => ({
      ...option,
      nextActionId: resolveActionId(option.nextActionId),
    })),
  };
}

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
    imageUrl: values.imageUrl ?? null,
    imageFileUploadId: values.imageFileUploadId ?? null,
    hasOther: values.hasOther,
    nextActionId: values.nextActionId,
    nextCompletionId: values.nextCompletionId,
    ...(values.maxSelections !== undefined && { maxSelections: values.maxSelections }),
    ...(values.score !== undefined && { score: values.score }),
    ...(values.matchMode !== undefined && { matchMode: values.matchMode }),
    ...(values.hint !== undefined && { hint: values.hint }),
    ...(values.explanation !== undefined && { explanation: values.explanation }),
    ...(values.options && {
      options: values.options.map((option, index) => ({
        title: option.title,
        description: option.description,
        imageUrl: option.imageUrl,
        fileUploadId: option.fileUploadId,
        isCorrect: option.isCorrect,
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
  actionType?: ActionType;
  previousActionType?: ActionType;
}) {
  const { missionId, editingActionId, values, actionType, previousActionType } = params;
  const hasOptions = values.options !== undefined;
  const mappedOptions = values.options?.map((option, index) => ({
    id: option.id,
    title: option.title,
    description: option.description,
    imageUrl: option.imageUrl,
    fileUploadId: option.fileUploadId,
    isCorrect: option.isCorrect,
    nextActionId: option.nextActionId,
    nextCompletionId: option.nextCompletionId,
    order: index,
  }));
  const switchedToNonOptionType =
    actionType !== undefined &&
    previousActionType !== undefined &&
    !OPTION_BASED_TYPES.has(actionType) &&
    OPTION_BASED_TYPES.has(previousActionType);

  return {
    actionId: editingActionId,
    missionId,
    ...(actionType !== undefined && { type: actionType }),
    title: values.title,
    description: values.description,
    imageUrl: values.imageUrl ?? null,
    imageFileUploadId: values.imageFileUploadId ?? null,
    isRequired: values.isRequired,
    hasOther: values.hasOther,
    nextActionId: values.nextActionId,
    nextCompletionId: values.nextCompletionId,
    ...(values.maxSelections !== undefined && { maxSelections: values.maxSelections }),
    ...(values.score !== undefined && { score: values.score }),
    ...(values.matchMode !== undefined && { matchMode: values.matchMode }),
    ...(values.hint !== undefined && { hint: values.hint }),
    ...(values.explanation !== undefined && { explanation: values.explanation }),
    ...(mappedOptions && { options: mappedOptions }),
    ...(!hasOptions && switchedToNonOptionType && { options: [] as Array<never> }),
  };
}

export function mapEditInitialValues(action: ActionDetail): ActionFormValues {
  return {
    title: action.title,
    description: action.description,
    imageUrl: action.imageUrl,
    imageFileUploadId: action.imageFileUploadId,
    isRequired: action.isRequired,
    hasOther: action.hasOther ?? false,
    maxSelections: action.maxSelections ?? 1,
    options: action.options?.map(option => ({
      id: option.id,
      title: option.title,
      description: option.description,
      imageUrl: option.imageUrl,
      fileUploadId: option.fileUploadId,
      isCorrect: option.isCorrect,
      nextActionId: option.nextActionId,
      nextCompletionId: option.nextCompletionId,
      order: option.order,
    })),
    nextActionId: action.nextActionId,
    nextCompletionId: action.nextCompletionId,
    score: action.score,
    matchMode: action.matchMode,
    hint: action.hint,
    explanation: action.explanation,
  };
}
