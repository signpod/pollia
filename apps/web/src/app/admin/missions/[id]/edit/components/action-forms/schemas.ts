import {
  MULTIPLE_CHOICE_MAX_OPTIONS,
  MULTIPLE_CHOICE_MIN_OPTIONS,
  SCALE_MAX_OPTIONS,
  SCALE_MIN_OPTIONS,
  TAG_MAX_OPTIONS,
  TAG_MIN_OPTIONS,
  dateInputSchema,
  imageInputSchema,
  multipleChoiceInputSchema,
  pdfInputSchema,
  privacyConsentInputSchema,
  ratingInputSchema,
  scaleInputSchema,
  subjectiveInputSchema,
  tagInputSchema,
  timeInputSchema,
  videoInputSchema,
} from "@/schemas/action";
import { actionOptionSchema } from "@/schemas/action-option";
import { z } from "zod";

export {
  MULTIPLE_CHOICE_MAX_OPTIONS,
  MULTIPLE_CHOICE_MIN_OPTIONS,
  SCALE_MAX_OPTIONS,
  SCALE_MIN_OPTIONS,
  TAG_MAX_OPTIONS,
  TAG_MIN_OPTIONS,
};

const actionOptionFormSchema = actionOptionSchema.omit({ order: true }).extend({
  id: z.string(),
  imageUrl: z.string().optional(),
});

export const multipleChoiceFormSchema = multipleChoiceInputSchema
  .omit({ missionId: true, order: true, imageFileUploadId: true })
  .extend({
    options: z.array(actionOptionFormSchema),
  })
  .refine(
    data =>
      data.options.length >= MULTIPLE_CHOICE_MIN_OPTIONS &&
      data.options.length <= MULTIPLE_CHOICE_MAX_OPTIONS,
    {
      message: `선택지는 ${MULTIPLE_CHOICE_MIN_OPTIONS}개~${MULTIPLE_CHOICE_MAX_OPTIONS}개까지 가능합니다.`,
      path: ["options"],
    },
  )
  .refine(data => data.options.every(opt => opt.title.trim().length > 0), {
    message: "모든 선택지에 제목을 입력해주세요.",
    path: ["options"],
  })
  .refine(data => data.maxSelections <= data.options.length, {
    message: "선택 가능 개수는 선택지 개수를 초과할 수 없습니다.",
    path: ["maxSelections"],
  });

export const scaleFormSchema = scaleInputSchema
  .omit({ missionId: true, order: true, imageFileUploadId: true })
  .extend({
    options: z.array(actionOptionFormSchema),
  })
  .refine(
    data => data.options.length >= SCALE_MIN_OPTIONS && data.options.length <= SCALE_MAX_OPTIONS,
    {
      message: `척도는 ${SCALE_MIN_OPTIONS}개~${SCALE_MAX_OPTIONS}개의 옵션이 필요합니다.`,
      path: ["options"],
    },
  )
  .refine(data => data.options.every(opt => opt.title.trim().length > 0), {
    message: "모든 선택지에 제목을 입력해주세요.",
    path: ["options"],
  });

export const tagFormSchema = tagInputSchema
  .omit({ missionId: true, order: true, imageFileUploadId: true })
  .extend({
    options: z.array(actionOptionFormSchema),
  })
  .refine(
    data => data.options.length >= TAG_MIN_OPTIONS && data.options.length <= TAG_MAX_OPTIONS,
    {
      message: `태그는 ${TAG_MIN_OPTIONS}개~${TAG_MAX_OPTIONS}개의 옵션이 필요합니다.`,
      path: ["options"],
    },
  )
  .refine(data => data.options.every(opt => opt.title.trim().length > 0), {
    message: "모든 태그에 제목을 입력해주세요.",
    path: ["options"],
  })
  .refine(data => !data.maxSelections || data.maxSelections <= data.options.length, {
    message: "선택 가능 개수는 태그 개수를 초과할 수 없습니다.",
    path: ["maxSelections"],
  });

export const subjectiveFormSchema = subjectiveInputSchema.omit({
  missionId: true,
  order: true,
  imageFileUploadId: true,
});

export const ratingFormSchema = ratingInputSchema.omit({
  missionId: true,
  order: true,
  imageFileUploadId: true,
});

export const imageUploadFormSchema = imageInputSchema
  .omit({
    missionId: true,
    order: true,
    imageFileUploadId: true,
    maxSelections: true,
  })
  .extend({
    maxSelections: z
      .number()
      .int()
      .min(1, "선택 가능 개수는 최소 1개입니다.")
      .max(10, "선택 가능 개수는 최대 10개입니다.")
      .optional(),
  });

export const pdfUploadFormSchema = pdfInputSchema.omit({
  missionId: true,
  order: true,
  imageFileUploadId: true,
});

export const videoUploadFormSchema = videoInputSchema.omit({
  missionId: true,
  order: true,
  imageFileUploadId: true,
});

export const privacyConsentFormSchema = privacyConsentInputSchema.omit({
  missionId: true,
  order: true,
  imageFileUploadId: true,
});

export const dateFormSchema = dateInputSchema
  .omit({
    missionId: true,
    order: true,
    imageFileUploadId: true,
    maxSelections: true,
  })
  .extend({
    maxSelections: z
      .number()
      .int()
      .min(1, "선택 가능 개수는 최소 1개입니다.")
      .max(20, "선택 가능 개수는 최대 20개입니다.")
      .optional(),
  });

export const timeFormSchema = timeInputSchema
  .omit({
    missionId: true,
    order: true,
    imageFileUploadId: true,
    maxSelections: true,
  })
  .extend({
    maxSelections: z
      .number()
      .int()
      .min(1, "선택 가능 개수는 최소 1개입니다.")
      .max(20, "선택 가능 개수는 최대 20개입니다.")
      .optional(),
  });

export type MultipleChoiceFormInput = z.infer<typeof multipleChoiceFormSchema>;
export type ScaleFormInput = z.infer<typeof scaleFormSchema>;
export type SubjectiveFormInput = z.infer<typeof subjectiveFormSchema>;
export type TagFormInput = z.infer<typeof tagFormSchema>;
export type RatingFormInput = z.infer<typeof ratingFormSchema>;
export type ImageUploadFormInput = z.infer<typeof imageUploadFormSchema>;
export type PdfUploadFormInput = z.infer<typeof pdfUploadFormSchema>;
export type VideoUploadFormInput = z.infer<typeof videoUploadFormSchema>;
export type PrivacyConsentFormInput = z.infer<typeof privacyConsentFormSchema>;
export type DateFormInput = z.infer<typeof dateFormSchema>;
export type TimeFormInput = z.infer<typeof timeFormSchema>;
