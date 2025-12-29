import type { ActionType, Prisma } from "@prisma/client";

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

export type UpdateActionOptionInput = Omit<ActionOptionInput, "order"> & {
  order: number;
};

export type UpdateActionInput = Prisma.ActionUncheckedUpdateInput;

export interface GetActionsOptions {
  searchQuery?: string;
  selectedActionTypes?: ActionType[];
  isDraft?: boolean;
  cursor?: string;
  limit?: number;
}

export interface ActionCreatedResult {
  id: string;
  missionId: string;
  title: string;
  type: ActionType;
  order: number;
  createdAt: Date;
}
