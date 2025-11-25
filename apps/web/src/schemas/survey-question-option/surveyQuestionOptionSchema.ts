import { z } from "zod";

const titleSchema = z
  .string()
  .min(1, "옵션 제목을 입력해주세요.")
  .max(100, "옵션 제목은 100자를 초과할 수 없습니다.")
  .trim();

const descriptionSchema = z.string().optional();

const imageUrlSchema = z.url({ message: "올바른 URL 형식이 아닙니다." }).optional();

const orderSchema = z
  .number()
  .int("순서는 정수여야 합니다.")
  .min(0, "옵션 순서는 0 이상이어야 합니다.");

const questionIdSchema = z.string().min(1, "질문 ID가 필요합니다.");

const fileUploadIdSchema = z.string().optional();

export const optionInputSchema = z.object({
  questionId: questionIdSchema,
  title: titleSchema,
  description: descriptionSchema,
  imageUrl: imageUrlSchema,
  order: orderSchema,
  fileUploadId: fileUploadIdSchema,
});

const optionItemSchema = z.object({
  title: titleSchema,
  description: descriptionSchema,
  imageUrl: imageUrlSchema,
  order: orderSchema,
  fileUploadId: fileUploadIdSchema,
});

export const optionsInputSchema = z.object({
  questionId: questionIdSchema,
  options: z.array(optionItemSchema).min(1, "최소 1개 이상의 옵션이 필요합니다."),
});

export const optionUpdateSchema = z
  .object({
    title: titleSchema.optional(),
    description: descriptionSchema,
    imageUrl: imageUrlSchema,
    order: orderSchema.optional(),
  })
  .refine(data => Object.keys(data).length > 0, {
    message: "최소 하나의 필드를 수정해야 합니다.",
  });

export type OptionInput = z.infer<typeof optionInputSchema>;
export type OptionsInput = z.infer<typeof optionsInputSchema>;
export type OptionItem = z.infer<typeof optionItemSchema>;
export type OptionUpdate = z.infer<typeof optionUpdateSchema>;
