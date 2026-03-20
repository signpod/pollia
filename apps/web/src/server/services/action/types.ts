import type { Action, ActionType, MatchMode, Prisma } from "@prisma/client";

export type BaseActionInput = Omit<
  Prisma.ActionUncheckedCreateInput,
  "id" | "createdAt" | "updatedAt" | "type"
>;

interface ActionOptionInput {
  title: string;
  description?: string | null;
  imageUrl?: string | null;
  order: number;
  isCorrect?: boolean;
  imageFileUploadId?: string | null;
  nextActionId?: string | null;
  nextCompletionId?: string | null;
}

export type BaseActionInputWithOptions = BaseActionInput & {
  options: ActionOptionInput[];
};

export type CreateMultipleChoiceInput = BaseActionInputWithOptions & {
  maxSelections: number;
  score?: number | null;
  hint?: string | null;
  explanation?: string | null;
};

export type CreateScaleInput = BaseActionInputWithOptions;

export type CreateTagInput = BaseActionInputWithOptions & {
  maxSelections?: number;
};

export type CreateSubjectiveInput = BaseActionInput;

export type CreateShortTextInput = BaseActionInput & {
  options?: ActionOptionInput[];
  score?: number | null;
  matchMode?: MatchMode | null;
  hint?: string | null;
  explanation?: string | null;
};

export type CreateEitherOrInput = BaseActionInput;

export type CreateRatingInput = BaseActionInput;

export type CreateImageInput = BaseActionInput;

export type CreatePdfInput = BaseActionInput;

export type CreateVideoInput = BaseActionInput;

export type CreatePrivacyConsentInput = BaseActionInput;

export type CreateDateInput = BaseActionInput & {
  maxSelections: number;
};

export type CreateTimeInput = BaseActionInput & {
  maxSelections: number;
};

export type CreateBranchInput = BaseActionInputWithOptions & {
  maxSelections: 1;
  hasOther: false;
};

export type CreateOXInput = BaseActionInputWithOptions & {
  maxSelections: 1;
  hasOther: false;
  score?: number | null;
  correctOptionId?: string | null;
  hint?: string | null;
  explanation?: string | null;
};

export type UpdateActionOptionInput = Omit<ActionOptionInput, "order"> & {
  id?: string;
  order: number;
  isCorrect?: boolean;
};

export type UpdateActionInput = Omit<Prisma.ActionUncheckedUpdateInput, "options"> & {
  options?: UpdateActionOptionInput[];
};

export interface GetActionsOptions {
  searchQuery?: string;
  selectedActionTypes?: ActionType[];
  isDraft?: boolean;
  cursor?: string;
  limit?: number;
}

export type ActionCreatedResult = Pick<
  Action,
  | "id"
  | "missionId"
  | "title"
  | "type"
  | "order"
  | "isRequired"
  | "createdAt"
  | "nextActionId"
  | "nextCompletionId"
>;

export interface SaveActionSectionInput {
  missionId: string;
  completionsToCreate: CompletionToCreate[];
  actionsToCreate: ActionToCreate[];
  actionsToUpdate: ActionToUpdate[];
  actionOrder: string[];
  entryActionKey: string | null;
}

export interface CompletionToCreate {
  tempId: string;
  title: string;
  description: string;
  imageUrl?: string | null;
  imageFileUploadId?: string | null;
}

export interface ActionToCreate {
  tempId: string;
  actionType: ActionType;
  values: ActionFormValuesInput;
}

export interface ActionToUpdate {
  actionId: string;
  actionType: ActionType;
  values: ActionFormValuesInput;
}

export interface ActionFormValuesInput {
  title: string;
  description?: string | null;
  imageUrl?: string | null;
  imageFileUploadId?: string | null;
  isRequired: boolean;
  hasOther?: boolean;
  maxSelections?: number;
  options?: SaveActionOptionInput[];
  nextActionId?: string | null;
  nextCompletionId?: string | null;
  score?: number | null;
  matchMode?: MatchMode | null;
  hint?: string | null;
  explanation?: string | null;
}

export interface SaveActionOptionInput {
  id?: string;
  title: string;
  description?: string | null;
  imageUrl?: string | null;
  order: number;
  isCorrect?: boolean;
  fileUploadId?: string | null;
  nextActionId?: string | null;
  nextCompletionId?: string | null;
}

export interface SaveActionSectionResult {
  createdActionIds: string[];
  updatedActionIds: string[];
  createdCompletionIds: string[];
  tempToRealActionIdMap: Record<string, string>;
  tempToRealCompletionIdMap: Record<string, string>;
}
