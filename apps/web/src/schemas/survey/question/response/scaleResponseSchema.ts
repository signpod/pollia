import { z } from "zod";

/**
 * 척도형 질문 응답 스키마
 */
export const scaleResponseSchema = z.object({
  questionId: z.string().min(1, "질문 ID가 필요합니다."),
  scaleValue: z
    .number()
    .int("척도 값은 정수여야 합니다.")
    .min(1, "척도 값은 최소 1입니다.")
    .max(5, "척도 값은 최대 5입니다."),
});

export type ScaleResponseData = z.infer<typeof scaleResponseSchema>;
