import type { ActionType as PrismaActionType } from "@prisma/client";

export type ActionType = PrismaActionType;

export interface ActionOptionInput {
  title: string;
  description?: string | null;
  imageUrl?: string | null;
  imageFileUploadId?: string | null;
}

export interface BaseActionFormData {
  title: string;
  description?: string | null;
  imageUrl?: string | null;
  imageFileUploadId?: string | null;
  isRequired: boolean;
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
}

export interface ShortTextFormData extends BaseActionFormData {
  type: "SHORT_TEXT";
}

export interface ImageUploadFormData extends BaseActionFormData {
  type: "IMAGE";
  maxSelections?: number;
}

export interface PdfUploadFormData extends BaseActionFormData {
  type: "PDF";
}

export interface VideoUploadFormData extends BaseActionFormData {
  type: "VIDEO";
}

export interface PrivacyConsentFormData extends BaseActionFormData {
  type: "PRIVACY_CONSENT";
}

export interface DateFormData extends BaseActionFormData {
  type: "DATE";
  maxSelections?: number;
}

export interface TimeFormData extends BaseActionFormData {
  type: "TIME";
  maxSelections?: number;
}

export type ActionFormData =
  | MultipleChoiceFormData
  | ScaleFormData
  | RatingFormData
  | TagFormData
  | SubjectiveFormData
  | ShortTextFormData
  | ImageUploadFormData
  | PdfUploadFormData
  | VideoUploadFormData
  | PrivacyConsentFormData
  | DateFormData
  | TimeFormData;

export interface ActionFormProps<T extends ActionFormData = ActionFormData> {
  isLoading?: boolean;
  onSubmit: (data: T) => void;
  onCancel: () => void;
  initialData?: Partial<Omit<T, "type">>;
}
