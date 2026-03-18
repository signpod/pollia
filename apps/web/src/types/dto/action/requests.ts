import type {
  BranchInput,
  DateInput,
  ImageInput,
  MultipleChoiceInput,
  OXInput,
  PdfInput,
  RatingInput,
  ScaleInput,
  ShortTextInput,
  SubjectiveInput,
  TagInput,
  TimeInput,
  VideoInput,
} from "@/schemas/action";
import type { ActionUpdate } from "@/schemas/action";
import type { OptionItem } from "@/schemas/action-option";

export type CreateMultipleChoiceActionRequest = MultipleChoiceInput;
export type CreateScaleActionRequest = ScaleInput;
export type CreateTagActionRequest = TagInput;
export type CreateSubjectiveActionRequest = SubjectiveInput;
export type CreateShortTextActionRequest = ShortTextInput;
export type CreateRatingActionRequest = RatingInput;
export type CreateImageActionRequest = ImageInput;
export type CreatePdfActionRequest = PdfInput;
export type CreateVideoActionRequest = VideoInput;
export type CreateDateActionRequest = DateInput;
export type CreateTimeActionRequest = TimeInput;
export type CreateBranchActionRequest = BranchInput;
export type CreateOXActionRequest = OXInput;

export type UpdateActionRequest = ActionUpdate;
export type UpdateActionOptionRequest = OptionItem;

export type BaseActionRequest = SubjectiveInput;
export type ActionOptionInput = OptionItem;
