import { z } from "zod";

const titleSchema = z
  .string()
  .min(1, "제목을 입력해주세요.")
  .max(30, "제목은 30자를 초과할 수 없습니다.")
  .trim();

const descriptionSchema = z.string().max(100, "설명은 100자를 초과할 수 없습니다.").optional();

const imageUrlSchema = z.url({ message: "올바른 URL 형식이 아닙니다." }).optional();

const orderSchema = z.number().int("순서는 정수여야 합니다.").min(0, "순서는 0 이상이어야 합니다.");

const missionIdSchema = z.string().min(1, "미션 ID가 필요합니다.").optional();

const actionOptionSchema = z.object({
  title: z.string().min(1, "항목 제목을 입력해주세요.").trim(),
  description: z.string().optional(),
  imageUrl: imageUrlSchema,
  order: orderSchema,
  imageFileUploadId: z.string().optional(),
});

const baseActionSchema = z.object({
  missionId: missionIdSchema,
  title: titleSchema,
  description: descriptionSchema,
  imageUrl: imageUrlSchema,
  order: orderSchema,
});

export const multipleChoiceInputSchema = baseActionSchema
  .extend({
    maxSelections: z.number().int().min(1, "선택 가능 개수는 최소 1개입니다."),
    options: z.array(actionOptionSchema).min(2, "최소 2개 이상의 항목이 필요합니다."),
  })
  .refine(
    data => {
      const validOptions = data.options.filter(option => option.title.trim());
      return validOptions.length >= 2;
    },
    { message: "최소 2개 이상의 유효한 항목이 필요합니다.", path: ["options"] },
  )
  .refine(
    data => {
      const validOptions = data.options.filter(option => option.title.trim());
      return data.maxSelections <= validOptions.length;
    },
    { message: "선택 가능 개수는 유효한 항목 개수를 초과할 수 없습니다.", path: ["maxSelections"] },
  );

export const scaleInputSchema = baseActionSchema
  .extend({
    options: z.array(actionOptionSchema).min(3, "최소 3개 이상의 척도가 필요합니다."),
  })
  .refine(
    data => {
      const validOptions = data.options.filter(option => option.title.trim());
      return validOptions.length >= 3;
    },
    { message: "최소 3개 이상의 유효한 척도가 필요합니다.", path: ["options"] },
  );

export const subjectiveInputSchema = baseActionSchema;

export const eitherOrInputSchema = baseActionSchema;

export const tagInputSchema = baseActionSchema
  .extend({
    imageFileUploadId: z.string().optional(),
    maxSelections: z.number().int().min(1, "선택 가능 개수는 최소 1개입니다.").optional(),
    options: z.array(actionOptionSchema).min(2, "최소 2개 이상의 태그가 필요합니다."),
  })
  .refine(
    data => {
      const validOptions = data.options.filter(option => option.title.trim());
      return validOptions.length >= 2;
    },
    { message: "최소 2개 이상의 유효한 태그가 필요합니다.", path: ["options"] },
  );

export const ratingInputSchema = baseActionSchema.extend({
  imageFileUploadId: z.string().optional(),
});

export const imageInputSchema = baseActionSchema.extend({
  imageFileUploadId: z.string().optional(),
});

export const actionUpdateSchema = z
  .object({
    title: titleSchema.optional(),
    description: descriptionSchema,
    imageUrl: imageUrlSchema,
    order: orderSchema.optional(),
    maxSelections: z.number().int().min(1, "선택 가능 개수는 최소 1개입니다.").optional(),
    options: z.array(actionOptionSchema).optional(),
  })
  .refine(data => Object.keys(data).length > 0, {
    message: "최소 하나의 필드를 수정해야 합니다.",
  });

export type MultipleChoiceInput = z.infer<typeof multipleChoiceInputSchema>;
export type ScaleInput = z.infer<typeof scaleInputSchema>;
export type SubjectiveInput = z.infer<typeof subjectiveInputSchema>;
export type EitherOrInput = z.infer<typeof eitherOrInputSchema>;
export type TagInput = z.infer<typeof tagInputSchema>;
export type RatingInput = z.infer<typeof ratingInputSchema>;
export type ImageInput = z.infer<typeof imageInputSchema>;
export type ActionOption = z.infer<typeof actionOptionSchema>;
export type ActionUpdate = z.infer<typeof actionUpdateSchema>;
