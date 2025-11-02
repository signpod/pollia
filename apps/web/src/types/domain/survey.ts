import { SurveyQuestion, SurveyQuestionType } from "@prisma/client";

export { SurveyQuestionType };

export type SurveyQuestionSummary = Pick<
  SurveyQuestion,
  "id" | "title" | "type" | "createdAt"
>;
