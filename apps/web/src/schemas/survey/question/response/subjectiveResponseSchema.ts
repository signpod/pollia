import { z } from "zod";

/**
 * 주관식 질문 응답 스키마
 */
export const subjectiveResponseSchema = z.object({
  questionId: z.string().min(1, "질문 ID가 필요합니다."),
  textResponse: z
    .string()
    .min(1, "응답을 입력해주세요.")
    .max(100, "응답은 100자를 초과할 수 없습니다.")
    .trim(),
});

export type SubjectiveResponseData = z.infer<typeof subjectiveResponseSchema>;
