import { actionOptionSchema } from "@/schemas/action-option";
import { z } from "zod";

export const ACTION_TITLE_MAX_LENGTH = 100;
export const ACTION_DESCRIPTION_MAX_LENGTH = 3000;
export const ACTION_OPTION_TITLE_MAX_LENGTH = 50;
export const ACTION_OPTION_DESCRIPTION_MAX_LENGTH = 200;

export const TAG_MIN_OPTIONS = 2;
export const TAG_MAX_OPTIONS = 20;
export const MULTIPLE_CHOICE_MIN_OPTIONS = 2;
export const MULTIPLE_CHOICE_MAX_OPTIONS = 10;
export const SCALE_MIN_OPTIONS = 3;
export const SCALE_MAX_OPTIONS = 10;
export const BRANCH_OPTIONS_COUNT = 2;

export const IMAGE_MAX_SELECTIONS = 10;
export const DATE_MAX_SELECTIONS = 20;
export const TIME_MAX_SELECTIONS = 20;

export const actionTitleSchema = z
  .string()
  .min(1, "제목을 입력해주세요.")
  .max(ACTION_TITLE_MAX_LENGTH, `제목은 ${ACTION_TITLE_MAX_LENGTH}자를 초과할 수 없습니다.`)
  .trim();

export const actionDescriptionSchema = z
  .string()
  .max(
    ACTION_DESCRIPTION_MAX_LENGTH,
    `설명은 ${ACTION_DESCRIPTION_MAX_LENGTH}자를 초과할 수 없습니다.`,
  )
  .nullable()
  .optional();

export const actionImageUrlSchema = z
  .url({ message: "올바른 URL 형식이 아닙니다." })
  .nullable()
  .optional();

export const actionOptionTitleSchema = z
  .string()
  .min(1, "항목 제목을 입력해주세요.")
  .max(
    ACTION_OPTION_TITLE_MAX_LENGTH,
    `항목 제목은 ${ACTION_OPTION_TITLE_MAX_LENGTH}자를 초과할 수 없습니다.`,
  )
  .trim();

export const actionOptionDescriptionSchema = z
  .string()
  .max(
    ACTION_OPTION_DESCRIPTION_MAX_LENGTH,
    `설명은 ${ACTION_OPTION_DESCRIPTION_MAX_LENGTH}자를 초과할 수 없습니다.`,
  )
  .optional();

const actionOrderSchema = z
  .number()
  .int("순서는 정수여야 합니다.")
  .min(0, "순서는 0 이상이어야 합니다.");

const actionMissionIdSchema = z.string().min(1, "미션 ID가 필요합니다.").optional();

const baseActionSchema = z.object({
  missionId: actionMissionIdSchema,
  title: actionTitleSchema,
  description: actionDescriptionSchema,
  imageUrl: actionImageUrlSchema,
  imageFileUploadId: z.string().nullable().optional(),
  order: actionOrderSchema,
  isRequired: z.boolean(),
  hasOther: z.boolean().optional(),
  nextActionId: z.string().nullable().optional(),
  nextCompletionId: z.string().nullable().optional(),
});

export const multipleChoiceInputSchema = baseActionSchema
  .extend({
    maxSelections: z.number().int().min(1, "최대 선택 가능 개수는 최소 1개 이상이어야 합니다."),
    options: z
      .array(actionOptionSchema)
      .min(
        MULTIPLE_CHOICE_MIN_OPTIONS,
        `최소 ${MULTIPLE_CHOICE_MIN_OPTIONS}개 이상의 항목이 필요합니다.`,
      )
      .max(MULTIPLE_CHOICE_MAX_OPTIONS, `최대 ${MULTIPLE_CHOICE_MAX_OPTIONS}개까지 가능합니다.`),
  })
  .refine(data => data.maxSelections <= data.options.length, {
    message: "최대 선택 가능 개수는 옵션 개수를 초과할 수 없습니다.",
    path: ["maxSelections"],
  });

export const scaleInputSchema = baseActionSchema.extend({
  options: z
    .array(actionOptionSchema)
    .min(SCALE_MIN_OPTIONS, `최소 ${SCALE_MIN_OPTIONS}개 이상의 항목이 필요합니다.`)
    .max(SCALE_MAX_OPTIONS, `최대 ${SCALE_MAX_OPTIONS}개까지 가능합니다.`),
});

export const subjectiveInputSchema = baseActionSchema;

