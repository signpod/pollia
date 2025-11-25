import { z } from "zod";

const surveyIdSchema = z.string().min(1, "설문조사 ID가 필요합니다.");

const responseIdSchema = z.string().min(1, "응답 ID가 필요합니다.");

export const startResponseInputSchema = z.object({
  surveyId: surveyIdSchema,
});

export const completeResponseInputSchema = z.object({
  responseId: responseIdSchema,
});

export type StartResponseInput = z.infer<typeof startResponseInputSchema>;
export type CompleteResponseInput = z.infer<typeof completeResponseInputSchema>;
