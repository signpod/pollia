import { z } from "zod";

const actionTitleSchema = z
  .string()
  .min(1, "제목을 입력해주세요.")
  .max(30, "제목은 30자를 초과할 수 없습니다.")
  .trim();

const actionDescriptionSchema = z
  .string()
  .max(500, "설명은 500자를 초과할 수 없습니다.")
  .optional();

const actionImageUrlSchema = z.string().optional();

const actionOptionFormSchema = z.object({
  id: z.string(),
  title: z.string(),
  description: z.string().optional(),
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
  .refine(data => data.options.length >= 2 && data.options.length <= 10, {
    message: "선택지는 2개~10개까지 가능합니다.",
    path: ["options"],
  })
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
  .refine(data => data.options.length >= 3 && data.options.length <= 10, {
    message: "척도는 3개~10개의 옵션이 필요합니다.",
    path: ["options"],
  })
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
  .refine(data => data.options.length >= 2 && data.options.length <= 10, {
    message: "태그는 2개~10개의 옵션이 필요합니다.",
    path: ["options"],
  })
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
