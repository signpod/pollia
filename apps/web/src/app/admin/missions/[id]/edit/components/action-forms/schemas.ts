import { actionDescriptionSchema, actionImageUrlSchema, actionTitleSchema } from "@/schemas/action";
import { actionOptionSchema } from "@/schemas/action-option";
import { z } from "zod";

export const TAG_MIN_OPTIONS = 2;
export const TAG_MAX_OPTIONS = 20;
export const MULTIPLE_CHOICE_MIN_OPTIONS = 2;
export const MULTIPLE_CHOICE_MAX_OPTIONS = 10;
export const SCALE_MIN_OPTIONS = 3;
export const SCALE_MAX_OPTIONS = 10;

const actionOptionFormSchema = actionOptionSchema.omit({ order: true }).extend({
  id: z.string(),
  imageUrl: z.string().optional(),
});

export const multipleChoiceFormSchema = z
  .object({
    title: actionTitleSchema,
    description: actionDescriptionSchema,
    imageUrl: actionImageUrlSchema,
    maxSelections: z.number().int().min(1, "최소 1개 이상 선택 가능해야 합니다."),
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

export const scaleFormSchema = z
  .object({
    title: actionTitleSchema,
    description: actionDescriptionSchema,
    imageUrl: actionImageUrlSchema,
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

export const tagFormSchema = z
  .object({
    title: actionTitleSchema,
    description: actionDescriptionSchema,
    imageUrl: actionImageUrlSchema,
    maxSelections: z.number().int().min(1, "최소 1개 이상 선택 가능해야 합니다."),
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
  .refine(data => data.maxSelections <= data.options.length, {
    message: "선택 가능 개수는 태그 개수를 초과할 수 없습니다.",
    path: ["maxSelections"],
  });

export const subjectiveFormSchema = z.object({
  title: actionTitleSchema,
  description: actionDescriptionSchema,
  imageUrl: actionImageUrlSchema,
});

export type MultipleChoiceFormInput = z.infer<typeof multipleChoiceFormSchema>;
export type ScaleFormInput = z.infer<typeof scaleFormSchema>;
export type SubjectiveFormInput = z.infer<typeof subjectiveFormSchema>;
export type TagFormInput = z.infer<typeof tagFormSchema>;
