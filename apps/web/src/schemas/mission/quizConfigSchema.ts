import { z } from "zod";

const gradingModeSchema = z.enum(["instant", "final"]);

export const quizConfigSchema = z.object({
  gradingMode: gradingModeSchema.default("instant"),
  showExplanation: z.boolean().default(true),
  showCorrectOnWrong: z.boolean().default(true),
  shuffleQuestions: z.boolean().default(false),
  shuffleChoices: z.boolean().default(false),
});

export type QuizConfig = z.infer<typeof quizConfigSchema>;
