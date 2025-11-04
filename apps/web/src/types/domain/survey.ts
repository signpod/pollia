import { Survey, SurveyQuestion, SurveyQuestionType } from "@prisma/client";

export { SurveyQuestionType };

export type SurveyQuestionSummary = Pick<SurveyQuestion, "id" | "title" | "type" | "createdAt">;
export type SurveySummary = Pick<
  Survey,
  "id" | "title" | "description" | "imageUrl" | "createdAt" | "updatedAt"
>;
