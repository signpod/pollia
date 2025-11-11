import { z } from "zod";

/**
 * 객관식 질문 응답 스키마
 */
export const multipleChoiceResponseSchema = z.object({
  questionId: z.string().min(1, "질문 ID가 필요합니다."),
  selectedOptionIds: z
    .array(z.string())
    .min(1, "최소 1개 이상의 항목을 선택해주세요.")
    .refine(arr => new Set(arr).size === arr.length, "중복된 선택은 허용되지 않습니다."),
});

export type MultipleChoiceResponseData = z.infer<typeof multipleChoiceResponseSchema>;