export const shortTextInputSchema = baseActionSchema;

export const eitherOrInputSchema = baseActionSchema;

export const tagInputSchema = baseActionSchema
  .extend({
    maxSelections: z
      .number()
      .int()
      .min(1, "최대 선택 가능 개수는 최소 1개 이상이어야 합니다.")
      .optional(),
    options: z
      .array(actionOptionSchema)
      .min(TAG_MIN_OPTIONS, `최소 ${TAG_MIN_OPTIONS}개 이상의 항목이 필요합니다.`)
      .max(TAG_MAX_OPTIONS, `최대 ${TAG_MAX_OPTIONS}개까지 가능합니다.`),
  })
  .refine(data => !data.maxSelections || data.maxSelections <= data.options.length, {
    message: "최대 선택 가능 개수는 옵션 개수를 초과할 수 없습니다.",
    path: ["maxSelections"],
  });

export const ratingInputSchema = baseActionSchema;

export const imageInputSchema = baseActionSchema.extend({
  maxSelections: z
    .number()
    .int()
    .min(1, "최대 선택 가능 개수는 최소 1개 이상이어야 합니다.")
    .optional(),
});

export const pdfInputSchema = baseActionSchema;

export const videoInputSchema = baseActionSchema;

export const privacyConsentInputSchema = baseActionSchema;

export const dateInputSchema = baseActionSchema.extend({
  maxSelections: z.number().int().min(1, "최대 선택 가능 개수는 최소 1개 이상이어야 합니다."),
});

export const timeInputSchema = baseActionSchema.extend({
  maxSelections: z.number().int().min(1, "최대 선택 가능 개수는 최소 1개 이상이어야 합니다."),
});

export const BRANCH_MAX_SELECTIONS = 1;
export const BRANCH_HAS_OTHER = false;

export const branchInputSchema = baseActionSchema
  .extend({
    maxSelections: z.literal(BRANCH_MAX_SELECTIONS),
    hasOther: z.literal(BRANCH_HAS_OTHER),
    options: z
      .array(
        actionOptionSchema.extend({
          nextActionId: z.string().nullable().optional(),
        }),
      )
      .length(
        BRANCH_OPTIONS_COUNT,
        `분기 액션은 정확히 ${BRANCH_OPTIONS_COUNT}개의 선택지가 필요합니다.`,
      ),
  })
  .omit({ nextActionId: true, nextCompletionId: true });

export const actionUpdateSchema = z
  .object({
    title: actionTitleSchema.optional(),
    description: actionDescriptionSchema,
    imageUrl: actionImageUrlSchema,
    imageFileUploadId: z.string().nullable().optional(),
    order: actionOrderSchema.optional(),
    maxSelections: z
      .number()
      .int()
      .min(1, "최대 선택 가능 개수는 최소 1개 이상이어야 합니다.")
      .optional(),
    isRequired: z.boolean().optional(),
    hasOther: z.boolean().optional(),
    options: z.array(actionOptionSchema).optional(),
    nextActionId: z.string().nullable().optional(),
    nextCompletionId: z.string().nullable().optional(),
  })
  .refine(data => Object.keys(data).length > 0, {
    message: "최소 하나의 필드를 수정해야 합니다.",
  });

export type MultipleChoiceInput = z.infer<typeof multipleChoiceInputSchema>;
export type ScaleInput = z.infer<typeof scaleInputSchema>;
export type SubjectiveInput = z.infer<typeof subjectiveInputSchema>;
export type ShortTextInput = z.infer<typeof shortTextInputSchema>;
export type EitherOrInput = z.infer<typeof eitherOrInputSchema>;
export type TagInput = z.infer<typeof tagInputSchema>;
export type RatingInput = z.infer<typeof ratingInputSchema>;
export type ImageInput = z.infer<typeof imageInputSchema>;
export type PdfInput = z.infer<typeof pdfInputSchema>;
export type VideoInput = z.infer<typeof videoInputSchema>;
export type PrivacyConsentInput = z.infer<typeof privacyConsentInputSchema>;
export type DateInput = z.infer<typeof dateInputSchema>;
export type TimeInput = z.infer<typeof timeInputSchema>;
export type BranchInput = z.infer<typeof branchInputSchema>;
export type ActionOption = z.infer<typeof actionOptionSchema>;
export type ActionUpdate = z.infer<typeof actionUpdateSchema>;
