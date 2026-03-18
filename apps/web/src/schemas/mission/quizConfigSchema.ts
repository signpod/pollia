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

const DEFAULT_QUIZ_CONFIG: QuizConfig = {
  gradingMode: "instant",
  showExplanation: true,
  showCorrectOnWrong: true,
  shuffleQuestions: false,
  shuffleChoices: false,
};

export function parseQuizConfig(raw: unknown): QuizConfig {
  if (!raw || typeof raw !== "object") return DEFAULT_QUIZ_CONFIG;
  const obj = raw as Record<string, unknown>;
  return {
    gradingMode: obj.gradingMode === "final" ? "final" : "instant",
    showExplanation: typeof obj.showExplanation === "boolean" ? obj.showExplanation : true,
    showCorrectOnWrong: typeof obj.showCorrectOnWrong === "boolean" ? obj.showCorrectOnWrong : true,
    shuffleQuestions: typeof obj.shuffleQuestions === "boolean" ? obj.shuffleQuestions : false,
    shuffleChoices: typeof obj.shuffleChoices === "boolean" ? obj.shuffleChoices : false,
  };
}
