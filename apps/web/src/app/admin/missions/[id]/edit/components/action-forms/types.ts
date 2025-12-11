import type { ActionType as PrismaActionType } from "@prisma/client";

export type ActionType = Extract<
  PrismaActionType,
  "MULTIPLE_CHOICE" | "SCALE" | "RATING" | "TAG" | "SUBJECTIVE" | "IMAGE"
>;

export interface ActionOptionInput {
  title: string;
  description?: string;
  imageUrl?: string;
  imageFileUploadId?: string;
}

export interface BaseActionFormData {
  title: string;
  description?: string;
  imageUrl?: string;
  imageFileUploadId?: string;
}

export interface MultipleChoiceFormData extends BaseActionFormData {
  type: "MULTIPLE_CHOICE";
  options: ActionOptionInput[];
  maxSelections?: number;
}

export interface ScaleFormData extends BaseActionFormData {
  type: "SCALE";
  options: ActionOptionInput[];
}

export interface RatingFormData extends BaseActionFormData {
  type: "RATING";
}

export interface TagFormData extends BaseActionFormData {
  type: "TAG";
  options: ActionOptionInput[];
  maxSelections?: number;
}

export interface SubjectiveFormData extends BaseActionFormData {
  type: "SUBJECTIVE";
  maxLength?: number;
  placeholder?: string;
}

export interface ImageUploadFormData extends BaseActionFormData {
  type: "IMAGE";
  maxFiles?: number;
  acceptedFormats?: string[];
}

export type ActionFormData =
  | MultipleChoiceFormData
  | ScaleFormData
  | RatingFormData
  | TagFormData
  | SubjectiveFormData
  | ImageUploadFormData;

export interface ActionFormProps<T extends ActionFormData = ActionFormData> {
  isLoading?: boolean;
  onSubmit: (data: T) => void;
  onCancel: () => void;
  initialData?: Partial<Omit<T, "type">>;
}
