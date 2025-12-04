import { z } from "zod";

const titleSchema = z
  .string()
  .min(1, "제목을 입력해주세요.")
  .max(30, "제목은 30자를 초과할 수 없습니다.")
  .trim();

const descriptionSchema = z
  .string()
  .max(100, "설명은 100자를 초과할 수 없습니다.")
  .nullish()
  .transform(val => val || undefined);

const targetSchema = z
  .string()
  .max(50, "대상은 50자를 초과할 수 없습니다.")
  .nullish()
  .transform(val => val || undefined);

const imageUrlSchema = z
  .url({ message: "올바른 URL 형식이 아닙니다." })
  .nullish()
  .transform(val => val || undefined);

const deadlineSchema = z.date().optional();

const estimatedMinutesSchema = z
  .number()
  .int("예상 소요 시간은 정수여야 합니다.")
  .positive("예상 소요 시간은 양수여야 합니다.")
  .max(120, "예상 소요 시간은 120분을 초과할 수 없습니다.")
  .optional();

const questionIdsSchema = z
  .array(z.string().min(1, "질문 ID가 비어있습니다."))
  .min(1, "최소 1개 이상의 질문이 필요합니다.");

export const surveyInputSchema = z.object({
  title: titleSchema,
  description: descriptionSchema,
  target: targetSchema,
  imageUrl: imageUrlSchema,
  deadline: deadlineSchema,
  estimatedMinutes: estimatedMinutesSchema,
  questionIds: questionIdsSchema,
});

export const surveyUpdateSchema = z
  .object({
    title: titleSchema.optional(),
    description: z.string().max(100, "설명은 100자를 초과할 수 없습니다.").optional(),
    target: z.string().max(50, "대상은 50자를 초과할 수 없습니다.").optional(),
    imageUrl: z.url({ message: "올바른 URL 형식이 아닙니다." }).optional(),
    deadline: z.date().optional(),
    estimatedMinutes: estimatedMinutesSchema,
  })
  .refine(data => Object.keys(data).length > 0, {
    message: "최소 하나의 필드를 수정해야 합니다.",
  });

export type SurveyInput = z.infer<typeof surveyInputSchema>;
export type SurveyUpdate = z.infer<typeof surveyUpdateSchema>;
