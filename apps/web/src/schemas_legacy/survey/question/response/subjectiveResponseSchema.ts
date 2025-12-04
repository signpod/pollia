import { z } from "zod";

/**
 * 주관식 액션 응답 스키마
 */
export const subjectiveResponseSchema = z.object({
  actionId: z.string().min(1, "액션 ID가 필요해요."),
  textResponse: z
    .string()
    .min(1, "필수 입력 항목이에요.")
    .max(100, "최대 100자까지 입력할 수 있어요.")
    .trim(),
});

export type SubjectiveResponseData = z.infer<typeof subjectiveResponseSchema>;
