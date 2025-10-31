import { SurveyQuestionType } from "@prisma/client";
import { SurveyQuestionSummary } from "@/types/domain/survey";

const typeOrder: Record<SurveyQuestionType, number> = {
  EITHER_OR: 0,
  SCALE: 1,
  MULTIPLE_CHOICE: 2,
  SUBJECTIVE: 3,
};

export function getSortedQuestions(questions: SurveyQuestionSummary[]) {
  return [...questions].sort((a, b) => {
    const typeComparison = typeOrder[a.type] - typeOrder[b.type];
    if (typeComparison !== 0) {
      return typeComparison;
    }

    return b.createdAt.getTime() - a.createdAt.getTime();
  });
}
