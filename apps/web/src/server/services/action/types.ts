import type { Action, ActionType, Prisma } from "@prisma/client";

type BaseActionInput = Omit<
  Prisma.ActionUncheckedCreateInput,
  "id" | "createdAt" | "updatedAt" | "type"
>;

interface ActionOptionInput {
  title: string;
  description?: string;
  imageUrl?: string;
  order: number;
  imageFileUploadId?: string;
}

export type CreateMultipleChoiceInput = BaseActionInput & {
  options: ActionOptionInput[];
};

export type CreateScaleInput = BaseActionInput & {
  options: ActionOptionInput[];
};

export type CreateTagInput = BaseActionInput & {
  options: ActionOptionInput[];
};

export type CreateSubjectiveInput = BaseActionInput;

export type CreateEitherOrInput = BaseActionInput;

export type CreateRatingInput = BaseActionInput;

export type CreateImageInput = BaseActionInput;

export type CreatePrivacyConsentInput = BaseActionInput;

export type CreateDateInput = BaseActionInput & {
  maxSelections: number;
};

export type CreateTimeInput = BaseActionInput & {
  maxSelections: number;
};

export type UpdateActionOptionInput = Omit<ActionOptionInput, "order"> & {
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
  "id" | "missionId" | "title" | "type" | "order" | "isRequired" | "createdAt"
>;
