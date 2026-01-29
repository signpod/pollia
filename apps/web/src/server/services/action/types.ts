import type { Action, ActionType, Prisma } from "@prisma/client";

export type BaseActionInput = Omit<
  Prisma.ActionUncheckedCreateInput,
  "id" | "createdAt" | "updatedAt" | "type"
>;

interface ActionOptionInput {
  title: string;
  description?: string | null;
  imageUrl?: string | null;
  order: number;
  imageFileUploadId?: string | null;
  nextActionId?: string | null;
  nextCompletionId?: string | null;
}

export type BaseActionInputWithOptions = BaseActionInput & {
  options: ActionOptionInput[];
};

export type CreateMultipleChoiceInput = BaseActionInputWithOptions & {
  maxSelections: number;
};

export type CreateScaleInput = BaseActionInputWithOptions;

export type CreateTagInput = BaseActionInputWithOptions & {
  maxSelections?: number;
};

export type CreateSubjectiveInput = BaseActionInput;

export type CreateShortTextInput = BaseActionInput;

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

export type UpdateActionOptionInput = Omit<ActionOptionInput, "order"> & {
  id?: string;
  order: number;
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
