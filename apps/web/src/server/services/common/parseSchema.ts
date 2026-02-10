import type { z } from "zod";

export function parseSchema<T extends z.ZodTypeAny>(schema: T, input: unknown): z.output<T> {
  const result = schema.safeParse(input);
  if (!result.success) {
    const error = new Error(result.error.issues[0]?.message || "유효성 검사 실패");
    error.cause = 400;
    throw error;
  }
  return result.data;
}
