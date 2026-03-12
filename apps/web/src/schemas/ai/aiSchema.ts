import { z } from "zod";

export const AI_PROMPT_MAX_LENGTH = 1_000_000;

export const runAiPromptInputSchema = z.object({
  prompt: z
    .string()
    .trim()
    .min(1, "프롬프트를 입력해주세요.")
    .max(AI_PROMPT_MAX_LENGTH, `프롬프트는 ${AI_PROMPT_MAX_LENGTH}자를 초과할 수 없습니다.`),
});

export const aiStructuredOutputSchema = z.object({
  result: z.string().trim().min(1, "AI 결과가 비어 있습니다."),
});

export type RunAiPromptInput = z.input<typeof runAiPromptInputSchema>;
export type AiStructuredOutput = z.output<typeof aiStructuredOutputSchema>;
