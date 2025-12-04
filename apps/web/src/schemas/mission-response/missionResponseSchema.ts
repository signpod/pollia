import { z } from "zod";

const missionIdSchema = z.string().min(1, "미션 ID가 필요합니다.");

const responseIdSchema = z.string().min(1, "응답 ID가 필요합니다.");

export const startResponseInputSchema = z.object({
  missionId: missionIdSchema,
});

export const completeResponseInputSchema = z.object({
  responseId: responseIdSchema,
});

export type StartResponseInput = z.infer<typeof startResponseInputSchema>;
export type CompleteResponseInput = z.infer<typeof completeResponseInputSchema>;
